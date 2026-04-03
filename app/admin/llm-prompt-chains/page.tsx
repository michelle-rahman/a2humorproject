import { adminClient } from '@/lib/supabase/admin'

export default async function LlmPromptChainsPage() {
  const { data: chains, error } = await adminClient
    .from('llm_prompt_chains')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  if (error) {
    console.error('Error fetching LLM prompt chains:', error.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">LLM Prompt Chains</h1>
        <p className="page-subtitle">Read-only list of LLM prompt chains.</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {chains?.length === 0 ? (
              <tr>
                <td colSpan={2} className="empty-state">No LLM prompt chains found.</td>
              </tr>
            ) : (
              chains?.map((chain) => (
                <tr key={chain.id}>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {chain.id}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(chain.created_datetime_utc).toLocaleDateString('en-US', {
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
