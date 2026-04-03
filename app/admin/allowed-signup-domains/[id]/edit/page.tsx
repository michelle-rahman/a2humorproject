import { adminClient } from '@/lib/supabase/admin';
import { updateAllowedDomain, deleteAllowedDomain } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function EditAllowedDomainPage({ params }: { params: { id: string } }) {
  const { data: domain, error } = await adminClient
    .from('allowed_signup_domains')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !domain) {
    console.error('Error fetching domain for edit:', error?.message);
    notFound();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit Domain</h1>
        <p className="page-subtitle">Edit the selected email domain.</p>
      </div>

      <div className="section">
        <form action={updateAllowedDomain.bind(null, domain.id)} className="form-grid" style={{ padding: '24px' }}>
          <div className="form-group">
            <label htmlFor="apex_domain" className="form-label">Domain</label>
            <input
              id="apex_domain"
              name="apex_domain"
              className="form-input"
              defaultValue={domain.apex_domain}
              placeholder="e.g., example.com"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this domain? This cannot be undone.')) {
                  deleteAllowedDomain(domain.id);
                }
              }}
              className="btn btn-danger"
            >
              Delete Domain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
