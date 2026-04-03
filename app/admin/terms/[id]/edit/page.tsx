
import { adminClient } from '@/lib/supabase/admin'
import { updateTerm } from '@/lib/actions/terms'
import TermForm from '@/components/term-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditTermPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const { data: term } = await adminClient
    .from('terms')
    .select('*')
    .eq('id', id)
    .single()

  if (!term) notFound()

  const updateWithId = updateTerm.bind(null, id)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Terms
          </Link>
        </div>
        <h1 className="page-title">Edit Term</h1>
        <p className="page-subtitle mono" style={{ fontSize: '11px' }}>
          // id: {term.id}
        </p>
      </div>

      <div className="section p-6">
        <TermForm term={term} action={updateWithId} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
