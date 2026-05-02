'use server'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLlmProvider(formData: FormData) {
  const name = formData.get('name') as string

  const { error } = await adminClient.from('llm_providers').insert({
    name,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create LLM provider: ${error.message}`)
  }

  revalidatePath('/admin/llm-providers')
  redirect('/admin/llm-providers')
}

export async function updateLlmProvider(id: string, formData: FormData) {
  const name = formData.get('name') as string

  const { error } = await adminClient
    .from('llm_providers')
    .update({ name })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update LLM provider: ${error.message}`)
  }

  revalidatePath('/admin/llm-providers')
  redirect('/admin/llm-providers')
}

export async function deleteLlmProvider(id: string) {
  const { error } = await adminClient.from('llm_providers').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete LLM provider: ${error.message}`)
  }

  revalidatePath('/admin/llm-providers')
  redirect('/admin/llm-providers')
}

export async function createLlmModel(formData: FormData) {
  const name = formData.get('name') as string
  const llm_provider_id = formData.get('llm_provider_id') as string

  const { error } = await adminClient.from('llm_models').insert({
    name,
    llm_provider_id,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create LLM model: ${error.message}`)
  }

  revalidatePath('/admin/llm-models')
  redirect('/admin/llm-models')
}

export async function updateLlmModel(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const llm_provider_id = formData.get('llm_provider_id') as string

  const { error } = await adminClient
    .from('llm_models')
    .update({ name, llm_provider_id })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update LLM model: ${error.message}`)
  }

  revalidatePath('/admin/llm-models')
  redirect('/admin/llm-models')
}

export async function deleteLlmModel(id: string) {
  const { error } = await adminClient.from('llm_models').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete LLM model: ${error.message}`)
  }

  revalidatePath('/admin/llm-models')
  redirect('/admin/llm-models')
}
