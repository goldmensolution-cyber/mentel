<!-- pages/index.vue -->
<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-10">
    <section class="max-w-3xl w-full space-y-8">
      <div class="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div class="space-y-4 text-center">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Mentel Payment</p>
          <h1 class="text-4xl font-extrabold tracking-tight text-slate-900">Pay with M-Pesa Paybill</h1>
          <p class="max-w-2xl mx-auto text-base leading-7 text-slate-600">
            Airtime purchases are no longer handled directly through this website. Please complete your payment via M-Pesa Paybill using the details below.
          </p>
        </div>

        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 class="text-lg font-semibold text-slate-900">Paybill Details</h2>
            <dl class="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                <dt class="font-medium text-slate-900">Paybill Number</dt>
                <dd>Use the Paybill number provided by Mentel.</dd>
              </div>
              <div>
                <dt class="font-medium text-slate-900">Account Number</dt>
                <dd>Your mobile number or the account reference instructed by Mentel.</dd>
              </div>
              <div>
                <dt class="font-medium text-slate-900">Amount</dt>
                <dd>Enter the airtime amount in KES as instructed.</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 class="text-lg font-semibold text-slate-900">How to Pay</h2>
            <ol class="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
              <li>Open the M-Pesa menu on your Safaricom phone.</li>
              <li>Select "Lipa na M-Pesa" then choose "Paybill".</li>
              <li>Enter the merchant Paybill number provided by Mentel.</li>
              <li>Enter the account number as instructed (usually your phone number or order reference).</li>
              <li>Enter the amount in KES and confirm the payment.</li>
              <li>Enter your M-Pesa PIN when prompted and wait for confirmation.</li>
            </ol>
          </div>
        </div>

        <div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 class="text-lg font-semibold text-slate-900">Important Notes</h2>
          <ul class="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            <li>Please do not use the "Buy Airtime" form on this site anymore; payments must be completed through Paybill.</li>
            <li>Keep your M-Pesa confirmation SMS for reference and support.</li>
            <li>If you are unsure about the correct Paybill or account details, contact Mentel support before sending money.</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
