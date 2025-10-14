import Image from "next/image";
import { getStrapiURL } from "@/utils/get-strapi-url";

interface StrapiImageFormats {
  thumbnail?: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
  small?: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
  large?: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
}

interface StrapiImageData {
  url: string;
  alternativeText?: string;
  formats?: StrapiImageFormats;
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

// Get optimal image format based on container size and device
function getOptimalImageFormat(
  imageData: StrapiImageData | string | null,
  containerWidth: number = 1920,
  containerHeight: number = 1080,
  devicePixelRatio: number = 1,
  type: 'hero' | 'thumbnail' | 'default' = 'default'
): string {
  if (!imageData || typeof imageData === 'string') {
    return imageData || "https://res.cloudinary.com/dxprp1gzi/image/upload/v1759919032/placeholder_51543b49f8.svg";
  }

  if (!imageData.formats) {
    return imageData.url || "https://res.cloudinary.com/dxprp1gzi/image/upload/v1759919032/placeholder_51543b49f8.svg";
  }

  const { formats } = imageData;
  const targetWidth = containerWidth * devicePixelRatio;
  const targetHeight = containerHeight * devicePixelRatio;

  // Mobile optimization - prefer smaller formats
  if (containerWidth <= 768) {
    if (formats.small && formats.small.width >= targetWidth) {
      return formats.small.url;
    }
    if (formats.thumbnail && formats.thumbnail.width >= targetWidth) {
      return formats.thumbnail.url;
    }
  }

  // Tablet optimization
  if (containerWidth <= 1024) {
    if (formats.medium && formats.medium.width >= targetWidth) {
      return formats.medium.url;
    }
    if (formats.small && formats.small.width >= targetWidth) {
      return formats.small.url;
    }
  }

  // Desktop optimization
  if (formats.large && formats.large.width >= targetWidth) {
    return formats.large.url;
  }
  if (formats.medium && formats.medium.width >= targetWidth) {
    return formats.medium.url;
  }

  // Fallback to original
  return imageData.url;
}

// Get optimal quality based on image type and priority
function getOptimalQuality(priority: boolean, type: 'hero' | 'thumbnail' | 'default' = 'default'): number {
  if (priority && type === 'hero') return 90;
  if (priority) return 85;
  if (type === 'thumbnail') return 70;
  return 80;
}

// Get responsive image sizes for different breakpoints
function getResponsiveImageSizes(): string {
  return "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw";
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

  // Get optimal image URL
  const getImageUrl = () => {
    if (typeof src === 'string') {
      return getStrapiMedia(src);
    }
    
    if (src && typeof src === 'object') {
      // For SSR, use original URL
      if (typeof window === 'undefined') {
        return getStrapiMedia(src.url);
      }
      
      // For client-side, use optimal format
      const containerWidth = window.innerWidth || 1920;
      const containerHeight = window.innerHeight || 1080;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      const optimalUrl = getOptimalImageFormat(
        src,
        containerWidth,
        containerHeight,
        devicePixelRatio,
        type
      );
      
      return getStrapiMedia(optimalUrl);
    }
    
    return getStrapiMedia("");
  };

  const imageUrl = getImageUrl();
  if (!imageUrl) return null;

  // Get optimal quality and sizes
  const optimalQuality = quality ?? getOptimalQuality(priority || false, type);
  const optimalSizes = sizes ?? getResponsiveImageSizes();

  if (isFillLayout(props)) {
    return (
      <Image
        src={imageUrl || "https://res.cloudinary.com/dxprp1gzi/image/upload/v1759919032/placeholder_51543b49f8.svg"}
        alt={alt || ""}
        className={className}
        fill
        sizes={optimalSizes}
        priority={priority}
        quality={optimalQuality}
        placeholder={placeholder ?? "empty"}
        blurDataURL={blurDataURL}
        fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
        loading={lazy ? "lazy" : "eager"}
      />
    );
  }

  return (
    <Image
      src={imageUrl || "https://res.cloudinary.com/dxprp1gzi/image/upload/v1759919032/placeholder_51543b49f8.svg"}
      alt={alt || ""}
      className={className}
      width={props.width}
      height={props.height}
      sizes={optimalSizes}
      priority={priority}
      quality={optimalQuality}
      placeholder={placeholder ?? "empty"}
      blurDataURL={blurDataURL}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
      loading={lazy ? "lazy" : "eager"}
    />
  );
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return getStrapiURL() + url;
}
