'use client'

import { deleteAllowedDomain } from '@/lib/actions'

export default function DeleteDomainButton({ domainId }: { domainId: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this domain? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteAllowedDomain.bind(null, domainId)}>
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
