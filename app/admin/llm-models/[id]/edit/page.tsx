import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updateLlmModel(formData: FormData) {
  'use server'

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const providerId = formData.get('provider_id') as string;

  const { error } = await adminClient
    .from('llm_models')
    .update({ name, llm_provider_id: providerId })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update LLM model: ${error.message}`);
  }

  revalidatePath('/admin/llm-models');
  redirect('/admin/llm-models');
}

export default async function EditLlmModelPage({ params }: { params: { id: string } }) {
  const { data: model, error: modelError } = await adminClient
    .from('llm_models')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: providers, error: providersError } = await adminClient
    .from('llm_providers')
    .select('id, name')
    .order('name', { ascending: true });

  if (modelError) {
    console.error('Error fetching LLM model:', modelError.message);
    return <div>Error loading model.</div>;
  }

  if (providersError) {
    console.error('Error fetching LLM providers:', providersError.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit LLM Model</h1>
      </div>
      <div className="section">
        <form action={updateLlmModel}>
          <input type="hidden" name="id" value={model.id} />
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Model Name</label>
              <input id="name" name="name" type="text" className="form-input" defaultValue={model.name} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="provider_id">Provider</label>
              <select id="provider_id" name="provider_id" className="form-input" defaultValue={model.llm_provider_id} required>
                <option value="">Select a provider</option>
                {providers?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
