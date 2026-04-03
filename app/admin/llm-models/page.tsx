import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteLlmModelButton from './DeleteLlmModelButton'

export default async function LlmModelsPage() {
  const { data: llmModels, error } = await adminClient
    .from('llm_models')
    .select('*, llm_providers(name)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching LLM models:', error.message);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">LLM Models</h1>
          <p className="page-subtitle">Manage the list of LLM models.</p>
        </div>
        <Link href="/admin/llm-models/new" className="btn btn-primary">
          New LLM Model
        </Link>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Created At</th>
              <th style={{ width: '180px' }}></th>
            </tr>
          </thead>
          <tbody>
            {llmModels?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No LLM models found.</td>
              </tr>
            ) : (
              llmModels?.map((model) => (
                <tr key={model.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {model.name}
                    </span>
                  </td>
                  <td>
                    {/* @ts-ignore */}
                    {model.llm_providers?.name || 'N/A'}
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(model.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/llm-models/${model.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteLlmModelButton modelId={model.id} />
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
