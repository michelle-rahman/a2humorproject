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
    { data: topCaptioners },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('images').select('*', { count: 'exact', head: true }),
    adminClient.from('captions').select('*', { count: 'exact', head: true }),
    adminClient.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    adminClient.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_in_study', true),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_superadmin', true),
    adminClient.from('images').select('*', { count: 'exact', head: true }).eq('is_common_use', true),
    adminClient.from('captions').select('profile_id').not('profile_id', 'is', null),
  ])

  // Real vote stats via admin RPC functions
  const [voteSummaryRes, voteDistRes, topRatedRes] = await Promise.all([
    adminClient.rpc('admin_vote_summary'),
    adminClient.rpc('admin_vote_distribution'),
    adminClient.rpc('admin_top_rated_captions'),
  ])

  const voteSummary = (voteSummaryRes.data as any)?.[0] ?? {
    total_votes: 0, upvotes: 0, downvotes: 0, captions_rated: 0, raters: 0,
  }
  const voteDistribution: { bucket: string; bucket_order: number; captions: number }[] =
    (voteDistRes.data as any) ?? []
  const topRatedCaptions: { content: string; profile_email: string; vote_count: number; net_score: number; upvotes: number; downvotes: number }[] =
    ((topRatedRes.data as any) ?? []).slice(0, 5)

  const ratedPct = totalCaptions ? Math.round((voteSummary.captions_rated / totalCaptions) * 100) : 0

  // Top captioners — count by profile_id
  const profileCounts: Record<string, number> = {}
  topCaptioners?.forEach((c) => {
    if (c.profile_id) profileCounts[c.profile_id] = (profileCounts[c.profile_id] || 0) + 1
  })
  const sortedProfiles = Object.entries(profileCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
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

  // Weekly caption creation
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString()

  const { count: recentCaptions } = await adminClient
    .from('captions').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo)
  const { count: priorCaptions } = await adminClient
    .from('captions').select('*', { count: 'exact', head: true })
    .gte('created_datetime_utc', fourteenDaysAgo).lt('created_datetime_utc', sevenDaysAgo)

  return {
    totalProfiles: totalProfiles ?? 0,
    totalImages: totalImages ?? 0,
    totalCaptions: totalCaptions ?? 0,
    featuredCaptions: featuredCaptions ?? 0,
    publicCaptions: publicCaptions ?? 0,
    studyUsers: studyUsers ?? 0,
    superadmins: superadmins ?? 0,
    commonImages: commonImages ?? 0,
    voteSummary,
    voteDistribution,
    topRatedCaptions,
    ratedPct,
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
  const maxBucket = Math.max(...stats.voteDistribution.map((b) => b.captions), 1)

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
          <div className="stat-label">Total Votes Cast</div>
          <div className="stat-value">{stats.voteSummary.total_votes.toLocaleString()}</div>
          <div className="stat-sub">
            ↑ {stats.voteSummary.upvotes.toLocaleString()} · ↓ {stats.voteSummary.downvotes.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Captions Voted On</div>
          <div className="stat-value accent">{stats.ratedPct}%</div>
          <div className="stat-sub">{stats.voteSummary.captions_rated.toLocaleString()} of {stats.totalCaptions.toLocaleString()} received votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Voters</div>
          <div className="stat-value">{stats.voteSummary.raters.toLocaleString()}</div>
          <div className="stat-sub">unique users who have voted</div>
        </div>
      </div>

      {/* Vote distribution + visibility */}
      <div className="two-col" style={{ marginBottom: '0' }}>
        <div className="section">
          <div className="section-header">
            <span className="section-title">Vote Distribution</span>
            <span className="badge badge-amber">{stats.voteSummary.captions_rated.toLocaleString()} captions voted on</span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            How many captions fall into each vote-count range
          </div>
          <div className="bar-chart">
            {stats.voteDistribution.map((bucket, i) => {
              const colors = ['#60a5fa', '#34d399', 'var(--accent)', '#f472b6', '#a78bfa']
              return (
                <div key={bucket.bucket} className="bar-row">
                  <span className="bar-label" style={{ color: colors[i] }}>{bucket.bucket}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(bucket.captions / maxBucket) * 100}%`, background: colors[i] }} />
                  </div>
                  <span className="bar-value">{bucket.captions.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

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

      {/* Top rated captions */}
      {stats.topRatedCaptions.length > 0 && (
        <div className="section" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div className="section-header">
            <span className="section-title">Most Voted Captions</span>
            <span className="badge badge-amber">top 5 by vote count</span>
          </div>
          <div style={{ padding: '12px 24px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            Captions with the most total votes (upvotes + downvotes). Net score = upvotes − downvotes.
          </div>
          {stats.topRatedCaptions.map((caption, i) => (
            <div key={i} className="caption-spotlight" style={{ borderBottom: i < stats.topRatedCaptions.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800,
                  color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  minWidth: '28px', lineHeight: 1, paddingTop: '2px',
                }}>
                  {i === 0 ? '★' : `${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="caption-spotlight-content" style={{ marginBottom: '8px' }}>
                    {caption.content ?? '(no content)'}
                  </div>
                  <div className="caption-spotlight-meta">
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>↑ {caption.upvotes}</span>
                    <span style={{ color: '#f87171', fontWeight: 600 }}>↓ {caption.downvotes}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>net +{caption.net_score}</span>
                    <span>{caption.vote_count} total votes</span>
                    <span>by {caption.profile_email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col">
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
                  <span className={`leaderboard-rank ${i === 0 ? 'top' : ''}`}>{i === 0 ? '★' : `${i + 1}`}</span>
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
