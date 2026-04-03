
import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function HumorFlavorStepsPage() {
  const { data: steps, error } = await adminClient
    .from('humor_flavor_steps')
    .select('*, humor_flavors(name)')
    .order('step_number', { ascending: true });

  if (error) {
    console.error('Error fetching humor flavor steps:', error.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Flavor Steps</h1>
        <p className="page-subtitle">Read-only list of humor flavor steps.</p>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Step</th>
              <th>Name</th>
              <th>Instruction</th>
              <th>Created At</th>
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
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {step.humor_flavors.name}
                    </span>
                  </td>
                  <td>{step.step_number}</td>
                  <td>{step.step_name}</td>
                  <td>{step.instruction_text}</td>
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
  );
}
