"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/** Gambar produk dengan placeholder netral bila URL kosong atau gagal dimuat. */
export default function ProductImage({ src, alt, className = "" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`} role="img" aria-label={alt}>
        <ImageOff size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`bg-slate-100 object-cover ${className}`}
    />
  );
}
