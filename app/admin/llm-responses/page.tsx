import { adminClient } from '@/lib/supabase/admin'

export default async function LlmResponsesPage() {
  const { data: responses, error } = await adminClient
    .from('llm_responses')
    .select('*, llm_models(name)')
    .order('created_datetime_utc', { ascending: false });

  if (error) {
    console.error('Error fetching LLM responses:', error.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">LLM Responses</h1>
        <p className="page-subtitle">Read-only list of LLM responses.</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Response</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {responses?.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">No LLM responses found.</td>
              </tr>
            ) : (
              responses?.map((response) => (
                <tr key={response.id}>
                  <td>
                    {/* @ts-ignore */}
                    {response.llm_models?.name || 'N/A'}
                  </td>
                  <td style={{ whiteSpace: 'pre-wrap', maxWidth: '600px' }}>
                    {JSON.stringify(response.response_text, null, 2)}
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(response.created_datetime_utc).toLocaleDateString('en-US', {
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
