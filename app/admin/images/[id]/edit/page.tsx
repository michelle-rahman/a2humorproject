import { adminClient } from '@/lib/supabase/admin'
import { updateImage } from '@/lib/actions'
import ImageForm from '@/components/image-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: image } = await adminClient
    .from('images')
    .select('*')
    .eq('id', id)
    .single()

  if (!image) notFound()

  const updateWithId = updateImage.bind(null, id)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/images" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Images
          </Link>
        </div>
        <h1 className="page-title">Edit Image</h1>
        <p className="page-subtitle mono" style={{ fontSize: '11px' }}>
          // id: {image.id}
        </p>
      </div>

      <div className="section p-6">
        <ImageForm image={image} action={updateWithId} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
