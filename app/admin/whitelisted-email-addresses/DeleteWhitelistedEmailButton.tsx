'use client'

import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default function DeleteWhitelistedEmailButton({ emailId }: { emailId: string }) {
  const deleteEmail = async () => {
    if (confirm('Are you sure you want to delete this email?')) {
      const { error } = await adminClient
        .from('whitelisted_email_addresses')
        .delete()
        .eq('id', emailId);

      if (error) {
        alert(`Failed to delete email: ${error.message}`);
      } else {
        revalidatePath('/admin/whitelisted-email-addresses');
      }
    }
  };

  return (
    <button onClick={deleteEmail} className="btn btn-danger btn-sm">
      Delete
    </button>
  );
}
