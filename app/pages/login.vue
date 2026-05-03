<script setup lang="ts">
const title = 'Login Disabled'
const description = 'This site no longer supports authentication or Supabase login. Please return to the home page for Paybill instructions.'
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-neutral-100 px-4">
    <section class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg shadow-slate-900/5">
      <h1 class="text-3xl font-extrabold text-slate-900">{{ title }}</h1>
      <p class="mt-4 text-slate-600">{{ description }}</p>
      <div class="mt-8">
        <NuxtLink to="/" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">
          Back to Home
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
