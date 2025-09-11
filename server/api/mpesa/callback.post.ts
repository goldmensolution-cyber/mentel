/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// server/api/mpesa/callback.post.ts
import { defineEventHandler, readBody } from 'h3'
import type { H3Event } from 'h3'
import type { Database } from '~~/app/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)

  const stk = body?.Body?.stkCallback
  if (!stk) {
    // maybe Insert with default or required fields; pick only fields allowed in Insert type
    const insertPayload: Database['public']['Tables']['mpesa_payments']['Insert'] = {
      // fill minimal required fields
      amount: 0,
      phone_number_msisdn: '',  // if that's nullable
      party_a_msisdn: '',
      business_shortcode: process.env.MPESA_SHORTCODE ?? '',
      party_b_shortcode: process.env.MPESA_SHORTCODE ?? '',
      callback_url: '',
      account_reference: '',
      transaction_desc: 'Malformed Callback',
      status: 'failed',
      // etc
    }

    await supabase.from('mpesa_payments').insert(insertPayload)
    return { ResultCode: 0, ResultDesc: 'OK' }
  }

  // extract metadata
  const resultCode: number = stk.ResultCode
  const resultDesc: string = stk.ResultDesc

  const items = stk.CallbackMetadata?.Item as Array<{ Name: string; Value?: any }> || []
  const meta: Record<string, any> = {}
  for (const it of items) { meta[it.Name] = it.Value }

  const updatePayload: Partial<Database['public']['Tables']['mpesa_payments']['Update']> = {
    result_code: resultCode,
    result_desc: resultDesc,
    paid_amount: meta.Amount ?? null,
    mpesa_receipt_number: meta.MpesaReceiptNumber ?? null,
    transaction_time: meta.TransactionDate ? new Date(meta.TransactionDate).toISOString() : null,
    payer_msisdn: meta.PhoneNumber ?? null,
    callback_raw: body,
    status: resultCode === 0 ? 'initiated' : 'failed'
  }

  // try update by checkout_request_id
  const { data: updated1, error: err1 } = await supabase
    .from('mpesa_payments')
    .update(updatePayload)
    .eq('checkout_request_id', stk.CheckoutRequestID)
    .select('*')

  let updated = updated1
  if (!updated || updated.length === 0) {
    const { data: updated2, error: err2 } = await supabase
      .from('mpesa_payments')
      .update(updatePayload)
      .eq('merchant_request_id', stk.MerchantRequestID)
      .select('*')
    updated = updated2
  }

  if (!updated || updated.length === 0) {
    // insert new
    const insertPayload: Database['public']['Tables']['mpesa_payments']['Insert'] = {
      amount: meta.Amount ?? 0,
      phone_number_msisdn: meta.PhoneNumber ?? null,
      party_a_msisdn: meta.PhoneNumber ?? null,
      business_shortcode: process.env.MPESA_SHORTCODE ?? '',
      party_b_shortcode: process.env.MPESA_SHORTCODE ?? '',
      callback_url: '',
      account_reference: '',
      transaction_desc: resultDesc,
      merchant_request_id: stk.MerchantRequestID ?? undefined,
      checkout_request_id: stk.CheckoutRequestID ?? undefined,
      status: resultCode === 0 ? 'initiated' : 'failed'
      // etc
    }
    await supabase.from('mpesa_payments').insert(insertPayload)
  }

  return { ResultCode: 0, ResultDesc: 'OK' }
})
