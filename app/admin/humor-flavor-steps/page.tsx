import { adminClient } from '@/lib/supabase/admin'

export default async function HumorFlavorStepsPage() {
  const { data: steps, error } = await adminClient
    .from('humor_flavor_steps')
    .select('id, order_by, description, llm_system_prompt, llm_user_prompt, humor_flavor_id, humor_flavors(slug), created_datetime_utc')
    .order('order_by', { ascending: true })

  if (error) {
    console.error('Error fetching humor flavor steps:', error.message)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Flavor Steps</h1>
        <p className="page-subtitle">// read-only · LLM prompt steps within each humor flavor</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Order</th>
              <th>Description</th>
              <th>System Prompt (preview)</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {steps?.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">No humor flavor steps found.</td>
              </tr>
            ) : (
              steps?.map((step) => (
                <tr key={step.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      {/* @ts-ignore */}
                      {step.humor_flavors?.slug ?? `flavor #${step.humor_flavor_id}`}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gray">{step.order_by}</span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      {step.description ?? <em className="text-muted">—</em>}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <span
                      className="mono"
                      style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={step.llm_system_prompt ?? ''}
                    >
                      {step.llm_system_prompt
                        ? step.llm_system_prompt.slice(0, 120) + (step.llm_system_prompt.length > 120 ? '…' : '')
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(step.created_datetime_utc).toLocaleDateString('en-US', {
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
  )
}
