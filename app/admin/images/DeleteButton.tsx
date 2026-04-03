"use client"

import { deleteImage } from '@/lib/actions'

interface DeleteButtonProps {
  imageId: string;
}

export default function DeleteButton({ imageId }: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this image? This cannot be undone.')) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteImage.bind(null, imageId)} style={{ flex: 1 }}>
      <button
        type="submit"
        className="btn btn-danger btn-sm"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleClick}
      >
        Delete
      </button>
    </form>
  )
}
