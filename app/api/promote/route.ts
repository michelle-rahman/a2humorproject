import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_superadmin: true })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'You are now a superadmin!' })
  }

  return NextResponse.json({ error: 'You must be logged in to be promoted.' }, { status: 401 })
}
