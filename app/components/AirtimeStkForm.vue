<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- components/AirtimeStkForm.vue (disabled) -->
<script setup lang="ts">
/*
import { ref, computed, onUnmounted } from 'vue'
import { normalizeKeMsisdn, isValidKeMsisdnE164254 } from '~/utils/msisdn'

// --- NEW imports for realtime + toasts ---
// If you use generated DB types, import them and apply the generic to useSupabaseClient:
import type { Database } from '@/types/database.types'
// const supabase = useSupabaseClient<Database>()
const supabase = useSupabaseClient<Database>() // keep generic-less if your import path differs

// existing types
type StkPushRequest = {
  payerMsisdn: string
  recipientMsisdn: string
  amount: number
}

type StkPushResponse =
  | { ok: true; message: string; checkoutRequestID?: string; merchantRequestID?: string }
  | { ok: false; message: string; code?: string | number }

// existing refs
const loading = ref(false)
const payerInput = ref('')
const recipientInput = ref('')
const amountInput = ref<number | null>(null)

const payer = computed(() => normalizeKeMsisdn(payerInput.value))
const recipient = computed(() => normalizeKeMsisdn(recipientInput.value))

const errors = ref<string[]>([])
const info = ref<string | null>(null)
const success = ref<string | null>(null)
const warn = ref<string | null>(null)

// --- NEW: toast + channel refs ---
const toast = useToast()
let mpesaChannel: any = null
let kyandaChannel: any = null

// helper to safely remove channel (avoid stacking subscriptions)
async function removeChannelIfExists(channel: any) {
  try {
    if (!channel) return
    // supabase.removeChannel accepts the channel object
    // newer SDKs also let you call channel.unsubscribe()
    // use whichever works in your version; removeChannel is safe per docs.
    if (typeof supabase.removeChannel === 'function') {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await supabase.removeChannel(channel)
    } else if (typeof channel.unsubscribe === 'function') {
      await channel.unsubscribe()
    }
  } catch (e) {
    // ignore cleanup errors but log for debug
    // eslint-disable-next-line no-console
    console.warn('Error removing realtime channel', e)
  }
}

// cleanup on unmount
onUnmounted(async () => {
  await removeChannelIfExists(mpesaChannel)
  await removeChannelIfExists(kyandaChannel)
})

function validate(): boolean {
  errors.value = []
  success.value = null
  warn.value = null
  info.value = null

  if (!payer.value || !isValidKeMsisdnE164254(payer.value)) {
    errors.value.push('Enter a valid Safaricom payer number (e.g., 07XXXXXXXX, +2547XXXXXXXX).')
  }
  if (!recipient.value || !isValidKeMsisdnE164254(recipient.value)) {
    errors.value.push('Enter a valid recipient number (e.g., 07XXXXXXXX, +2547XXXXXXXX).')
  }
  if (amountInput.value == null || !Number.isInteger(amountInput.value) || amountInput.value <= 0) {
    errors.value.push('Amount must be a positive whole number (KES).')
  }

  return errors.value.length === 0
}

async function submit() {
  if (!validate()) return
  loading.value = true
  success.value = null
  info.value = 'Sending STK Push… Check your phone for the M-Pesa prompt.'

  try {
    const body: StkPushRequest = {
      payerMsisdn: payer.value,
      recipientMsisdn: recipient.value,
      amount: amountInput.value as number
    }

    const res = await $fetch<StkPushResponse>('/api/mpesa/stkpush', {
      method: 'POST',
      body
    })

    if (!res || !res.ok) {
      errors.value = [res?.message || 'Failed to initiate STK Push. Please try again.']
      loading.value = false
      return
    }

    // ------------- SUCCESS: set UI and create subscriptions -------------
    success.value = res.message || 'STK Push sent. Complete the prompt on your phone.'
    info.value = 'Awaiting M-Pesa confirmation…'

    // clear previous channels so they don't stack
    await removeChannelIfExists(mpesaChannel)
    await removeChannelIfExists(kyandaChannel)

    // choose the best matching key the server returned
    const checkoutId = (res as any).checkoutRequestID ?? null
    const merchantId = (res as any).merchantRequestID ?? null

    // 1) subscribe to mpesa_payments matching checkoutRequestID or merchantRequestID
    if (checkoutId || merchantId) {
      const filter = checkoutId ? `checkout_request_id=eq.${checkoutId}` : `merchant_request_id=eq.${merchantId}`
      mpesaChannel = supabase
        .channel(`mpesa_payment_${Date.now()}`) // unique channel id per submit
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mpesa_payments',
            filter
          },
          (payload: any) => {
            const newRow = payload?.new
            if (!newRow) return
            // NOTE: map to your DB enum values (example uses 'paid' and 'awaiting_customer')
            if (newRow.status === 'awaiting_customer') {
              info.value = 'MPESA: Awaiting customer to complete STK prompt.'
            } else if (newRow.status === 'paid') {
              success.value = `MPESA payment received (receipt: ${newRow.mpesa_receipt_number || 'N/A'})`
              info.value = 'Payment received. Waiting for vendor (kyanda) callback...'
              toast.add({
                title: 'M-Pesa payment received',
                description: newRow.mpesa_receipt_number ? `Receipt ${newRow.mpesa_receipt_number}` : 'Payment successful',
                color: 'success'
              })
            } else if (newRow.status === 'failed') {
              errors.value = [newRow.result_desc || 'M-Pesa transaction failed']
              toast.add({ title: 'M-Pesa failed', description: newRow.result_desc || '', color: 'error' })
            }
          }
        )
        .subscribe()
    }

    // 2) universal kyanda subscription (INSERTs)
    // we will attempt to match kyanda callbacks to this particular transaction
    kyandaChannel = supabase
      .channel(`kyanda_callbacks_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kyanda_callback' },
        async (payload: any) => {
          const kyRow = payload?.new
          if (!kyRow || !kyRow.data) return
          const ky = kyRow.data as Record<string, any>

          // QUICK MATCH: if vendor returned anything that equals our checkout/merchant ids
          let matched = false
          if (checkoutId || merchantId) {
            try {
              // attempt to find mpesa row by checkout or merchant id
              const { data: matches } = await supabase
                .from('mpesa_payments')
                .select('*')
                .or(
                  checkoutId && merchantId
                    ? `checkout_request_id.eq.${checkoutId},merchant_request_id.eq.${merchantId}`
                    : checkoutId
                    ? `checkout_request_id.eq.${checkoutId}`
                    : `merchant_request_id.eq.${merchantId}`
                )
                .limit(1)

              if (matches && matches.length > 0) {
                matched = true
                // Update local UI and show toast
                toast.add({
                  title: ky.status === 'Success' ? 'Airtime delivered' : 'Vendor response',
                  description: `${ky.message ?? ky.status} (${ky.transactionRef ?? ''})`,
                  color: ky.status === 'Success' ? 'success' : 'warning'
                })
                info.value = ky.status === 'Success' ? 'Airtime delivered by vendor' : ky.message
              }
            } catch (e) {
              // ignore query failures (RLS etc.), still show vendor toast below
              console.log(e)
            }
          }

          // HEURISTIC MATCH (fallback): amount + destination + recent time window
          if (!matched) {
            try {
              const minutesWindow = 10
              const cutoffIso = new Date(Date.now() - minutesWindow * 60 * 1000).toISOString()
              const { data: candidates } = await supabase
                .from('mpesa_payments')
                .select('*')
                .eq('amount', ky.amount)
                .eq('phone_number_msisdn', ky.destination)
                .gte('created_at', cutoffIso)
                .order('created_at', { ascending: false })
                .limit(1)

              if (candidates && candidates.length > 0) {
                matched = true
                toast.add({
                  title: ky.status === 'Success' ? 'Airtime delivered' : 'Vendor response',
                  description: `${ky.message ?? ky.status} (${ky.transactionRef ?? ''})`,
                  color: ky.status === 'Success' ? 'success' : 'warning'
                })
                info.value = ky.status === 'Success' ? 'Airtime delivered by vendor' : ky.message
                // optional: you could call a server endpoint here to reconcile the kyanda row with the mpesa row
              }
            } catch (e) {
              // query might fail due to RLS; ignore but still show a toast
              console.log(e)
            }
          }

          // If we didn't match, still show a toast (globally)
          if (!matched) {
            toast.add({
              title: 'Vendor callback',
              description: `${ky.message ?? ky.status} (${ky.transactionRef ?? ''})`,
              color: ky.status === 'Success' ? 'success' : 'neutral'
            })
          }
        }
      )
      .subscribe()
  } catch (err: any) {
    // keep your existing error flow but also show a toast
    errors.value = [err?.data?.message || err?.message || 'Unexpected error. Please try again.']
    toast.add({ title: 'STK push error', description: errors.value[0], color: 'error' })
  } finally {
    loading.value = false
  }
}
*/
</script>

