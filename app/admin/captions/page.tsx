import { adminClient } from '@/lib/supabase/admin'

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; filter?: string; q?: string }>
}) {
  const params = await searchParams
  const sort = params.sort ?? 'newest'
  const filter = params.filter ?? 'all'
  const q = params.q ?? ''

  let query = adminClient.from('captions').select('*, profiles(first_name, last_name, email)')

  if (filter === 'featured') query = query.eq('is_featured', true)
  if (filter === 'public') query = query.eq('is_public', true)
  if (filter === 'private') query = query.eq('is_public', false)
  if (q) query = query.ilike('content', `%${q}%`)

  if (sort === 'likes') query = query.order('like_count', { ascending: false })
  else if (sort === 'oldest') query = query.order('created_datetime_utc', { ascending: true })
  else query = query.order('created_datetime_utc', { ascending: false })

  const { data: captions } = await query.limit(150)

  const totalLikes = captions?.reduce((sum, c) => sum + (c.like_count || 0), 0) ?? 0

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Captions</h1>
          <p className="page-subtitle">// read-only · {captions?.length ?? 0} results · {totalLikes.toLocaleString()} total likes</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form method="GET" style={{ display: 'flex', gap: '8px' }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search caption content..."
            className="form-input"
            style={{ maxWidth: '280px' }}
          />
          <input type="hidden" name="filter" value={filter} />
          <input type="hidden" name="sort" value={sort} />
          <button type="submit" className="btn btn-ghost">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'featured', label: '★ Featured' },
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
          ].map((f) => (
            <a
              key={f.value}
              href={`?filter=${f.value}&sort=${sort}${q ? `&q=${q}` : ''}`}
              className={`badge ${filter === f.value ? 'badge-amber' : 'badge-gray'}`}
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
            >
              {f.label}
            </a>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'likes', label: 'Most Liked' },
          ].map((s) => (
            <a
              key={s.value}
              href={`?sort=${s.value}&filter=${filter}${q ? `&q=${q}` : ''}`}
              className={`badge ${sort === s.value ? 'badge-blue' : 'badge-gray'}`}
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Author</th>
              <th>Likes</th>
              <th>Flags</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {captions?.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">No captions found</td>
              </tr>
            )}
            {captions?.map((caption) => {
              const profile = caption.profiles as { first_name: string | null; last_name: string | null; email: string | null } | null
              const authorName = profile
                ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || 'Unknown'
                : caption.profile_id?.slice(0, 8) + '...'

              return (
                <tr key={caption.id}>
                  <td style={{ maxWidth: '400px' }}>
                    <div className="truncate" style={{ fontSize: '13px', color: 'var(--text)' }}>
                      {caption.content ?? <em className="text-muted">(empty)</em>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{authorName}</span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: '15px',
                      color: caption.like_count > 0 ? 'var(--accent)' : 'var(--text-muted)',
                    }}>
                      {caption.like_count ?? 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {caption.is_featured && <span className="badge badge-amber">featured</span>}
                      {caption.is_public
                        ? <span className="badge badge-green">public</span>
                        : <span className="badge badge-gray">private</span>}
                    </div>
                  </td>
                  <td>
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      {new Date(caption.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: '2-digit',
                      })}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
