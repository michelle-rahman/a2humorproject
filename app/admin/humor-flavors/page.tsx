import { adminClient } from '@/lib/supabase/admin'

export default async function HumorFlavorsPage() {
  const { data: flavors, error } = await adminClient
    .from('humor_flavors')
    .select('id, slug, description, is_pinned, created_datetime_utc')
    .order('slug', { ascending: true })

  if (error) {
    console.error('Error fetching humor flavors:', error.message)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Flavors</h1>
        <p className="page-subtitle">// read-only · {flavors?.length ?? 0} flavors</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Description</th>
              <th>Pinned</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {flavors?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No humor flavors found.</td>
              </tr>
            ) : (
              flavors?.map((flavor) => (
                <tr key={flavor.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      {flavor.slug}
                    </span>
                  </td>
                  <td style={{ maxWidth: '400px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                      {flavor.description ?? <em className="text-muted">no description</em>}
                    </span>
                  </td>
                  <td>
                    {flavor.is_pinned
                      ? <span className="badge badge-amber">pinned</span>
                      : <span className="badge badge-gray">no</span>}
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(flavor.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
