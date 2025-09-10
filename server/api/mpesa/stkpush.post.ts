// server/api/mpesa/stkpush.post.ts
import type { H3Event} from 'h3';
import { defineEventHandler, readBody, setResponseStatus } from 'h3'

type Body = {
  payerMsisdn: string
  recipientMsisdn: string
  amount: number
}

type StkResponse =
  | { ok: true; message: string; checkoutRequestID: string; merchantRequestID: string }
  | { ok: false; message: string; code?: string | number }

function env(name: string, required = true): string {
  const v = process.env[name]
  if (required && !v) throw new Error(`Missing environment variable: ${name}`)
  return v as string
}

function yyyymmddHHMMSS(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    date.getFullYear().toString() +
    p(date.getMonth() + 1) +
    p(date.getDate()) +
    p(date.getHours()) +
    p(date.getMinutes()) +
    p(date.getSeconds())
  )
}

async function getAccessToken(baseUrl: string, key: string, secret: string): Promise<string> {
  const cred = Buffer.from(`${key}:${secret}`).toString('base64')
  const res = await $fetch<{ access_token: string; expires_in: string }>(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: { Authorization: `Basic ${cred}` }
    }
  )
  return res.access_token
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = (await readBody(event)) as Body
    // Basic input validation (server-side)
    if (!body?.payerMsisdn || !/^254(7|1)\d{8}$/.test(body.payerMsisdn)) {
      setResponseStatus(event, 400)
      return <StkResponse>{ ok: false, message: 'Invalid payer number.' }
    }
    if (!body?.recipientMsisdn || !/^254(7|1)\d{8}$/.test(body.recipientMsisdn)) {
      setResponseStatus(event, 400)
      return <StkResponse>{ ok: false, message: 'Invalid recipient number.' }
    }
    if (!Number.isInteger(body?.amount) || body.amount <= 0) {
      setResponseStatus(event, 400)
      return <StkResponse>{ ok: false, message: 'Amount must be a positive whole number.' }
    }

    const baseUrl = env('SAFARICOM_BASE_URL')
    const consumerKey = env('MPESA_CONSUMER_KEY')
    const consumerSecret = env('MPESA_CONSUMER_SECRET')
    const passkey = env('MPESA_PASSKEY')
    const shortcode = env('MPESA_SHORTCODE')

    // Prefer explicit callback; else derive from public URL envs.
    const callbackEnv =
      process.env.MPESA_CALLBACK_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      ''
    if (!callbackEnv) {
      // You should set MPESA_CALLBACK_URL to your deployed HTTPS URL
      // e.g., https://your-domain.tld/api/mpesa/callback
      throw new Error('Missing MPESA_CALLBACK_URL / NUXT_PUBLIC_SITE_URL / SITE_URL')
    }
    const callbackUrl = callbackEnv.endsWith('/api/mpesa/callback')
      ? callbackEnv
      : `${callbackEnv.replace(/\/$/, '')}/api/mpesa/callback`

    // OAuth
    const token = await getAccessToken(baseUrl, consumerKey, consumerSecret)

    // Build password (Shortcode + Passkey + Timestamp) then base64
    const timestamp = yyyymmddHHMMSS()
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    // AccountReference uses recipient number (per your requirement)
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: body.amount,
      PartyA: body.payerMsisdn,
      PartyB: shortcode,
      PhoneNumber: body.payerMsisdn,
      CallBackURL: callbackUrl,
      AccountReference: body.recipientMsisdn,
      TransactionDesc: `Airtime for ${body.recipientMsisdn}`
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stkRes = await $fetch<any>(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    // Typical success payload: { MerchantRequestID, CheckoutRequestID, ResponseCode, ResponseDescription, CustomerMessage }
    if (stkRes?.ResponseCode === '0') {
      return <StkResponse>{
        ok: true,
        message: stkRes?.CustomerMessage || 'STK Push sent. Check your phone.',
        checkoutRequestID: stkRes?.CheckoutRequestID,
        merchantRequestID: stkRes?.MerchantRequestID
      }
    } else {
      setResponseStatus(event, 400)
      return <StkResponse>{
        ok: false,
        message: stkRes?.errorMessage || stkRes?.ResponseDescription || 'STK Push failed.'
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('STK Push error:', e?.response || e)
    setResponseStatus(event, e?.statusCode || 500)
    return <StkResponse>{ ok: false, message: e?.data?.errorMessage || e?.message || 'Server error.' }
  }
})