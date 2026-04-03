'use client'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function DeleteDomainButton({ domainId }: { domainId: string }) {
  const deleteDomain = async () => {
    if (confirm('Are you sure you want to delete this domain?')) {
      const { error } = await adminClient
        .from('allowed_signup_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        alert(`Failed to delete domain: ${error.message}`);
      } else {
        revalidatePath('/admin/allowed-signup-domains');
      }
    }
  };

  return (
    <button onClick={deleteDomain} className="btn btn-danger btn-sm">
      Delete
    </button>
  );
}
