import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from '@/components/login-button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/admin')

  const params = await searchParams
  const error = params.error

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-eyebrow">Humor Study</div>
        <h1 className="login-title">Admin Console</h1>
        <p className="login-desc">
          Restricted access. You must be a verified superadmin to continue.
        </p>

        {error === 'unauthorized' && (
          <div className="login-error">
            ⚠ Your account does not have superadmin privileges.
          </div>
        )}
        {error === 'auth_failed' && (
          <div className="login-error">
            ⚠ Authentication failed. Please try again.
          </div>
        )}

        <LoginButton />

        <div style={{
          marginTop: '32px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>
          profiles.is_superadmin must be TRUE
        </div>
      </div>
    </div>
  )
}
