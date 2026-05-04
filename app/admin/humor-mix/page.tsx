import { adminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updateHumorFlavorMix(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const caption_count = parseInt(formData.get('caption_count') as string, 10)

  const { error } = await adminClient
    .from('humor_flavor_mix')
    .update({ caption_count })
    .eq('id', id)

  if (error) throw new Error(`Failed to update: ${error.message}`)
  revalidatePath('/admin/humor-mix')
  redirect('/admin/humor-mix')
}

async function deleteHumorFlavorMix(formData: FormData) {
  'use server'
  const id = formData.get('id') as string

  const { error } = await adminClient
    .from('humor_flavor_mix')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete: ${error.message}`)
  revalidatePath('/admin/humor-mix')
  redirect('/admin/humor-mix')
}

async function addHumorFlavorMix(formData: FormData) {
  'use server'
  const humor_flavor_id = parseInt(formData.get('humor_flavor_id') as string, 10)
  const caption_count = parseInt(formData.get('caption_count') as string, 10)

  const { error } = await adminClient
    .from('humor_flavor_mix')
    .insert({ humor_flavor_id, caption_count })

  if (error) throw new Error(`Failed to add: ${error.message}`)
  revalidatePath('/admin/humor-mix')
  redirect('/admin/humor-mix')
}

export default async function HumorMixPage() {
  const { data: mix, error } = await adminClient
    .from('humor_flavor_mix')
    .select('*, humor_flavors(slug, description)')
    .order('caption_count', { ascending: false })

  const { data: allFlavors } = await adminClient
    .from('humor_flavors')
    .select('id, slug')
    .order('slug', { ascending: true })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Humor Mix</h1>
        <p className="page-subtitle">Configure which humor flavors are active and how many captions each should generate.</p>
      </div>

      {error && <div className="login-error">Error: {error.message}</div>}

      {/* Add new entry */}
      <div className="section p-6" style={{ marginBottom: '24px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>Add Flavor to Mix</div>
        <form action={addHumorFlavorMix}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
              <label className="form-label">Humor Flavor</label>
              <select name="humor_flavor_id" className="form-input" required>
                <option value="">Select a flavor…</option>
                {allFlavors?.map((f) => (
                  <option key={f.id} value={f.id}>{f.slug}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
              <label className="form-label">Caption Count</label>
              <input name="caption_count" type="number" min="1" className="form-input" defaultValue={1} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginBottom: '0' }}>Add</button>
          </div>
        </form>
      </div>

      {/* Current mix */}
      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Humor Flavor</th>
              <th>Description</th>
              <th>Caption Count</th>
              <th>Added</th>
              <th style={{ width: '200px' }}></th>
            </tr>
          </thead>
          <tbody>
            {mix?.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">No flavors in the mix yet.</td></tr>
            ) : (
              mix?.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      {/* @ts-ignore */}
                      {row.humor_flavors?.slug ?? `flavor #${row.humor_flavor_id}`}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }} className="truncate">
                      {/* @ts-ignore */}
                      {row.humor_flavors?.description ?? '—'}
                    </span>
                  </td>
                  <td>
                    <form action={updateHumorFlavorMix} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        name="caption_count"
                        type="number"
                        min="1"
                        defaultValue={row.caption_count}
                        className="form-input"
                        style={{ width: '80px', padding: '5px 10px' }}
                      />
                      <button type="submit" className="btn btn-ghost btn-sm">Save</button>
                    </form>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(row.created_datetime_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <form action={deleteHumorFlavorMix}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => { if (!confirm('Remove this flavor from the mix?')) e.preventDefault() }}
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
