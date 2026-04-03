
import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteTermButton from './DeleteTermButton'

export default async function TermsPage() {
  const { data: terms, error } = await adminClient
    .from('terms')
    .select('*')
    .order('term', { ascending: true });

  if (error) {
    console.error('Error fetching terms:', error.message);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Terms</h1>
          <p className="page-subtitle">Manage the list of terms.</p>
        </div>
        <Link href="/admin/terms/new" className="btn btn-primary">
          New Term
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Definition</th>
              <th>Created At</th>
              <th style={{ width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {terms?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No terms found.</td>
              </tr>
            ) : (
              terms?.map((term) => (
                <tr key={term.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {term.term}
                    </span>
                  </td>
                  <td>{term.definition}</td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(term.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/terms/${term.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteTermButton termId={term.id} />
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
