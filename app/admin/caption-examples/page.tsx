import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteCaptionExampleButton from './DeleteCaptionExampleButton'

export default async function CaptionExamplesPage() {
  const { data: examples, error } = await adminClient
    .from('caption_examples')
    .select('id, caption, explanation, priority, created_datetime_utc')
    .order('priority', { ascending: true })

  if (error) {
    return (
      <div>
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Caption Examples</h1>
            <p className="page-subtitle">Manage caption examples used for LLM training context.</p>
          </div>
          <Link href="/admin/caption-examples/new" className="btn btn-primary">New Example</Link>
        </div>
        <div className="section p-6">
          <p className="text-danger">Error: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Caption Examples</h1>
          <p className="page-subtitle">// {examples?.length ?? 0} examples · used as LLM training context</p>
        </div>
        <Link href="/admin/caption-examples/new" className="btn btn-primary">New Example</Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Caption</th>
              <th>Explanation</th>
              <th>Created</th>
              <th style={{ width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {examples?.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">No caption examples found.</td>
              </tr>
            ) : (
              examples?.map((example) => (
                <tr key={example.id}>
                  <td>
                    <span className="badge badge-gray">{example.priority ?? '—'}</span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text)', fontSize: '13px' }}>
                      {example.caption ?? <em className="text-muted">(empty)</em>}
                    </span>
                  </td>
                  <td style={{ maxWidth: '350px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={example.explanation ?? ''}>
                      {example.explanation ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(example.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/caption-examples/${example.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                    <DeleteCaptionExampleButton exampleId={String(example.id)} />
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