<template>
  <!--
  <div class="max-w-xl relative mx-auto space-y-6">
    <UButton variant="outline" square class="bottom-2 right-2 fixed rounded-full  ">
    <UColorModeButton  />
    </UButton>
    <UCard class="divide-y-0">
      <template #header>
        <h1 class="text-4xl font-extrabold text-center">Mentel Airtime</h1>
        <p class="text-center">Buy airtime to airtel,telkom,faiba, safaricom and equitel numbers from Mpesa paybill</p>
      </template>


      <UCard variant="subtle">
        <template #header>
          <h1 class="text-center font-extrabold italic">Buy Airtime</h1>
        </template>
        <div>
  <UFormField label="Payer" help="We will send mpesa pin prompt here" required>
    <UInput
            id="payer"
            v-model="payerInput"
            placeholder="e.g. 07XXXXXXXX or +2547XXXXXXXX"
            icon="i-lucide-smartphone"
            :ui="{ root: 'w-full' }"
            autocomplete="tel"
            inputmode="tel"
          />
          </UFormField>
          <p v-if="payer" class="text-xs text-neutral-500 mt-1">Normalized: {{ payer }}</p>
        </div>

        <div>
  <UFormField label="Recipient" help="Recipient number(Account Number)" class="w-full" required>
    <UInput
            id="recipient"
            v-model="recipientInput"
            placeholder="e.g. 07XXXXXXXX or +2547XXXXXXXX"
            icon="i-lucide-user"
            :ui="{ root: 'w-full' }"
            autocomplete="tel"
            variant="subtle"
            inputmode="tel"
          />
          </UFormField>
          <p v-if="recipient" class="text-xs text-neutral-500 mt-1">Normalized: {{ recipient }}</p>
        </div>

  <UFormField label="Amount" help="Amount is a whole number in kenyan shillings" required>
    <UFieldGroup class="w-full">
      <UButton  variant="outline"  icon="i-lucide-wallet"/>

    <UInputNumber
            id="amount"
            v-model.number="amountInput"
            placeholder="Whole number, e.g. 50"
            :format-options="{
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'code',
      currencySign: 'accounting'
    }"
            :ui="{ root: 'w-full' }"
            inputmode="numeric"
            orientation="vertical"
            min="1"
            step="1"
          />
          </UFieldGroup>
