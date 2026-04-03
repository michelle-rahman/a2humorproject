'use client'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function DeleteLlmProviderButton({ providerId }: { providerId: string }) {
  const deleteProvider = async () => {
    if (confirm('Are you sure you want to delete this LLM provider?')) {
      const { error } = await adminClient
        .from('llm_providers')
        .delete()
        .eq('id', providerId);

      if (error) {
        alert(`Failed to delete LLM provider: ${error.message}`);
      } else {
        revalidatePath('/admin/llm-providers');
      }
    }
  };

  return (
    <button onClick={deleteProvider} className="btn btn-danger btn-sm">
      Delete
    </button>
  );
}
