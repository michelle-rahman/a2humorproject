
import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function CaptionExamplesPage() {
  const { data: examples, error } = await adminClient
    .from('caption_examples')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  if (error) {
    console.error('Error fetching caption examples:', error.message);
    return (
      <div>
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Caption Examples</h1>
            <p className="page-subtitle">Manage the list of caption examples.</p>
          </div>
          <Link href="/admin/caption-examples/new" className="btn btn-primary">
            New Example
          </Link>
        </div>
        <div className="section">
          <p>Error fetching caption examples: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Caption Examples</h1>
          <p className="page-subtitle">Manage the list of caption examples.</p>
        </div>
        <Link href="/admin/caption-examples/new" className="btn btn-primary">
          New Example
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Created At</th>
              <th style={{ width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {examples?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No caption examples found.</td>
              </tr>
            ) : (
              examples?.map((example) => (
                <tr key={example.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {example.content}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(example.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href={`/admin/caption-examples/${example.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
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
