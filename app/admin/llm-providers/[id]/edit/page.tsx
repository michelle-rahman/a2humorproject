import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updateLlmProvider(formData: FormData) {
  'use server'

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  const { error } = await adminClient
    .from('llm_providers')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update LLM provider: ${error.message}`);
  }

  revalidatePath('/admin/llm-providers');
  redirect('/admin/llm-providers');
}

export default async function EditLlmProviderPage({ params }: { params: { id: string } }) {
  const { data: provider, error } = await adminClient
    .from('llm_providers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching LLM provider:', error.message);
    return <div>Error loading provider.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit LLM Provider</h1>
      </div>
      <div className="section">
        <form action={updateLlmProvider}>
          <input type="hidden" name="id" value={provider.id} />
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Provider Name</label>
              <input id="name" name="name" type="text" className="form-input" defaultValue={provider.name} required />
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
