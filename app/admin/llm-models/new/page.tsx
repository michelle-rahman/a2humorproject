import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function createLlmModel(formData: FormData) {
  'use server'

  const name = formData.get('name') as string;
  const providerId = formData.get('provider_id') as string;

  const { error } = await adminClient
    .from('llm_models')
    .insert({ name, llm_provider_id: providerId });

  if (error) {
    throw new Error(`Failed to create LLM model: ${error.message}`);
  }

  revalidatePath('/admin/llm-models');
  redirect('/admin/llm-models');
}

export default async function NewLlmModelPage() {
  const { data: providers, error } = await adminClient
    .from('llm_providers')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching LLM providers:', error.message);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New LLM Model</h1>
      </div>
      <div className="section">
        <form action={createLlmModel}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Model Name</label>
              <input id="name" name="name" type="text" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="provider_id">Provider</label>
              <select id="provider_id" name="provider_id" className="form-input" required>
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
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
