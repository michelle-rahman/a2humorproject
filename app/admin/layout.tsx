import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/nav'
import { isSuperAdmin } from '@/lib/utils'
import { redirect } from 'next/navigation'
import './admin.css'

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
      <main className="admin-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
