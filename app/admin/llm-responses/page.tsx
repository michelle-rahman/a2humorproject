import { adminClient } from '@/lib/supabase/admin'

export default async function LlmResponsesPage() {
  const { data: responses, error } = await adminClient
    .from('llm_model_responses')
    .select('id, llm_model_response, processing_time_seconds, llm_model_id, created_datetime_utc, llm_models(name)')
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching LLM responses:', error.message)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">LLM Responses</h1>
        <p className="page-subtitle">// read-only · {responses?.length ?? 0} most recent responses</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Response Preview</th>
              <th>Time (s)</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {responses?.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No LLM responses found.</td>
              </tr>
            ) : (
              responses?.map((response) => {
                const raw = response.llm_model_response
                const preview = (typeof raw === 'string' ? raw : JSON.stringify(raw ?? '')).slice(0, 200)
                return (
                  <tr key={response.id}>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
                        {/* @ts-ignore */}
                        {response.llm_models?.name ?? `model #${response.llm_model_id}`}
                      </span>
                    </td>
                    <td style={{ maxWidth: '500px' }}>
                      <span
                        className="mono"
                        style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={typeof raw === 'string' ? raw : ''}
                      >
                        {preview}{preview.length === 200 ? '…' : ''}
                      </span>
                    </td>
                    <td>
                      <span className="mono text-muted" style={{ fontSize: '11px' }}>
                        {response.processing_time_seconds != null ? `${response.processing_time_seconds}s` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="mono text-muted" style={{ fontSize: '11px' }}>
                        {new Date(response.created_datetime_utc).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
