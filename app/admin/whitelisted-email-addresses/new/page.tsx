import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function createWhitelistedEmail(formData: FormData) {
  'use server'

  const email = formData.get('email') as string;

  const { error } = await adminClient
    .from('whitelisted_email_addresses')
    .insert({ email_address: email });

  if (error) {
    throw new Error(`Failed to create whitelisted email: ${error.message}`);
  }

  revalidatePath('/admin/whitelisted-email-addresses');
  redirect('/admin/whitelisted-email-addresses');
}

export default async function NewWhitelistedEmailPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Whitelisted Email</h1>
      </div>
      <div className="section">
        <form action={createWhitelistedEmail}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" className="form-input" required />
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
