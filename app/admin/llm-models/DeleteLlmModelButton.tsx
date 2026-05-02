'use client'

import { deleteLlmModel } from '@/lib/actions/llm'

export default function DeleteLlmModelButton({ modelId }: { modelId: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this LLM model? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteLlmModel.bind(null, modelId)}>
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
