import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteLlmProviderButton from './DeleteLlmProviderButton'

export default async function LlmProvidersPage() {
  const { data: llmProviders, error } = await adminClient
    .from('llm_providers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching LLM providers:', error.message);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">LLM Providers</h1>
          <p className="page-subtitle">Manage the list of LLM providers.</p>
        </div>
        <Link href="/admin/llm-providers/new" className="btn btn-primary">
          New LLM Provider
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th style={{ width: '180px' }}></th>
            </tr>
          </thead>
          <tbody>
            {llmProviders?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No LLM providers found.</td>
              </tr>
            ) : (
              llmProviders?.map((provider) => (
                <tr key={provider.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {provider.name}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(provider.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/llm-providers/${provider.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteLlmProviderButton providerId={provider.id} />
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
