
import { createCaptionExample } from '@/lib/actions/caption-examples';
import CaptionExampleForm from '@/components/caption-example-form';
import Link from 'next/link';

export default function NewCaptionExamplePage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Link href="/admin/caption-examples" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            ← Caption Examples
          </Link>
        </div>
        <h1 className="page-title">New Caption Example</h1>
        <p className="page-subtitle">Add a new caption example.</p>
      </div>

      <div className="section p-6">
        <CaptionExampleForm action={createCaptionExample} submitLabel="Create Caption Example" />
      </div>
    </div>
  );
}
