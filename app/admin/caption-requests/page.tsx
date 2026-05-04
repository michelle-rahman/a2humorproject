import { adminClient } from '@/lib/supabase/admin'

export default async function CaptionRequestsPage() {
  const { data: requests, error } = await adminClient
    .from('caption_requests')
    .select('id, profile_id, image_id, created_datetime_utc, images(url, image_description)')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Caption Requests</h1>
          <p className="page-subtitle">// read-only</p>
        </div>
        <div className="section p-6">
          <p className="text-danger">Error: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Caption Requests</h1>
        <p className="page-subtitle">// read-only · {requests?.length ?? 0} most recent requests</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Image</th>
              <th>Image Description</th>
              <th>User ID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {requests?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No caption requests found.</td>
              </tr>
            ) : (
              requests?.map((request) => {
                const img = request.images as { url: string; image_description: string } | null
                return (
                  <tr key={request.id}>
                    <td>
                      {img?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.image_description || 'Image'}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: 'var(--surface-3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>N/A</span>
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: '400px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={img?.image_description ?? ''}>
                        {img?.image_description ?? <em className="text-muted">—</em>}
                      </span>
                    </td>
                    <td>
                      <span className="mono text-muted" style={{ fontSize: '11px' }}>
                        {request.profile_id?.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      <span className="mono text-muted" style={{ fontSize: '11px' }}>
                        {new Date(request.created_datetime_utc).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
