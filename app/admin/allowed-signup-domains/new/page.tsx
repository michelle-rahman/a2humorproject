import { createAllowedDomain } from '@/lib/actions';

export default function NewAllowedDomainPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Domain</h1>
        <p className="page-subtitle">Add a new email domain to the allowlist.</p>
      </div>

      <div className="section">
        <form action={createAllowedDomain} className="form-grid" style={{ padding: '24px' }}>
          <div className="form-group">
            <label htmlFor="apex_domain" className="form-label">Domain</label>
            <input
              id="apex_domain"
              name="apex_domain"
              className="form-input"
              placeholder="e.g., example.com"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              Save Domain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
