
import { adminClient } from '@/lib/supabase/admin'
import { updateCaptionExample } from '@/lib/actions/caption-examples'
import CaptionExampleForm from '@/components/caption-example-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCaptionExamplePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const { data: example } = await adminClient
    .from('caption_examples')
    .select('*')
    .eq('id', id)
    .single()

  if (!example) notFound()

  const updateWithId = updateCaptionExample.bind(null, id)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/caption-examples" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Caption Examples
          </Link>
        </div>
        <h1 className="page-title">Edit Caption Example</h1>
        <p className="page-subtitle mono" style={{ fontSize: '11px' }}>
          // id: {example.id}
        </p>
      </div>

      <div className="section p-6">
        <CaptionExampleForm example={example} action={updateWithId} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
