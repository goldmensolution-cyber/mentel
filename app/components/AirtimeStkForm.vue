<!-- components/AirtimeStkForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { normalizeKeMsisdn, isValidKeMsisdnE164254 } from '~/utils/msisdn'

type StkPushRequest = {
  payerMsisdn: string
  recipientMsisdn: string
  amount: number
}

type StkPushResponse =
  | { ok: true; message: string; checkoutRequestID: string; merchantRequestID: string }
  | { ok: false; message: string; code?: string | number }

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
  if (payer.value && recipient.value && payer.value !== recipient.value) {
    // STK PartyA can differ from AccountReference/recipient. We only warn to avoid surprising users.
    warn.value = 'Payer number differs from recipient number. Ensure you intend to buy airtime for someone else.'
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
    if (res.ok) {
      success.value = res.message || 'STK Push sent. Complete the prompt on your phone.'
      info.value = 'Awaiting M-Pesa confirmation…'
    } else {
      errors.value = [res.message || 'Failed to initiate STK Push. Please try again.']
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    errors.value = [err?.data?.message || err?.message || 'Unexpected error. Please try again.']
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Buy Airtime via M‑Pesa (STK Push)</h2>
          <UBadge color="primary">PayBill</UBadge>
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <label for="payer" class="block text-sm font-medium mb-1">Payer number</label>
          <UInput
            id="payer"
            v-model="payerInput"
            placeholder="e.g. 07XXXXXXXX or +2547XXXXXXXX"
            icon="i-lucide-smartphone"
            :ui="{ base: 'w-full' }"
            autocomplete="tel"
            inputmode="tel"
          />
          <p v-if="payer" class="text-xs text-neutral-500 mt-1">Normalized: {{ payer }}</p>
        </div>

        <div>
          <label for="recipient" class="block text-sm font-medium mb-1">Recipient number (Account Number)</label>
          <UInput
            id="recipient"
            v-model="recipientInput"
            placeholder="e.g. 07XXXXXXXX or +2547XXXXXXXX"
            icon="i-lucide-user"
            :ui="{ base: 'w-full' }"
            autocomplete="tel"
            inputmode="tel"
          />
          <p v-if="recipient" class="text-xs text-neutral-500 mt-1">Normalized: {{ recipient }}</p>
        </div>

        <div>
          <label for="amount" class="block text-sm font-medium mb-1">Amount (KES)</label>
          <UInput
            id="amount"
            v-model.number="amountInput"
            placeholder="Whole number, e.g. 50"
            icon="i-lucide-wallet"
            :ui="{ base: 'w-full' }"
            inputmode="numeric"
            type="number"
            min="1"
            step="1"
          />
        </div>

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
      </div>

      <template #footer>
        <UAccordion :items="[
          { label: 'Steps to complete payment', slot: 'steps' },
          { label: 'Tips & troubleshooting', slot: 'tips' }
        ]">
          <template #steps>
            <ol class="list-decimal ms-5 space-y-2 text-sm">
              <li>Enter payer number (your Safaricom line), recipient number (who gets airtime), and amount.</li>
              <li>Tap “Pay with M‑Pesa”. You’ll receive an STK prompt on your phone.</li>
              <li>Confirm details and enter your M‑Pesa PIN within 90 seconds.</li>
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
</template>