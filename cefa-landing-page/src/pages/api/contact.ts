/**
 * POST /api/contact
 *
 * Controlador de formulario de contacto de nivel empresarial:
 *   • Limitación de tasa (rate limiting) en memoria (reemplazar con Redis/Upstash para despliegues multi-instancia)
 *   • Detección de bots mediante campo trampa (honeypot)
 *   • Validación y saneamiento de entradas
 *   • Verificación de CAPTCHA Cloudflare Turnstile
 *   • Transporte seleccionable vía variable de entorno CONTACT_TRANSPORT:
 *       "console" → imprime en servidor (por defecto / desarrollo)
 *       "smtp"    → envía por SMTP Office 365 vía Nodemailer
 *
 * Variables de entorno requeridas:
 *   TURNSTILE_SECRET_KEY  — clave secreta de Cloudflare Turnstile
 *
 * Variables de entorno según el transporte:
 *   CONTACT_TRANSPORT     — "console" | "smtp" (por defecto: "console")
 *   SMTP_HOST             — servidor SMTP (ej. smtp.office365.com)
 *   SMTP_PORT             — puerto SMTP (ej. 587)
 *   SMTP_USER             — usuario/cuenta SMTP completa
 *   SMTP_PASS             — contraseña SMTP
 */

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const BLOCK_MS = 600_000;
const RL_MAP = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of RL_MAP) {
    if (now > entry.blockedUntil && now - entry.windowStart > WINDOW_MS) {
      RL_MAP.delete(key);
    }
  }
}, 300_000);

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  let entry = RL_MAP.get(ip);

  if (!entry) {
    RL_MAP.set(ip, { count: 1, windowStart: now, blockedUntil: 0 });
    return { ok: true, retryAfter: 0 };
  }

  if (now < entry.blockedUntil) {
    return { ok: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  if (now - entry.windowStart >= WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    entry.blockedUntil = 0;
    RL_MAP.set(ip, entry);
    return { ok: true, retryAfter: 0 };
  }

  entry.count++;
  if (entry.count > MAX_PER_WINDOW) {
    entry.blockedUntil = now + BLOCK_MS;
    RL_MAP.set(ip, entry);
    return { ok: false, retryAfter: Math.ceil(BLOCK_MS / 1000) };
  }

  RL_MAP.set(ip, entry);
  return { ok: true, retryAfter: 0 };
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_SUBJECTS = new Set(['products', 'partner', 'quality', 'other']);

function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v) && v.length <= 254;
}

/** Elimina caracteres que podrían causar inyección en logs, HTML o cabeceras */
function sanitize(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/\r\n|\r|\n/g, '\n')
    .trim();
}

const TURNSTILE_SECRET =
  import.meta.env.TURNSTILE_SECRET_KEY ?? '1x0000000000000000000000000000000AA';
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extra },
  });
}

interface ContactPayload {
  name: string;
  company: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  products: 'Información sobre productos',
  partner: 'Colaboración',
  quality: 'Calidad y certificaciones',
  other: 'Otro',
};

function transportConsole(payload: ContactPayload): void {
  const ts = new Date().toISOString();
  const bar = '═'.repeat(62);
  const lines = [
    `╔${bar}╗`,
    `║  📧  NUEVO ENVÍO DE FORMULARIO DE CONTACTO — ${ts}`,
    `╠${bar}╣`,
    `║  Name:    ${payload.name}`,
    `║  Email:   ${payload.email}`,
    `║  Company: ${payload.company || '—'}`,
    `║  Subject: ${SUBJECT_LABELS[payload.subject] ?? payload.subject}`,
    `║  IP:      ${payload.ip}`,
    `╠${bar}╣`,
    `║  Message:`,
    ...payload.message.split('\n').map((l) => `║    ${l}`),
    `╚${bar}╝`,
  ];
  console.log('\n' + lines.join('\n') + '\n');
}

let _smtpTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getSmtpTransporter(): ReturnType<typeof nodemailer.createTransport> {
  if (!_smtpTransporter) {
    const user = import.meta.env.SMTP_USER;
    const pass = import.meta.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error('SMTP_USER and SMTP_PASS env vars are required when CONTACT_TRANSPORT=smtp');
    }

    _smtpTransporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST ?? 'smtp.office365.com',
      port: Number(import.meta.env.SMTP_PORT ?? 587),
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: {
        minVersion: 'TLSv1.2',
      },
    });
  }
  return _smtpTransporter;
}

