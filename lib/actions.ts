'use server'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createImage(formData: FormData) {
  const url = formData.get('url') as string
  const additional_context = formData.get('additional_context') as string
  const image_description = formData.get('image_description') as string
  const celebrity_recognition = formData.get('celebrity_recognition') as string
  const is_public = formData.get('is_public') === 'true'
  const is_common_use = formData.get('is_common_use') === 'true'

  const { error } = await adminClient.from('images').insert({
    url,
    additional_context: additional_context || null,
    image_description: image_description || null,
    celebrity_recognition: celebrity_recognition || null,
    is_public,
    is_common_use,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create image: ${error.message}`)
  }

  revalidatePath('/admin/images')
  redirect('/admin/images')
}

export async function updateImage(id: string, formData: FormData) {
  const url = formData.get('url') as string
  const additional_context = formData.get('additional_context') as string
  const image_description = formData.get('image_description') as string
  const celebrity_recognition = formData.get('celebrity_recognition') as string
  const is_public = formData.get('is_public') === 'true'
  const is_common_use = formData.get('is_common_use') === 'true'

  const { error } = await adminClient
    .from('images')
    .update({
      url,
      additional_context: additional_context || null,
      image_description: image_description || null,
      celebrity_recognition: celebrity_recognition || null,
      is_public,
      is_common_use,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update image: ${error.message}`)
  }

  revalidatePath('/admin/images')
  redirect('/admin/images')
}

export async function deleteImage(id: string) {
  const { error } = await adminClient.from('images').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }

  revalidatePath('/admin/images')
  redirect('/admin/images')
}

export async function createAllowedDomain(formData: FormData) {
  const apex_domain = formData.get('apex_domain') as string

  const { error } = await adminClient.from('allowed_signup_domains').insert({
    apex_domain,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create allowed domain: ${error.message}`)
  }

  revalidatePath('/admin/allowed-signup-domains')
  redirect('/admin/allowed-signup-domains')
}

export async function updateAllowedDomain(id: string, formData: FormData) {
  const apex_domain = formData.get('apex_domain') as string

  const { error } = await adminClient
    .from('allowed_signup_domains')
    .update({
      apex_domain,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update allowed domain: ${error.message}`)
  }

  revalidatePath('/admin/allowed-signup-domains')
  redirect('/admin/allowed-signup-domains')
}

export async function deleteAllowedDomain(id: string) {
  const { error } = await adminClient.from('allowed_signup_domains').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete allowed domain: ${error.message}`)
  }

  revalidatePath('/admin/allowed-signup-domains')
  redirect('/admin/allowed-signup-domains')
}
