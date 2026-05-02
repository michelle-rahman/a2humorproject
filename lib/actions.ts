'use server'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function uploadImageFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error: uploadError } = await adminClient.storage
    .from('images')
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    throw new Error(`Failed to upload image file: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = adminClient.storage
    .from('images')
    .getPublicUrl(data.path)

  return publicUrl
}

export async function createImage(formData: FormData) {
  const file = formData.get('file') as File | null
  let url = formData.get('url') as string

  if (file && file.size > 0) {
    url = await uploadImageFile(file)
  }

  if (!url) {
    throw new Error('Either a file upload or URL is required')
  }

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
  const file = formData.get('file') as File | null
  let url = formData.get('url') as string

  if (file && file.size > 0) {
    url = await uploadImageFile(file)
  }

  if (!url) {
    throw new Error('Either a file upload or URL is required')
  }

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

export async function createWhitelistedEmail(formData: FormData) {
  const email_address = formData.get('email_address') as string

  const { error } = await adminClient.from('whitelisted_email_addresses').insert({
    email_address,
    created_datetime_utc: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create whitelisted email: ${error.message}`)
  }

  revalidatePath('/admin/whitelisted-email-addresses')
  redirect('/admin/whitelisted-email-addresses')
}

export async function updateWhitelistedEmail(id: string, formData: FormData) {
  const email_address = formData.get('email_address') as string

  const { error } = await adminClient
    .from('whitelisted_email_addresses')
    .update({ email_address })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update whitelisted email: ${error.message}`)
  }

  revalidatePath('/admin/whitelisted-email-addresses')
  redirect('/admin/whitelisted-email-addresses')
}

export async function deleteWhitelistedEmail(id: string) {
  const { error } = await adminClient.from('whitelisted_email_addresses').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete whitelisted email: ${error.message}`)
  }

  revalidatePath('/admin/whitelisted-email-addresses')
  redirect('/admin/whitelisted-email-addresses')
}