async function transportSmtp(payload: ContactPayload): Promise<void> {
  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject;

  await getSmtpTransporter().sendMail({
    from: `"CEFA Web" <${import.meta.env.SMTP_USER}>`,
    to: import.meta.env.CONTACT_TO_EMAIL,
    replyTo: payload.email,
    subject: `[Web] ${subjectLabel} — ${payload.name}`,
    text: [
      `Nombre:   ${payload.name}`,
      `Empresa:  ${payload.company || '—'}`,
      `Email:    ${payload.email}`,
      `Asunto:   ${subjectLabel}`,
      `IP:       ${payload.ip}`,
      '',
      '─'.repeat(48),
      '',
      payload.message,
    ].join('\n'),
  });
}

async function dispatch(payload: ContactPayload): Promise<void> {
  const transport = (import.meta.env.CONTACT_TRANSPORT ?? 'console').toLowerCase();

  if (transport === 'smtp') {
    await transportSmtp(payload);
  } else {
    transportConsole(payload);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    return json({ success: false, code: 'UNSUPPORTED_MEDIA_TYPE' }, 415);
  }

  const ip = (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  ).substring(0, 45);

  const rl = rateLimit(ip);
  if (!rl.ok) {
    return json({ success: false, code: 'RATE_LIMITED' }, 429, {
      'Retry-After': String(rl.retryAfter),
    });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ success: false, code: 'BODY_READ_ERROR' }, 400);
  }

  if (raw.length > 20_000) {
    return json({ success: false, code: 'PAYLOAD_TOO_LARGE' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('not an object');
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ success: false, code: 'INVALID_JSON' }, 400);
  }

  if (body.website !== '' && body.website !== undefined) {
    console.warn(`[contact] honeypot triggered — ip=${ip}`);
    return json({ success: true }, 200);
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : '');

  const name = str(body.name);
  const company = str(body.company);
  const email = str(body.email);
  const subject = str(body.subject);
  const message = str(body.message);
  const cfToken = str(body.cfToken);

  type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message' | 'company', string>>;
  const errors: FieldErrors = {};

  if (!name.trim()) errors.name = 'required';
  else if (name.length > 120) errors.name = 'too_long';

  if (!email.trim()) errors.email = 'required';
  else if (!isValidEmail(email.trim())) errors.email = 'invalid';

  if (!subject) errors.subject = 'required';
  else if (!ALLOWED_SUBJECTS.has(subject)) errors.subject = 'invalid';

  if (!message.trim()) errors.message = 'required';
  else if (message.trim().length < 10) errors.message = 'too_short';
  else if (message.length > 5_000) errors.message = 'too_long';

  if (company.length > 120) errors.company = 'too_long';

  if (Object.keys(errors).length > 0) {
    return json({ success: false, code: 'VALIDATION_ERROR', errors }, 422);
  }

  if (!cfToken) {
    return json({ success: false, code: 'CAPTCHA_MISSING' }, 400);
  }

  const captchaOk = await verifyTurnstile(cfToken, ip);
  if (!captchaOk) {
    console.warn(`[contact] captcha failed — ip=${ip} email=${email}`);
    return json({ success: false, code: 'CAPTCHA_FAILED' }, 403);
  }

  const clean: ContactPayload = {
    name: sanitize(name),
    company: sanitize(company),
    email: sanitize(email).toLowerCase(),
    subject,
    message: sanitize(message),
    ip,
  };

  try {
    await dispatch(clean);
    console.info(`[contact] OK — transport=${import.meta.env.CONTACT_TRANSPORT ?? 'console'} to=${import.meta.env.CONTACT_TO_EMAIL} from=${clean.email} subject=${clean.subject} ip=${clean.ip}`);
  } catch (err) {
    console.error(`[contact] ERROR — transport=${import.meta.env.CONTACT_TRANSPORT ?? 'console'} to=${import.meta.env.CONTACT_TO_EMAIL} from=${clean.email} subject=${clean.subject} ip=${clean.ip}`, err);
    return json({ success: false, code: 'SEND_ERROR' }, 500);
  }

  return json({ success: true }, 200);
};

export const GET: APIRoute = () => json({ code: 'METHOD_NOT_ALLOWED' }, 405);
export const PUT: APIRoute = () => json({ code: 'METHOD_NOT_ALLOWED' }, 405);
export const PATCH: APIRoute = () => json({ code: 'METHOD_NOT_ALLOWED' }, 405);
export const DELETE: APIRoute = () => json({ code: 'METHOD_NOT_ALLOWED' }, 405);
