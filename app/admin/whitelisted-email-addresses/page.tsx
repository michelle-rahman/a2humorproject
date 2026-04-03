import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteWhitelistedEmailButton from './DeleteWhitelistedEmailButton'

export default async function WhitelistedEmailAddressesPage() {
  const { data: emails, error } = await adminClient
    .from('whitelisted_email_addresses')
    .select('*')
    .order('email_address', { ascending: true });

  if (error) {
    console.error('Error fetching whitelisted emails:', error.message);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Whitelisted Email Addresses</h1>
          <p className="page-subtitle">Manage which email addresses can sign up.</p>
        </div>
        <Link href="/admin/whitelisted-email-addresses/new" className="btn btn-primary">
          New Email
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Created At</th>
              <th style={{ width: '180px' }}></th>
            </tr>
          </thead>
          <tbody>
            {emails?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No emails found.</td>
              </tr>
            ) : (
              emails?.map((email) => (
                <tr key={email.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {email.email_address}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(email.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/whitelisted-email-addresses/${email.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteWhitelistedEmailButton emailId={email.id} />
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
