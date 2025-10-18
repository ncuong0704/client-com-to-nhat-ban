import Image from "next/image";
import { getStrapiURL } from "@/utils/get-strapi-url";

interface StrapiImageData {
  url: string;
  alternativeText?: string;
}

interface BaseImageProps {
  src?: string | StrapiImageData;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  fetchPriority?: "auto" | "high" | "low";
  lazy?: boolean;
  type?: 'hero' | 'thumbnail' | 'default';
}

interface WithFixedDimensions extends BaseImageProps {
  width: number;
  height: number;
  fill?: never;
}

interface WithFillLayout extends BaseImageProps {
  fill?: true;
  width?: never;
  height?: never;
}

type StrapiImageProps = WithFixedDimensions | WithFillLayout ;

function isFillLayout(props: StrapiImageProps): props is WithFillLayout {
  return (props as WithFillLayout).fill === true;
}

// Trả về ảnh gốc (original)
function getOriginalImageUrl(imageData: StrapiImageData | string | null): string {
  if (!imageData) return "/placeholder.svg";
  if (typeof imageData === 'string') return imageData;
  return imageData.url || "/placeholder.svg";
}

export function StrapiImage(props: Readonly<StrapiImageProps>) {
  const {
    src,
    alt,
    className,
    sizes,
    priority,
    quality,
    placeholder,
    blurDataURL,
    fetchPriority,
    lazy,
    type = 'default'
  } = props;

  // Lấy URL ảnh gốc
  const getImageUrl = () => {
    if (typeof src === 'string') {
      return getStrapiMedia(src);
    }
    
    if (src && typeof src === 'object') {
      if (typeof window === 'undefined') {
        return getStrapiMedia(src.url);
      }
      const originalUrl = getOriginalImageUrl(src);
      return getStrapiMedia(originalUrl);
    }
    
    return getStrapiMedia("");
  };

  const imageUrl = getImageUrl();
  if (!imageUrl) return null;

  const effectiveQuality = quality;
  const effectiveSizes = sizes ?? "100vw";

  if (isFillLayout(props)) {
    return (
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={alt || ""}
        className={className}
        fill
        sizes={effectiveSizes}
        priority={priority}
        quality={effectiveQuality}
        placeholder={placeholder ?? "empty"}
        blurDataURL={blurDataURL}
        fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
        loading={lazy ? "lazy" : "eager"}
      />
    );
  }

  return (
    <Image
      src={imageUrl || "/placeholder.svg"}
      alt={alt || ""}
      className={className}
      width={props.width}
      height={props.height}
      sizes={effectiveSizes}
      priority={priority}
      quality={effectiveQuality}
      placeholder={placeholder ?? "empty"}
      blurDataURL={blurDataURL}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
      loading={lazy ? "lazy" : "eager"}
    />
  );
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return "/placeholder.svg";
  if (url === "") return "/placeholder.svg";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return getStrapiURL() + url;
}
