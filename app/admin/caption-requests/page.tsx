
import { adminClient } from '@/lib/supabase/admin'

export default async function CaptionRequestsPage() {
  const { data: requests, error } = await adminClient
    .from('caption_requests')
    .select('*, images(url, image_description)')
    .order('created_datetime_utc', { ascending: false });

  if (error) {
    console.error('Error fetching caption requests:', error.message);
    return (
        <div>
          <div className="page-header">
            <h1 className="page-title">Caption Requests</h1>
            <p className="page-subtitle">Read-only list of caption requests.</p>
          </div>
          <div className="section">
            <p className="text-danger">Error fetching caption requests: {error.message}</p>
          </div>
        </div>
      );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Caption Requests</h1>
        <p className="page-subtitle">Read-only list of caption requests.</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Status</th>
              <th>User ID</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {requests?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No caption requests found.</td>
              </tr>
            ) : (
              requests?.map((request) => (
                <tr key={request.id}>
                  <td>
                    {/* @ts-ignore */}
                    {request.images && Array.isArray(request.images) && request.images.length > 0 && (
                      <img
                        // @ts-ignore
                        src={request.images[0].url}
                        // @ts-ignore
                        alt={request.images[0].image_description || 'Image'}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                  </td>
                  <td>{request.status}</td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {request.profile_id}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
