'use client'

import { useState } from 'react'
import { Image } from '@/lib/types'

interface ImageFormProps {
  image?: Partial<Image>
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function ImageForm({ image, action, submitLabel }: ImageFormProps) {
  const [isPublic, setIsPublic] = useState(image?.is_public ?? false)
  const [isCommonUse, setIsCommonUse] = useState(image?.is_common_use ?? false)
  const [urlPreview, setUrlPreview] = useState(image?.url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('is_public', isPublic ? 'true' : 'false')
    formData.set('is_common_use', isCommonUse ? 'true' : 'false')
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
        {error && (
          <div className="login-error">{error}</div>
        )}

        <div className="form-group">
          <label className="form-label">Image URL *</label>
          <input
            name="url"
            type="url"
            className="form-input"
            defaultValue={image?.url ?? ''}
            placeholder="https://example.com/image.jpg"
            required
            onChange={(e) => setUrlPreview(e.target.value)}
          />
          {urlPreview && (
            <div style={{ marginTop: '8px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '200px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlPreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Image Description</label>
          <textarea
            name="image_description"
            className="form-textarea"
            defaultValue={image?.image_description ?? ''}
            placeholder="Describe what's in this image..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Context</label>
          <textarea
            name="additional_context"
            className="form-textarea"
            defaultValue={image?.additional_context ?? ''}
            placeholder="Any extra context for caption generation..."
            style={{ minHeight: '60px' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Celebrity Recognition</label>
          <input
            name="celebrity_recognition"
            className="form-input"
            defaultValue={image?.celebrity_recognition ?? ''}
            placeholder="e.g. John Smith, Jane Doe"
          />
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Visibility & Access</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="form-toggle-row">
              <span className="form-toggle-label">Public</span>
              <input type="hidden" name="is_public" value={isPublic ? 'true' : 'false'} />
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                style={{
                  width: '44px', height: '24px',
                  borderRadius: '12px',
                  background: isPublic ? 'var(--accent)' : 'var(--surface-3)',
                  border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: isPublic ? '23px' : '3px',
                  width: '18px', height: '18px',
                  borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
            <div className="form-toggle-row">
              <span className="form-toggle-label">Common Use</span>
              <input type="hidden" name="is_common_use" value={isCommonUse ? 'true' : 'false'} />
              <button
                type="button"
                onClick={() => setIsCommonUse(!isCommonUse)}
                style={{
                  width: '44px', height: '24px',
                  borderRadius: '12px',
                  background: isCommonUse ? 'var(--accent)' : 'var(--surface-3)',
                  border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: isCommonUse ? '23px' : '3px',
                  width: '18px', height: '18px',
                  borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
          <a href="/admin/images" className="btn btn-ghost">Cancel</a>
        </div>
      </div>
    </form>
  )
}