</UFormField>
        <div class="space-y-2">
          <UAlert v-if="warn" color="warning" title="Please check" :description="warn" />
          <UAlert v-if="info" color="info" title="Heads up" :description="info" />
          <UAlert
            v-for="(e, idx) in errors"
            :key="idx"
            color="error"
            title="Validation error"
            :description="e"
          />
          <UAlert v-if="success" color="success" title="Success" :description="success" />
        </div>
        <template #footer>
        <div class="flex items-center gap-3">
          <UButton
            color="primary"
            :loading="loading"
            icon="i-lucide-credit-card"
            @click="submit"
          >
            Pay with M‑Pesa
          </UButton>
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-rotate-ccw"
            @click="
              payerInput = '';
              recipientInput = '';
              amountInput = null;
              errors = [];
              success = null;
              info = null;
              warn = null;
            "
          >
            Reset
          </UButton>

        </div>
        </template>
      </UCard>

      <template #footer>
        <UAccordion
        :items="[
          { label: 'Steps to complete payment', slot: 'steps' },
          { label: 'Tips & troubleshooting', slot: 'tips' }
        ]">
          <template #steps>
            <ol class="list-decimal ms-5 space-y-2 text-sm">
              <li>Enter payer number (your Safaricom line), recipient number (who gets airtime), and amount.</li>
              <li>Tap “Pay with M‑Pesa”. You’ll receive an STK prompt on your phone.</li>
              <li>Confirm details and enter your M-Pesa PIN within 90 seconds.</li>
              <li>Wait for confirmation; the page will update with success or error details.</li>
            </ol>
          </template>
          <template #tips>
            <ul class="list-disc ms-5 space-y-2 text-sm">
              <li>Ensure both numbers are valid Kenyan MSISDNs (07/01 ranges). We normalize to 2547/2541 format.</li>
              <li>If you don’t see a prompt, check network, SIM toolkit, or try again after a minute.</li>
              <li>For buying airtime for someone else, payer can differ from recipient.</li>
              <li>Double‑check the amount; only whole numbers are allowed.</li>
            </ul>
          </template>
        </UAccordion>
      </template>
    </UCard>
  </div>
  -->
</template>
