
'use client'

import { useState } from 'react'

interface CaptionExample {
  id?: string;
  content?: string;
}

interface CaptionExampleFormProps {
  example?: CaptionExample;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export default function CaptionExampleForm({ example, action, submitLabel }: CaptionExampleFormProps) {
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
          <label className="form-label">Content *</label>
          <textarea
            name="content"
            className="form-textarea"
            defaultValue={example?.content ?? ''}
            placeholder="Enter caption example content..."
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
          <a href="/admin/caption-examples" className="btn btn-ghost">Cancel</a>
        </div>
      </div>
    </form>
  );
}
