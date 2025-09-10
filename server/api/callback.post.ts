/* eslint-disable @typescript-eslint/no-explicit-any */
// server/api/mpesa/callback.post.ts
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Example structure (Daraja STK Callback):
    // body.Body.stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata: { Item: [...] } }
    const stk = body?.Body?.stkCallback
    const resultCode = stk?.ResultCode
    const resultDesc = stk?.ResultDesc
    const items: Array<{ Name: string; Value?: any }> = stk?.CallbackMetadata?.Item || []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: Record<string, any> = {}
    for (const it of items) meta[it.Name] = it.Value

    // TODO: Persist to DB (e.g., Supabase) and trigger vend if paid (ResultCode === 0).
    // const supabase = await serverSupabaseClient<Database>(event)
    // await supabase.from('mpesa_payments').upsert({ ... })

    console.log('M-Pesa callback:', {
      MerchantRequestID: stk?.MerchantRequestID,
      CheckoutRequestID: stk?.CheckoutRequestID,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
      Amount: meta.Amount,
      MpesaReceiptNumber: meta.MpesaReceiptNumber,
      PhoneNumber: meta.PhoneNumber,
      TransactionDate: meta.TransactionDate
    })

    // Daraja expects HTTP 200; body is typically ignored.
    return { ResultCode: 0, ResultDesc: 'OK' }
  } catch (e) {
    console.error('Callback parse error:', e)
    // Still return 200 to avoid retries storm; adjust to your retry policy.
    return { ResultCode: 0, ResultDesc: 'OK' }
  }
})