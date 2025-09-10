<script setup lang="ts">
const user = useSupabaseUser();
const toast = useToast();
const { pluck } = useSupabaseCookieRedirect();

watch(user, () => {
  if (user.value) {
    toast.add({ title: 'Authentication successful', color: 'success' });
    navigateTo(pluck() || '/');
  }
}, { immediate: true });
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-neutral-100">
    <UPageCard class="w-full max-w-sm text-center">
      <p class="text-lg">Finalizing login...</p>
    </UPageCard>
    <UToast position="top-right" />
  </div>
</template>
