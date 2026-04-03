import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updateWhitelistedEmail(formData: FormData) {
  'use server'

  const id = formData.get('id') as string;
  const email = formData.get('email') as string;

  const { error } = await adminClient
    .from('whitelisted_email_addresses')
    .update({ email_address: email })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update whitelisted email: ${error.message}`);
  }

  revalidatePath('/admin/whitelisted-email-addresses');
  redirect('/admin/whitelisted-email-addresses');
}

export default async function EditWhitelistedEmailPage({ params }: { params: { id: string } }) {
  const { data: email, error } = await adminClient
    .from('whitelisted_email_addresses')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching whitelisted email:', error.message);
    return <div>Error loading email.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit Whitelisted Email</h1>
      </div>
      <div className="section">
        <form action={updateWhitelistedEmail}>
          <input type="hidden" name="id" value={email.id} />
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" className="form-input" defaultValue={email.email_address} required />
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
