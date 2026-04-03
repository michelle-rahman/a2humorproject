
'use server'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCaptionExample(formData: FormData) {
  const content = formData.get('content') as string

  const { error } = await adminClient.from('caption_examples').insert({
    content,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create caption example: ${error.message}`)
  }

  revalidatePath('/admin/caption-examples')
  redirect('/admin/caption-examples')
}

export async function updateCaptionExample(id: string, formData: FormData) {
  const content = formData.get('content') as string

  const { error } = await adminClient
    .from('caption_examples')
    .update({
      content,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update caption example: ${error.message}`)
  }

  revalidatePath('/admin/caption-examples')
  redirect('/admin/caption-examples')
}

export async function deleteCaptionExample(id: string) {
  const { error } = await adminClient.from('caption_examples').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete caption example: ${error.message}`)
  }

  revalidatePath('/admin/caption-examples')
}
