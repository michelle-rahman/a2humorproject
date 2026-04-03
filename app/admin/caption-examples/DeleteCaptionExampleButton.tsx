
"use client"

import { deleteCaptionExample } from '@/lib/actions/caption-examples'

interface DeleteButtonProps {
  exampleId: string;
}

export default function DeleteCaptionExampleButton({ exampleId }: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this caption example? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteCaptionExample.bind(null, exampleId)}>
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
