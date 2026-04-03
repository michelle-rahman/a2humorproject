
'use client'

import { useState } from 'react'

interface Term {
  id?: string;
  term?: string;
  definition?: string;
}

interface TermFormProps {
  term?: Term;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export default function TermForm({ term, action, submitLabel }: TermFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    try {
      await action(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {error && (
          <div className="login-error">{error}</div>
        )}

        <div className="form-group">
          <label className="form-label">Term *</label>
          <input
            name="term"
            type="text"
            className="form-input"
            defaultValue={term?.term ?? ''}
            placeholder="e.g., 'Woke'"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Definition</label>
          <textarea
            name="definition"
            className="form-textarea"
            defaultValue={term?.definition ?? ''}
            placeholder="Provide a definition for the term..."
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
          <a href="/admin/terms" className="btn btn-ghost">Cancel</a>
        </div>
      </div>
    </form>
  );
}
