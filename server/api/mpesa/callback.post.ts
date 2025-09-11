/* eslint-disable @typescript-eslint/no-unused-vars */
// server/api/mpesa/callback.post.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineEventHandler, readBody } from 'h3'
import type { H3Event } from 'h3'
import type { Json, Database } from '@/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const body = (await readBody(event)) as any

  const stk = body?.Body?.stkCallback
  if (!stk) {
    // Insert minimal fallback
    const insertObj: Database['public']['Tables']['mpesa_payments']['Insert'] = {
      account_reference: '',
      amount: 0,
      business_shortcode: process.env.MPESA_SHORTCODE ?? '',
      callback_url: process.env.MPESA_CALLBACK_URL ?? '',
      party_a_msisdn: '',
      party_b_shortcode: process.env.MPESA_SHORTCODE ?? '',
      phone_number_msisdn: '',
      transaction_type: 'CustomerPayBillOnline',
      status: 'failed',
      transaction_desc: 'Malformed callback'
    }
    await supabase.from('mpesa_payments').insert(insertObj)
    return { ResultCode: 0, ResultDesc: 'OK' }
  }

  const resultCode: number = stk.ResultCode
  const resultDesc: string = stk.ResultDesc

  const items = (stk.CallbackMetadata?.Item as Array<{ Name: string; Value?: any }> | undefined) ?? []
  const meta: Record<string, any> = {}
  for (const it of items) {
    if (it.Name && it.Value !== undefined) {
      meta[it.Name] = it.Value
    }
  }

  const updateObj: Partial<Database['public']['Tables']['mpesa_payments']['Update']> = {
    result_code: resultCode,
    result_desc: resultDesc,
    paid_amount: meta.Amount ?? null,
    mpesa_receipt_number: meta.MpesaReceiptNumber ?? null,
    transaction_time: meta.TransactionDate ? String(new Date(meta.TransactionDate).toISOString()) : null,
    payer_msisdn: meta.PhoneNumber ?? null,
    callback_raw: body as Json,
    // status must be from payment_status_enum
    status: resultCode === 0 ? 'paid' : 'failed'
  }

  // Try updating by checkout_request_id
  const { data: updatedByCheckout, error: err1 } = await supabase
    .from('mpesa_payments')
    .update(updateObj)
    .eq('checkout_request_id', stk.CheckoutRequestID as string)
    .select('*')

  let updated = updatedByCheckout
  if ((!updated || updated.length === 0) && stk.MerchantRequestID) {
    const { data: updatedByMerchant, error: err2 } = await supabase
      .from('mpesa_payments')
      .update(updateObj)
      .eq('merchant_request_id', stk.MerchantRequestID as string)
      .select('*')
    updated = updatedByMerchant
  }

  if (!updated || updated.length === 0) {
    // Insert new record
    const insertObj: Database['public']['Tables']['mpesa_payments']['Insert'] = {
      account_reference: meta.AccountReference ?? '', // sometimes Callback Metadata may include AccountReference
      amount: meta.Amount ?? 0,
      business_shortcode: process.env.MPESA_SHORTCODE ?? '',
      callback_url: process.env.MPESA_CALLBACK_URL ?? '',
      party_a_msisdn: meta.PhoneNumber ?? '',
      party_b_shortcode: process.env.MPESA_SHORTCODE ?? '',
      phone_number_msisdn: meta.PhoneNumber ?? '',
      transaction_type: 'CustomerPayBillOnline',
      status: resultCode === 0 ? 'paid' : 'failed',
      // optional fields
      merchant_request_id: stk.MerchantRequestID ?? undefined,
      checkout_request_id: stk.CheckoutRequestID ?? undefined,
      transaction_desc: resultDesc,
      callback_raw: body as Json
    }
    await supabase.from('mpesa_payments').insert(insertObj)
  }

  // Always reply OK to Daraja so it won’t retry indefinitely
  return { ResultCode: 0, ResultDesc: 'OK' }
})
