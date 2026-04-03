
import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Define the server action for updating humor mix
async function updateHumorMix(formData: FormData) {
  'use server'

  const id = formData.get('id') as string;
  const default_flavor_id = formData.get('default_flavor_id') as string;
  const default_step_id = formData.get('default_step_id') as string;
  const is_active = formData.get('is_active') === 'true';

  const { error } = await adminClient
    .from('humor_mix')
    .update({
      default_flavor_id: default_flavor_id || null,
      default_step_id: default_step_id || null,
      is_active: is_active,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update humor mix: ${error.message}`);
  }

  revalidatePath('/admin/humor-mix');
  redirect('/admin/humor-mix');
}

export default async function HumorMixPage() {
  const { data: humorMix, error: humorMixError } = await adminClient
    .from('humor_mix')
    .select('*')
    .single(); // Assuming a single humor mix configuration

  const { data: humorFlavors, error: flavorsError } = await adminClient
    .from('humor_flavors')
    .select('id, name')
    .order('name', { ascending: true });

  const { data: humorFlavorSteps, error: stepsError } = await adminClient
    .from('humor_flavor_steps')
    .select('id, step_name, humor_flavors(name)')
    .order('step_name', { ascending: true });

  if (humorMixError) {
    console.error('Error fetching humor mix:', humorMixError.message);
  }
  if (flavorsError) {
    console.error('Error fetching humor flavors:', flavorsError.message);
  }
  if (stepsError) {
    console.error('Error fetching humor flavor steps:', stepsError.message);
  }

  const flavors = humorFlavors || [];
  const steps = humorFlavorSteps || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Mix</h1>
        <p className="page-subtitle">Manage the global humor mix settings.</p>
      </div>

      {humorMixError && <div className="login-error">Error loading humor mix: {humorMixError.message}</div>}

      {humorMix ? (
        <div className="section p-6">
          <form action={updateHumorMix}>
            <input type="hidden" name="id" value={humorMix.id} />
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="default_flavor_id">Default Humor Flavor</label>
                <select
                  name="default_flavor_id"
                  id="default_flavor_id"
                  className="form-input"
                  defaultValue={humorMix.default_flavor_id || ''}
                >
                  <option value="">None</option>
                  {flavors.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="default_step_id">Default Humor Step</label>
                <select
                  name="default_step_id"
                  id="default_step_id"
                  className="form-input"
                  defaultValue={humorMix.default_step_id || ''}
                >
                  <option value="">None</option>
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {/* @ts-ignore */}
                      {step.humor_flavors?.name ? `${step.humor_flavors.name} - ${step.step_name}` : step.step_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Status</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="form-toggle-row">
                    <span className="form-toggle-label">Is Active</span>
                    <input type="hidden" name="is_active" value={humorMix.is_active ? 'true' : 'false'} />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        input.value = input.value === 'true' ? 'false' : 'true';
                        e.currentTarget.style.background = input.value === 'true' ? 'var(--accent)' : 'var(--surface-3)';
                        const span = e.currentTarget.querySelector('span') as HTMLSpanElement;
                        span.style.left = input.value === 'true' ? '23px' : '3px';
                      }}
                      style={{
                        width: '44px', height: '24px',
                        borderRadius: '12px',
                        background: humorMix.is_active ? 'var(--accent)' : 'var(--surface-3)',
                        border: 'none', cursor: 'pointer',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '3px',
                        left: humorMix.is_active ? '23px' : '3px',
                        width: '18px', height: '18px',
                        borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="section">
          <div className="empty-state">No humor mix configuration found.</div>
        </div>
      )}
    </div>
  );
}
