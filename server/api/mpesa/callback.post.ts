import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  return {
    ok: false,
    message: 'M-Pesa callback endpoint is disabled. No environment variables are required for this static site.'
  }
})
