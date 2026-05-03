// server/api/mpesa/stkpush.post.ts
import { defineEventHandler, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 410)
  return {
    ok: false,
    message: 'Airtime purchase endpoint disabled. Please complete payment via M-Pesa Paybill as instructed on the homepage.'
  }
})
