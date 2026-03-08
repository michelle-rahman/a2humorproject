import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="admin-shell">
      <AdminNav userEmail={user?.email} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
