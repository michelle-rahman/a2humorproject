"use client"

import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string;
  alt: string;
}

export default function ImageWithFallback({ src, alt }: ImageWithFallbackProps) {
  const [isError, setIsError] = useState(false)

  if (isError) {
    return (
      <div className="image-no-preview">
        preview unavailable
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="image-preview"
      onError={() => setIsError(true)}
    />
  )
}
