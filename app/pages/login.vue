<script setup lang="ts">
import { ref } from 'vue';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
const supabase = useSupabaseClient();
const toast = useToast();
const email = ref('');

const stage = ref<'login' | 'verifyOtp'>('login');
const otpSchema = z.object({
    email: z.string().email('Invalid email'),
    otp: z.string().length(6, 'Enter the 6-digit code').optional(),

})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

const fieldsLogin =  [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
},]

const fieldsOtp = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password'
  },
  {
    name: 'otp',
    label: 'OTP',
    type: 'text' as const,
    placeholder: 'Enter the 6-digit code'
  }
]
const providers = [
  {
    label: 'Continue with Google',
    icon: 'i-logos-google-icon',
    onClick: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/confirm` },
      });
      toast.add({ title: 'Signing in', description: 'Redirecting to Google...', color: 'info' });
    },
  },
];

async function onSubmit(
  event: FormSubmitEvent<z.infer<typeof otpSchema> | z.infer<typeof schema>>
) {
  if (stage.value === 'login') {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: (event.data as { email: string; password: string }).email,
      password: (event.data as { email: string; password: string }).password,
    });
    if (error) {
      toast.add({ title: 'Login failed', description: error.message, color: 'error' });
      return;
    }
   console.log(data)
    toast.add({ title: 'Enter OTP', description: 'Check your email for the code', color: 'info' });
    email.value = (event.data as { email: string; password: string }).email;
    stage.value = 'verifyOtp';
  } else if (stage.value === 'verifyOtp') {
    const { error } = await supabase.auth.verifyOtp({
      email: email.value,
      token: (event.data as { email: string; otp?: string }).otp!,
      type: 'email',
    });
    if (error) {
      toast.add({ title: 'OTP failed', description: error.message, color: 'error' });
      return;
    }
    toast.add({ title: 'Logged in', color: 'success' });
    navigateTo('/');
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-neutral-100">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="stage == 'login' ? schema : otpSchema"
        :fields="stage === 'login' ? fieldsLogin : fieldsOtp"
        :providers="providers"
        :submit="{ label: stage === 'login' ? 'Login' : 'Verify OTP' }"
        @submit="onSubmit"
      />
    </UPageCard>
    <UToast position="top-right" />
  </div>
</template>
