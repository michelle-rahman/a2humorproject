import { createImage } from '@/lib/actions'
import ImageForm from '@/components/image-form'
import Link from 'next/link'

export default function NewImagePage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/images" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Images
          </Link>
        </div>
        <h1 className="page-title">New Image</h1>
        <p className="page-subtitle">// add a new image to the library</p>
      </div>

      <div className="section p-6">
        <ImageForm action={createImage} submitLabel="Create Image" />
      </div>
    </div>
  )
}
