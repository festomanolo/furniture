import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { imageSet } from "@/lib/media";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  base: string;
  sizes?: string;
  priority?: boolean;
  wrapperClassName?: string;
}

/** Responsive, lazy image with reserved space (no CLS) and a soft fade-in. */
export function Img({ base, sizes = "(min-width: 1024px) 25vw, 50vw", priority, className, wrapperClassName, alt, ...rest }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { src, srcSet } = imageSet(base);
  return (
    <div className={cn("relative overflow-hidden bg-sage", wrapperClassName)}>
      {!failed && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("size-full object-cover transition-[opacity,transform] duration-500 ease-out", loaded ? "opacity-100" : "opacity-0", className)}
          {...rest}
        />
      )}
    </div>
  );
}
