import { adminClient } from '@/lib/supabase/admin'

async function getDashboardStats() {
  const [
    { count: totalProfiles },
    { count: totalImages },
    { count: totalCaptions },
    { count: featuredCaptions },
    { count: publicCaptions },
    { count: studyUsers },
    { count: superadmins },
    { count: commonImages },
    { data: topRatedCaptions },
    { data: topCaptioners },
    { data: likesData },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('images').select('*', { count: 'exact', head: true }),
    adminClient.from('captions').select('*', { count: 'exact', head: true }),
    adminClient.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    adminClient.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_in_study', true),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_superadmin', true),
    adminClient.from('images').select('*', { count: 'exact', head: true }).eq('is_common_use', true),
    adminClient.from('captions').select('content, like_count, profile_id').order('like_count', { ascending: false }).gt('like_count', 0).limit(5),
    adminClient.from('captions').select('profile_id').not('profile_id', 'is', null),
    adminClient.from('captions').select('like_count'),
  ])

  // Total likes & distribution
  const totalLikes = likesData?.reduce((sum, c) => sum + (c.like_count || 0), 0) ?? 0
  const avgLikes = totalCaptions ? (totalLikes / totalCaptions).toFixed(1) : '0'

  const unrated = likesData?.filter(c => !c.like_count || c.like_count === 0).length ?? 0
  const rated1to5 = likesData?.filter(c => (c.like_count ?? 0) >= 1 && (c.like_count ?? 0) <= 5).length ?? 0
  const rated6to10 = likesData?.filter(c => (c.like_count ?? 0) >= 6 && (c.like_count ?? 0) <= 10).length ?? 0
  const ratedOver10 = likesData?.filter(c => (c.like_count ?? 0) > 10).length ?? 0
  const totalRated = (likesData?.length ?? 0) - unrated
  const ratedPct = totalCaptions ? Math.round((totalRated / totalCaptions) * 100) : 0

  // Top captioners — count by profile_id
  const profileCounts: Record<string, number> = {}
  topCaptioners?.forEach((c) => {
    if (c.profile_id) profileCounts[c.profile_id] = (profileCounts[c.profile_id] || 0) + 1
  })
  const sortedProfiles = Object.entries(profileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Collect all profile IDs we need to look up (captioners + top rated caption authors)
  const captionerIds = sortedProfiles.map(([id]) => id)
  const ratedAuthorIds = (topRatedCaptions ?? []).map((c) => c.profile_id).filter(Boolean) as string[]
  const allProfileIds = [...new Set([...captionerIds, ...ratedAuthorIds])]

  const { data: profileNames } = allProfileIds.length
    ? await adminClient.from('profiles').select('id, first_name, last_name, email').in('id', allProfileIds)
    : { data: [] }

  const resolveAuthor = (id: string | null) => {
    if (!id) return 'Unknown'
    const p = profileNames?.find((x) => x.id === id)
    if (!p) return 'Unknown'
    return `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'Anonymous'
  }

  const leaderboard = sortedProfiles.map(([id, count]) => {
    const p = profileNames?.find((x) => x.id === id)
    return {
      id,
      name: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Anonymous' : 'Unknown',
      email: p?.email ?? '',
      count,
    }
  })

  // Recent 7 days vs prior 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString()

  const { count: recentCaptions } = await adminClient
    .from('captions')
    .select('*', { count: 'exact', head: true })
    .gte('created_datetime_utc', sevenDaysAgo)

  const { count: priorCaptions } = await adminClient
    .from('captions')
    .select('*', { count: 'exact', head: true })
    .gte('created_datetime_utc', fourteenDaysAgo)
    .lt('created_datetime_utc', sevenDaysAgo)

  return {
    totalProfiles: totalProfiles ?? 0,
    totalImages: totalImages ?? 0,
    totalCaptions: totalCaptions ?? 0,
    featuredCaptions: featuredCaptions ?? 0,
    publicCaptions: publicCaptions ?? 0,
    studyUsers: studyUsers ?? 0,
    superadmins: superadmins ?? 0,
    commonImages: commonImages ?? 0,
    totalLikes,
    avgLikes,
    totalRated,
    unrated,
    rated1to5,
    rated6to10,
    ratedOver10,
    ratedPct,
    topRatedCaptions: (topRatedCaptions ?? []).map((c) => ({
      ...c,
      authorName: resolveAuthor(c.profile_id),
    })),
    leaderboard,
    recentCaptions: recentCaptions ?? 0,
    priorCaptions: priorCaptions ?? 0,
    featuredRate: totalCaptions ? ((featuredCaptions ?? 0) / totalCaptions * 100).toFixed(1) : '0',
    studyRate: totalProfiles ? ((studyUsers ?? 0) / totalProfiles * 100).toFixed(0) : '0',
    publicRate: totalCaptions ? ((publicCaptions ?? 0) / totalCaptions * 100).toFixed(0) : '0',
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const velocityDelta = stats.recentCaptions - stats.priorCaptions
  const velocityUp = velocityDelta >= 0
  const maxBucket = Math.max(stats.unrated, stats.rated1to5, stats.rated6to10, stats.ratedOver10, 1)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mission Control</h1>
        <p className="page-subtitle">// real-time stats from your humor study database</p>
      </div>

      {/* Top stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Registered Users</div>
          <div className="stat-value">{stats.totalProfiles.toLocaleString()}</div>
          <div className="stat-sub">{stats.studyRate}% enrolled in study</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Captions Written</div>
          <div className="stat-value accent">{stats.totalCaptions.toLocaleString()}</div>
          <div className={`stat-delta ${velocityUp ? 'up' : 'down'}`}>
            {velocityUp ? '↑' : '↓'} {Math.abs(velocityDelta)} vs last week
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Images in Library</div>
          <div className="stat-value">{stats.totalImages.toLocaleString()}</div>
          <div className="stat-sub">{stats.commonImages} available to all users</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Likes Given</div>
          <div className="stat-value">{stats.totalLikes.toLocaleString()}</div>
          <div className="stat-sub">avg {stats.avgLikes} likes per caption</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Captions Liked</div>
          <div className="stat-value accent">{stats.ratedPct}%</div>
          <div className="stat-sub">{stats.totalRated.toLocaleString()} of {stats.totalCaptions.toLocaleString()} have at least 1 like</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Study Enrollment</div>
          <div className="stat-value">{stats.studyRate}%</div>
          <div className="stat-sub">{stats.studyUsers} of {stats.totalProfiles} users in the study</div>
        </div>
      </div>

      {/* Rating distribution + top rated side by side */}
      <div className="two-col" style={{ marginBottom: '0' }}>
        {/* Rating distribution */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Like Distribution</span>
            <span className="badge badge-amber">{stats.totalCaptions} captions total</span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            How many captions fall into each like-count range
          </div>
          <div className="bar-chart">
            <div className="bar-row">
              <span className="bar-label" style={{ color: 'var(--text-muted)' }}>No likes</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(stats.unrated / maxBucket) * 100}%`, background: 'var(--text-muted)' }} />
              </div>
              <span className="bar-value">{stats.unrated}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label" style={{ color: '#60a5fa' }}>1–5 likes</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(stats.rated1to5 / maxBucket) * 100}%`, background: '#60a5fa' }} />
              </div>
              <span className="bar-value">{stats.rated1to5}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label" style={{ color: '#34d399' }}>6–10 likes</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(stats.rated6to10 / maxBucket) * 100}%`, background: '#34d399' }} />
              </div>
              <span className="bar-value">{stats.rated6to10}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label" style={{ color: 'var(--accent)' }}>10+ likes</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(stats.ratedOver10 / maxBucket) * 100}%` }} />
              </div>
              <span className="bar-value">{stats.ratedOver10}</span>
            </div>
          </div>
        </div>

        {/* Caption visibility */}
        <div>
          <div className="section" style={{ marginBottom: '24px' }}>
            <div className="section-header">
              <span className="section-title">Caption Visibility</span>
            </div>
            <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
              Public captions are visible to all users; private are hidden
            </div>
            <div className="bar-chart">
              <div className="bar-row">
                <span className="bar-label">Public</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${stats.publicRate}%` }} />
                </div>
                <span className="bar-value">{stats.publicCaptions}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Private</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${100 - parseInt(stats.publicRate)}%`, background: 'var(--text-muted)' }} />
                </div>
                <span className="bar-value">{stats.totalCaptions - stats.publicCaptions}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Featured</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${stats.featuredRate}%`, background: '#60a5fa' }} />
                </div>
                <span className="bar-value">{stats.featuredCaptions}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="section-title">User Roles</span>
            </div>
            <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
              Breakdown of user types out of {stats.totalProfiles} total
            </div>
            <div className="bar-chart">
              <div className="bar-row">
                <span className="bar-label">In Study</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${stats.studyRate}%`, background: '#4ade80' }} />
                </div>
                <span className="bar-value">{stats.studyUsers}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Superadmin</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(stats.superadmins / Math.max(stats.totalProfiles, 1)) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <span className="bar-value">{stats.superadmins}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Rated Captions */}
      {stats.topRatedCaptions.length > 0 && (
        <div className="section" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div className="section-header">
            <span className="section-title">Most Liked Captions</span>
            <span className="badge badge-amber">top 5 by like count</span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            The captions that received the most likes from other users
          </div>
          {stats.topRatedCaptions.map((caption, i) => (
            <div key={i} className="caption-spotlight" style={{ borderBottom: i < stats.topRatedCaptions.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  minWidth: '28px',
                  lineHeight: 1,
                  paddingTop: '2px',
                }}>
                  {i === 0 ? '★' : `${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="caption-spotlight-content" style={{ marginBottom: '8px' }}>
                    {caption.content ?? '(no content)'}
                  </div>
                  <div className="caption-spotlight-meta">
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>♥ {caption.like_count} likes</span>
                    <span>by {caption.authorName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col">
        {/* Most active writers */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Most Active Writers</span>
            <span className="badge badge-amber">by captions written</span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            Users who have submitted the most captions
          </div>
          {stats.leaderboard.length === 0 ? (
            <div className="empty-state">no caption data yet</div>
          ) : (
            <ul className="leaderboard">
              {stats.leaderboard.map((entry, i) => (
                <li key={entry.id} className="leaderboard-item">
                  <span className={`leaderboard-rank ${i === 0 ? 'top' : ''}`}>
                    {i === 0 ? '★' : `${i + 1}`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="leaderboard-name truncate">{entry.name}</div>
                    <div className="leaderboard-email truncate">{entry.email}</div>
                  </div>
                  <div className="leaderboard-count" title="captions written">{entry.count}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weekly caption creation */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">New Captions This Week</span>
            <span className={`badge ${velocityUp ? 'badge-green' : 'badge-red'}`}>
              {velocityUp ? '↑' : '↓'} vs prior week
            </span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            How many new captions were submitted each week
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '24px', borderRight: '1px solid var(--border)' }}>
              <div className="stat-label">Last 7 Days</div>
              <div className="stat-value accent">{stats.recentCaptions}</div>
              <div className="stat-sub">captions submitted</div>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="stat-label">Prior 7 Days</div>
              <div className="stat-value">{stats.priorCaptions}</div>
              <div className="stat-sub">captions submitted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
