'use client'

import { useState, useRef } from 'react'
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
  const [sourceMode, setSourceMode] = useState<'url' | 'upload'>('url')
  const [filePreview, setFilePreview] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => setFilePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFileName('')
      setFilePreview('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('is_public', isPublic ? 'true' : 'false')
    formData.set('is_common_use', isCommonUse ? 'true' : 'false')
    // Clear the unused source field
    if (sourceMode === 'upload') {
      formData.delete('url')
    } else {
      formData.delete('file')
    }
    try {
      await action(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const previewSrc = sourceMode === 'upload' ? filePreview : urlPreview

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {error && (
          <div className="login-error">{error}</div>
        )}

        {/* Source toggle */}
        <div>
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Image Source</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSourceMode('url')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.15s',
                background: sourceMode === 'url' ? 'var(--accent)' : 'var(--surface-2)',
                color: sourceMode === 'url' ? '#000' : 'var(--text-dim)',
                borderColor: sourceMode === 'url' ? 'var(--accent)' : 'var(--border)',
              }}
            >
              Enter URL
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.15s',
                background: sourceMode === 'upload' ? 'var(--accent)' : 'var(--surface-2)',
                color: sourceMode === 'upload' ? '#000' : 'var(--text-dim)',
                borderColor: sourceMode === 'upload' ? 'var(--accent)' : 'var(--border)',
              }}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* URL input */}
        {sourceMode === 'url' && (
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
          </div>
        )}

        {/* File upload input */}
        {sourceMode === 'upload' && (
          <div className="form-group">
            <label className="form-label">Image File *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--surface-2)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept="image/*"
                required
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {fileName ? (
                <div>
                  <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>{fileName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    click to change
                  </div>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--text-muted)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Click to choose a file</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    PNG, JPG, GIF, WebP
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {previewSrc && (
          <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '200px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

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
            {loading ? (sourceMode === 'upload' ? 'Uploading...' : 'Saving...') : submitLabel}
          </button>
          <a href="/admin/images" className="btn btn-ghost">Cancel</a>
        </div>
      </div>
    </form>
  )
}
