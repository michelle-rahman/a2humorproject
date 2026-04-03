
"use client"

import { deleteTerm } from '@/lib/actions/terms'

interface DeleteButtonProps {
  termId: string;
}

export default function DeleteTermButton({ termId }: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this term? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteTerm.bind(null, termId)}>
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
