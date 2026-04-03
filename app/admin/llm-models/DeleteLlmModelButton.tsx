'use client'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function DeleteLlmModelButton({ modelId }: { modelId: string }) {
  const deleteModel = async () => {
    if (confirm('Are you sure you want to delete this LLM model?')) {
      const { error } = await adminClient
        .from('llm_models')
        .delete()
        .eq('id', modelId);

      if (error) {
        alert(`Failed to delete LLM model: ${error.message}`);
      } else {
        revalidatePath('/admin/llm-models');
      }
    }
  };

  return (
    <button onClick={deleteModel} className="btn btn-danger btn-sm">
      Delete
    </button>
  );
}
