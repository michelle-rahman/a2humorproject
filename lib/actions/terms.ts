
'use server'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTerm(formData: FormData) {
  const term = formData.get('term') as string
  const definition = formData.get('definition') as string

  const { error } = await adminClient.from('terms').insert({
    term,
    definition: definition || null,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create term: ${error.message}`)
  }

  revalidatePath('/admin/terms')
  redirect('/admin/terms')
}

export async function updateTerm(id: string, formData: FormData) {
  const term = formData.get('term') as string
  const definition = formData.get('definition') as string

  const { error } = await adminClient
    .from('terms')
    .update({
      term,
      definition: definition || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update term: ${error.message}`)
  }

  revalidatePath('/admin/terms')
  redirect('/admin/terms')
}

export async function deleteTerm(id: string) {
  const { error } = await adminClient.from('terms').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete term: ${error.message}`)
  }

  revalidatePath('/admin/terms')
}
