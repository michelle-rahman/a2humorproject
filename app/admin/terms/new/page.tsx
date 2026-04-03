
import { createTerm } from '@/lib/actions/terms';
import TermForm from '@/components/term-form';
import Link from 'next/link';

export default function NewTermPage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Terms
          </Link>
        </div>
        <h1 className="page-title">New Term</h1>
        <p className="page-subtitle">Add a new term to the list.</p>
      </div>

      <div className="section p-6">
        <TermForm action={createTerm} submitLabel="Create Term" />
      </div>
    </div>
  );
}
