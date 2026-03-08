import { adminClient } from '@/lib/supabase/admin'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const filter = params.filter ?? 'all'

  let query = adminClient
    .from('profiles')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  if (q) {
    query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }
  if (filter === 'superadmin') query = query.eq('is_superadmin', true)
  if (filter === 'study') query = query.eq('is_in_study', true)
  if (filter === 'matrix') query = query.eq('is_matrix_admin', true)

  const { data: profiles } = await query.limit(200)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users & Profiles</h1>
        <p className="page-subtitle">// read-only · {profiles?.length ?? 0} results shown</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <form method="GET" style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or email..."
            className="form-input"
            style={{ maxWidth: '320px' }}
          />
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" className="btn btn-ghost">Search</button>
        </form>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'superadmin', label: 'Superadmin' },
            { value: 'study', label: 'In Study' },
            { value: 'matrix', label: 'Matrix Admin' },
          ].map((f) => (
            <a
              key={f.value}
              href={`?filter=${f.value}${q ? `&q=${q}` : ''}`}
              className={`badge ${filter === f.value ? 'badge-amber' : 'badge-gray'}`}
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Joined</th>
              <th style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">No profiles found</td>
              </tr>
            )}
            {profiles?.map((profile) => (
              <tr key={profile.id}>
                <td>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                    {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || (
                      <span className="text-muted" style={{ fontStyle: 'italic' }}>Unnamed</span>
                    )}
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {profile.email ?? '—'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {profile.is_superadmin && <span className="badge badge-amber">superadmin</span>}
                    {profile.is_in_study && <span className="badge badge-green">study</span>}
                    {profile.is_matrix_admin && <span className="badge badge-blue">matrix</span>}
                    {!profile.is_superadmin && !profile.is_in_study && !profile.is_matrix_admin && (
                      <span className="badge badge-gray">user</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="mono text-muted" style={{ fontSize: '11px' }}>
                    {profile.created_datetime_utc
                      ? new Date(profile.created_datetime_utc).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </span>
                </td>
                <td>
                  <span className="mono text-muted" style={{ fontSize: '10px' }}>
                    {profile.id.slice(0, 8)}...
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
