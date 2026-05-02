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

  const topIds = sortedProfiles.map(([id]) => id)
  const { data: profileNames } = topIds.length
    ? await adminClient.from('profiles').select('id, first_name, last_name, email').in('id', topIds)
    : { data: [] }

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
    topRatedCaptions: topRatedCaptions ?? [],
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
          <div className="stat-label">Total Profiles</div>
          <div className="stat-value">{stats.totalProfiles.toLocaleString()}</div>
          <div className="stat-sub">{stats.studyRate}% in study</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Captions</div>
          <div className="stat-value accent">{stats.totalCaptions.toLocaleString()}</div>
          <div className={`stat-delta ${velocityUp ? 'up' : 'down'}`}>
            {velocityUp ? '↑' : '↓'} {Math.abs(velocityDelta)} this week
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Images</div>
          <div className="stat-value">{stats.totalImages.toLocaleString()}</div>
          <div className="stat-sub">{stats.commonImages} common-use</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Likes</div>
          <div className="stat-value">{stats.totalLikes.toLocaleString()}</div>
          <div className="stat-sub">avg {stats.avgLikes} per caption</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Rated Captions</div>
          <div className="stat-value accent">{stats.ratedPct}%</div>
          <div className="stat-sub">{stats.totalRated.toLocaleString()} of {stats.totalCaptions.toLocaleString()} liked</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Study Participation</div>
          <div className="stat-value">{stats.studyRate}%</div>
          <div className="stat-sub">{stats.studyUsers} / {stats.totalProfiles} enrolled</div>
        </div>
      </div>

      {/* Rating Statistics */}
      <div className="section" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <span className="section-title">Caption Rating Distribution</span>
          <span className="badge badge-amber">{stats.totalRated} rated · {stats.unrated} unrated</span>
        </div>
        <div className="bar-chart">
          <div className="bar-row">
            <span className="bar-label" style={{ color: 'var(--text-muted)' }}>0 likes</span>
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

      {/* Top Rated Captions */}
      {stats.topRatedCaptions.length > 0 && (
        <div className="section" style={{ marginBottom: '24px' }}>
          <div className="section-header">
            <span className="section-title">Top Rated Captions</span>
            <span className="badge badge-amber">by likes</span>
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
                    <span>author: {caption.profile_id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col">
        {/* Leaderboard */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Top Captioners</span>
            <span className="badge badge-amber">by caption count</span>
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
                  <div className="leaderboard-count">{entry.count}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Content breakdown */}
        <div>
          {/* Caption visibility */}
          <div className="section" style={{ marginBottom: '24px' }}>
            <div className="section-header">
              <span className="section-title">Caption Visibility</span>
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

          {/* User roles */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">User Roles</span>
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

      {/* Weekly velocity detail */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div className="section-header">
          <span className="section-title">Caption Velocity</span>
          <span className={`badge ${velocityUp ? 'badge-green' : 'badge-red'}`}>
            {velocityUp ? '↑' : '↓'} week-over-week
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ padding: '24px', borderRight: '1px solid var(--border)' }}>
            <div className="stat-label">Last 7 Days</div>
            <div className="stat-value accent">{stats.recentCaptions}</div>
            <div className="stat-sub">captions created</div>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="stat-label">Prior 7 Days</div>
            <div className="stat-value">{stats.priorCaptions}</div>
            <div className="stat-sub">captions created</div>
          </div>
        </div>
      </div>
    </div>
  )
}
