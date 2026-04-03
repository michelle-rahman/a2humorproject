import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteDomainButton from './DeleteDomainButton'

export default async function AllowedSignupDomainsPage() {
  const { data: domains, error } = await adminClient
    .from('allowed_signup_domains')
    .select('*')
    .order('apex_domain', { ascending: true });

  if (error) {
    console.error('Error fetching allowed domains:', error.message);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Allowed Signup Domains</h1>
          <p className="page-subtitle">Manage which email domains can be used for new accounts.</p>
        </div>
        <Link href="/admin/allowed-signup-domains/new" className="btn btn-primary">
          New Domain
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Created At</th>
              <th style={{ width: '180px' }}></th>
            </tr>
          </thead>
          <tbody>
            {domains?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No domains found.</td>
              </tr>
            ) : (
              domains?.map((domain) => (
                <tr key={domain.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {domain.apex_domain}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(domain.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/allowed-signup-domains/${domain.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteDomainButton domainId={domain.id} />
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
