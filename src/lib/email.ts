const RESEND_API = 'https://api.resend.com/emails';

type SendOpts = {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(opts: SendOpts): Promise<{ id?: string; error?: string }> {
  const key = import.meta.env.RESEND_API_KEY as string;
  if (!key) return { error: 'RESEND_API_KEY not set' };
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: opts.from || 'Groundwork Coffee <onboarding@resend.dev>',
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { error: data.message || `HTTP ${res.status}` };
    return { id: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'unknown' };
  }
}
