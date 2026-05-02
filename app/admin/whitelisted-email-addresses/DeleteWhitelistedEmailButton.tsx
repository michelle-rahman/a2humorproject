'use client'

import { deleteWhitelistedEmail } from '@/lib/actions'

export default function DeleteWhitelistedEmailButton({ emailId }: { emailId: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this email address? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteWhitelistedEmail.bind(null, emailId)}>
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
