import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function createLlmProvider(formData: FormData) {
  'use server'

  const name = formData.get('name') as string;

  const { error } = await adminClient
    .from('llm_providers')
    .insert({ name });

  if (error) {
    throw new Error(`Failed to create LLM provider: ${error.message}`);
  }

  revalidatePath('/admin/llm-providers');
  redirect('/admin/llm-providers');
}

export default async function NewLlmProviderPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New LLM Provider</h1>
      </div>
      <div className="section">
        <form action={createLlmProvider}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Provider Name</label>
              <input id="name" name="name" type="text" className="form-input" required />
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
