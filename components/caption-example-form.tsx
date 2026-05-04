'use client'

import { useState } from 'react'

interface CaptionExample {
  id?: string | number
  caption?: string
  explanation?: string
  priority?: number
}

interface CaptionExampleFormProps {
  example?: CaptionExample
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function CaptionExampleForm({ example, action, submitLabel }: CaptionExampleFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    try {
      await action(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Caption *</label>
          <textarea
            name="caption"
            className="form-textarea"
            defaultValue={example?.caption ?? ''}
            placeholder="The caption text…"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Explanation</label>
          <textarea
            name="explanation"
            className="form-textarea"
            defaultValue={example?.explanation ?? ''}
            placeholder="Why is this caption funny or a good example?"
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <input
            name="priority"
            type="number"
            className="form-input"
            defaultValue={example?.priority ?? 1}
            min={1}
            style={{ maxWidth: '120px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : submitLabel}
          </button>
          <a href="/admin/caption-examples" className="btn btn-ghost">Cancel</a>
        </div>
      </div>
    </form>
  )
}
