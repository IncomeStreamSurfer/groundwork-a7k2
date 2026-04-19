import type { APIRoute } from 'astro';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { sendEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature');
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET as string | undefined;
  const raw = await request.text();

  let event: any;
  try {
    if (sig && secret) {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } else {
      event = JSON.parse(raw);
    }
  } catch (e) {
    return new Response(`Webhook Error: ${e instanceof Error ? e.message : 'invalid'}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const email = session.customer_details?.email || session.customer_email || null;
    const name = session.customer_details?.name || null;
    let lineItems: any[] = [];
    try {
      const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 25, expand: ['data.price.product'] });
      lineItems = li.data.map((i) => ({ description: i.description, quantity: i.quantity, amount_total: i.amount_total, currency: i.currency }));
    } catch (_) {}

    await supabase.from('groundwork_orders').insert({
      stripe_session_id: session.id,
      customer_email: email,
      customer_name: name,
      amount_total_pence: session.amount_total,
      currency: session.currency,
      status: 'paid',
      line_items: lineItems,
      shipping_address: session.shipping_details || session.customer_details?.address || null,
    });

    if (email) {
      const rows = lineItems.map((i) => `<tr><td style="padding:8px 0;">${i.description} × ${i.quantity}</td><td style="text-align:right;padding:8px 0;">$${((i.amount_total||0)/100).toFixed(2)}</td></tr>`).join('');
      const total = ((session.amount_total || 0) / 100).toFixed(2);
      const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a0f08;"><h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;margin:0 0 8px;">Thanks for your order, ${name || 'friend'}!</h1><p style="line-height:1.6;color:#555;">Your coffee and gear are being prepared. Beans are roasted and shipped within 24 hours.</p><table style="width:100%;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:20px 0;">${rows}</table><p style="font-size:16px;"><strong>Total:</strong> $${total}</p><p style="font-size:13px;color:#888;margin-top:30px;">Questions? Just reply to this email.</p><p style="font-size:13px;color:#888;">— Groundwork Coffee Co.</p></div>`;
      await sendEmail({ to: email, subject: 'Your Groundwork Coffee order is confirmed', html });
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
