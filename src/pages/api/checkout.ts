import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
import { supabase, type Product } from '../../lib/supabase';

export const prerender = false;

type Incoming = { items?: Array<{ slug: string; qty: number }> };

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Incoming;
    if (!body.items || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }
    const slugs = body.items.map((i) => i.slug);
    const { data, error } = await supabase.from('groundwork_products').select('*').in('slug', slugs);
    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Products not found' }), { status: 400 });
    }
    const products = data as Product[];

    const line_items = body.items.map((it) => {
      const p = products.find((x) => x.slug === it.slug);
      if (!p) return null;
      return {
        price_data: {
          currency: (p.currency || 'USD').toLowerCase(),
          product_data: {
            name: p.name,
            description: p.short_description || undefined,
            images: p.image_url ? [p.image_url] : undefined,
            metadata: { slug: p.slug },
          },
          unit_amount: p.price_pence,
        },
        quantity: Math.max(1, Math.min(20, it.qty || 1)),
      };
    }).filter(Boolean) as any[];

    if (line_items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items unavailable' }), { status: 400 });
    }

    const origin = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB'] },
      billing_address_collection: 'auto',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { slugs: slugs.join(',') },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
