
import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function HumorFlavorsPage() {
  const { data: flavors, error } = await adminClient
    .from('humor_flavors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching humor flavors:', error.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Flavors</h1>
        <p className="page-subtitle">Read-only list of humor flavors.</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {flavors?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No humor flavors found.</td>
              </tr>
            ) : (
              flavors?.map((flavor) => (
                <tr key={flavor.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {flavor.name}
                    </span>
                  </td>
                  <td>{flavor.description}</td>
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
  );
}
