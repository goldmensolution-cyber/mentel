// server/api/mpesa/stkpush.post.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import type { Database } from '~~/app/types/database.types'

import { serverSupabaseServiceRole } from '#supabase/server' // server service role client (admin)
import type { H3Event } from 'h3'

type Body = {
  payerMsisdn: string
  recipientMsisdn: string
  amount: number
}

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
  const res = await $fetch<{ access_token: string }>(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { method: 'GET', headers: { Authorization: `Basic ${cred}` } }
  )
  return res.access_token
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = (await readBody(event)) as Body

    // validate
    if (!body?.payerMsisdn || !/^254(7|1)\d{8}$/.test(body.payerMsisdn)) {
      setResponseStatus(event, 400)
      return { ok: false, message: 'Invalid payer number.' }
    }
    if (!body?.recipientMsisdn || !/^254(7|1)\d{8}$/.test(body.recipientMsisdn)) {
      setResponseStatus(event, 400)
      return { ok: false, message: 'Invalid recipient number.' }
    }
    if (!Number.isInteger(body?.amount) || body.amount <= 0) {
      setResponseStatus(event, 400)
      return { ok: false, message: 'Amount must be a positive whole number.' }
    }

    // create supabase admin client (service role)
  const supabase = serverSupabaseServiceRole<Database>(event)

// Prepare insert payload: only fields in Database['public']['Tables']['mpesa_payments']['Insert']
  const insertPayload: Database['public']['Tables']['mpesa_payments']['Insert'] = {
    // for example, if business_shortcode has a default or nullable, maybe optional
    business_shortcode: process.env.MPESA_SHORTCODE ?? '',
    transaction_type: 'CustomerPayBillOnline',
    amount: body.amount,
    party_a_msisdn: body.payerMsisdn,
    phone_number_msisdn: body.payerMsisdn,
    party_b_shortcode: process.env.MPESA_SHORTCODE ?? '',
    callback_url: process.env.MPESA_CALLBACK_URL || `${process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''}/api/mpesa/callback`,
    account_reference: body.recipientMsisdn,
    transaction_desc: `Airtime for ${body.recipientMsisdn}`,
    status: 'initiated'
    // other fields that are insertable
  }

  const { data: mpesaRow, error: insertErr } = await supabase
    .from('mpesa_payments')
    .insert(insertPayload)
    .select('*')
    .single()  // ensures data: mpesa_payments.Row | null

  if (insertErr || !mpesaRow) {
    console.error('Insert error', insertErr)
    setResponseStatus(event, 500)
    return { ok: false, message: 'Failed to create mpesa_payments row' }
  }



    // Build STK payload and call Daraja
    const baseUrl = env('SAFARICOM_BASE_URL')
    const consumerKey = env('MPESA_CONSUMER_KEY')
    const consumerSecret = env('MPESA_CONSUMER_SECRET')
    const passkey = env('MPESA_PASSKEY')
    const shortcode = env('MPESA_SHORTCODE')

    const callbackEnv =
      process.env.MPESA_CALLBACK_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      ''
    if (!callbackEnv) throw new Error('Missing MPESA_CALLBACK_URL / NUXT_PUBLIC_SITE_URL / SITE_URL')
    const callbackUrl = callbackEnv.endsWith('/api/mpesa/callback')
      ? callbackEnv
      : `${callbackEnv.replace(/\/$/, '')}/api/mpesa/callback`

    const token = await getAccessToken(baseUrl, consumerKey, consumerSecret)
    const timestamp = yyyymmddHHMMSS()
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

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

    // send STK Push
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stkRes: any = await $fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    // Update mpesa_payments with daraja response fields
    const updatePayload: Record<string, any> = {
      response_code: stkRes?.ResponseCode ?? null,
      response_description: stkRes?.ResponseDescription ?? null,
      customer_message: stkRes?.CustomerMessage ?? null
    }

    if (stkRes?.MerchantRequestID) updatePayload.merchant_request_id = stkRes.MerchantRequestID
    if (stkRes?.CheckoutRequestID) updatePayload.checkout_request_id = stkRes.CheckoutRequestID

    // set status pending if ResponseCode === '0' else failed
    updatePayload.status = stkRes?.ResponseCode === '0' ? 'pending' : 'failed'

    const { error: updateErr } = await supabase
      .from('mpesa_payments')
      .update(updatePayload)
      .eq('id', mpesaRow.id)

    if (updateErr) console.error('Failed to update mpesa_payments after STK push', updateErr)

    if (stkRes?.ResponseCode === '0') {
      return {
        ok: true,
        message: stkRes?.CustomerMessage || 'STK Push sent. Check your phone.',
        mpesa_payment_id: mpesaRow.id,
        checkoutRequestID: stkRes?.CheckoutRequestID,
        merchantRequestID: stkRes?.MerchantRequestID
      }
    }

    setResponseStatus(event, 400)
    return { ok: false, message: stkRes?.errorMessage || stkRes?.ResponseDescription || 'STK Push failed.' }
  } catch (e: any) {
    console.error('STK Push error:', e?.response || e)
    setResponseStatus(event, e?.statusCode || 500)
    return { ok: false, message: e?.message || 'Server error.' }
  }
})
