import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/nav'
import { isSuperAdmin } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !await isSuperAdmin()) {
    redirect('/login')
  }

  return (
    <div className="admin-shell">
      <AdminNav userEmail={user?.email} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
