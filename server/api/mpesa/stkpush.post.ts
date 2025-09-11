// server/api/mpesa/stkpush.post.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'
import type {  Database } from '@/types/database.types'
import { serverSupabaseClient } from '#supabase/server'

type StkPushBody = {
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
  const supabase = await serverSupabaseClient<Database>(event)

  const body = (await readBody(event)) as StkPushBody

  // validation
  if (!body?.payerMsisdn || !/^254(7|1)\d{8}$/.test(body.payerMsisdn)) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'Invalid payer number.' }
  }
  if (!body?.recipientMsisdn || !/^254(7|1)\d{8}$/.test(body.recipientMsisdn)) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'Invalid recipient number.' }
  }
  if (!Number.isInteger(body.amount) || body.amount <= 0) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'Amount must be a positive integer.' }
  }

  // build insert object matching mpesa_payments.Insert
  const insertObj: Database['public']['Tables']['mpesa_payments']['Insert'] = {
    account_reference: body.recipientMsisdn,
    amount: body.amount,
    business_shortcode: env('MPESA_SHORTCODE'),
    callback_url: env('MPESA_CALLBACK_URL') || `${process.env.NUXT_PUBLIC_SITE_URL}/api/mpesa/callback`,
    party_a_msisdn: body.payerMsisdn,
    party_b_shortcode: env('MPESA_SHORTCODE'),
    phone_number_msisdn: body.payerMsisdn,
    transaction_type: 'CustomerPayBillOnline',
    // optional fields can be omitted; status has default? If not, set:
    status: 'initiated'
    // other optional: transaction_desc, etc.
  }

  const { data: mpesaRow, error: insertError } = await supabase
    .from('mpesa_payments')
    .insert(insertObj)
    .select('*')
    .single()

  if (insertError || !mpesaRow) {
    console.error('mpesa insert error', insertError)
    setResponseStatus(event, 500)
    return { ok: false, message: 'Failed to create payment record.' }
  }

  // STK Push with Daraja
  const baseUrl = env('SAFARICOM_BASE_URL')
  const consumerKey = env('MPESA_CONSUMER_KEY')
  const consumerSecret = env('MPESA_CONSUMER_SECRET')
  const passkey = env('MPESA_PASSKEY')
  const shortcode = env('MPESA_SHORTCODE')

  const callbackEnv = env('MPESA_CALLBACK_URL', false) || process.env.NUXT_PUBLIC_SITE_URL || ''
  const callbackUrl = callbackEnv.endsWith('/api/mpesa/callback')
    ? callbackEnv
    : `${callbackEnv.replace(/\/$/, '')}/api/mpesa/callback`

  const token = await getAccessToken(baseUrl, consumerKey, consumerSecret)
  const timestamp = yyyymmddHHMMSS()
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  const stkPayload = {
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

  const stkRes: any = await $fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: stkPayload
  })

  // Build update object using Update type
  const updateObj: Partial<Database['public']['Tables']['mpesa_payments']['Update']> = {}

  if (stkRes.ResponseCode !== undefined) {
    updateObj.response_code = stkRes.ResponseCode
    updateObj.status = stkRes.ResponseCode === '0' ? 'awaiting_customer' : 'failed'
  }
  if (stkRes.ResponseDescription !== undefined) {
    updateObj.response_description = stkRes.ResponseDescription
  }
  if (stkRes.CustomerMessage !== undefined) {
    updateObj.customer_message = stkRes.CustomerMessage
  }
  if (stkRes.MerchantRequestID) {
    updateObj.merchant_request_id = stkRes.MerchantRequestID
  }
  if (stkRes.CheckoutRequestID) {
    updateObj.checkout_request_id = stkRes.CheckoutRequestID
  }

  const { error: updateError } = await supabase
    .from('mpesa_payments')
    .update(updateObj)
    .eq('id', mpesaRow.id)

  if (updateError) {
    console.error('mpesa update error', updateError)
    // do not necessarily fail response
  }

  if (stkRes.ResponseCode === '0') {
    return {
      ok: true,
      message: stkRes.CustomerMessage ?? 'STK Push initiated, check phone.',
      mpesa_payment_id: mpesaRow.id,
      checkoutRequestID: stkRes.CheckoutRequestID,
      merchantRequestID: stkRes.MerchantRequestID
    }
  } else {
    setResponseStatus(event, 400)
    return { ok: false, message: stkRes.errorMessage ?? stkRes.ResponseDescription ?? 'STK push failed.' }
  }
})
