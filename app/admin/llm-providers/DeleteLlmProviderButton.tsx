'use client'

import { deleteLlmProvider } from '@/lib/actions/llm'

export default function DeleteLlmProviderButton({ providerId }: { providerId: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this LLM provider? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteLlmProvider.bind(null, providerId)}>
      <button
        type="submit"
        className="btn btn-danger btn-sm"
        onClick={handleClick}
      >
        Delete
      </button>
    </form>
  )
}
