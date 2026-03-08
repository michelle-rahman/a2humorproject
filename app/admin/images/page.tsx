import { adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { deleteImage } from '@/lib/actions'

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const params = await searchParams
  const filter = params.filter ?? 'all'
  const q = params.q ?? ''

  let query = adminClient
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  if (filter === 'public') query = query.eq('is_public', true)
  if (filter === 'private') query = query.eq('is_public', false)
  if (filter === 'common') query = query.eq('is_common_use', true)
  if (q) query = query.ilike('image_description', `%${q}%`)

  const { data: images } = await query.limit(100)

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Images</h1>
          <p className="page-subtitle">// create · read · update · delete · {images?.length ?? 0} shown</p>
        </div>
        <Link href="/admin/images/new" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Image
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form method="GET" style={{ display: 'flex', gap: '8px' }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search descriptions..."
            className="form-input"
            style={{ maxWidth: '280px' }}
          />
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" className="btn btn-ghost">Search</button>
        </form>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
            { value: 'common', label: 'Common Use' },
          ].map((f) => (
            <a
              key={f.value}
              href={`?filter=${f.value}${q ? `&q=${q}` : ''}`}
              className={`badge ${filter === f.value ? 'badge-amber' : 'badge-gray'}`}
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {images?.length === 0 && (
        <div className="section">
          <div className="empty-state">No images found</div>
        </div>
      )}

      <div className="images-grid">
        {images?.map((image) => (
          <div key={image.id} className="image-card">
            {image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.image_description ?? 'Image'}
                className="image-preview"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const div = document.createElement('div')
                    div.className = 'image-no-preview'
                    div.textContent = 'preview unavailable'
                    parent.insertBefore(div, target.nextSibling)
                  }
                }}
              />
            ) : (
              <div className="image-no-preview">no url</div>
            )}
            <div className="image-meta">
              <div className="image-meta-title">
                {image.image_description ?? image.url ?? image.id.slice(0, 16)}
              </div>
              <div className="image-badges">
                {image.is_public ? (
                  <span className="badge badge-green">public</span>
                ) : (
                  <span className="badge badge-gray">private</span>
                )}
                {image.is_common_use && <span className="badge badge-blue">common use</span>}
                {image.celebrity_recognition && (
                  <span className="badge badge-amber">celeb</span>
                )}
              </div>
              <div className="image-actions">
                <Link
                  href={`/admin/images/${image.id}/edit`}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Edit
                </Link>
                <form action={deleteImage.bind(null, image.id)} style={{ flex: 1 }}>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={(e) => {
                      if (!confirm('Delete this image? This cannot be undone.')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
