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

function isCloudinaryDeliveryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com/");
}

function hasCloudinaryTransform(url: string): boolean {
  const { main } = splitUrlSuffix(url);
  const marker = "/upload/";
  const idx = main.indexOf(marker);
  if (idx < 0) return false;

  const afterUpload = main.slice(idx + marker.length).replace(/^\/+/, "");
  const firstSegment = afterUpload.split("/")[0] ?? "";
  if (!firstSegment) return false;

  // Nếu segment đầu tiên là version (v123...), tức là CHƯA có transform.
  if (/^v\d+$/.test(firstSegment)) return false;

  // Heuristic: transform segment thường bắt đầu bằng các key như w_,h_,c_,q_,f_...
  const transformKeys = [
    "w_",
    "h_",
    "c_",
    "q_",
    "f_",
    "ar_",
    "dpr_",
    "g_",
    "e_",
    "fl_",
    "a_",
    "b_",
    "bo_",
    "co_",
    "l_",
    "o_",
    "r_",
    "t_",
    "u_",
    "x_",
    "y_",
    "z_",
  ];

  return transformKeys.some((k) => firstSegment.startsWith(k)) || firstSegment.includes(",");
}

function splitUrlSuffix(url: string): { main: string; suffix: string } {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  let cutIndex = -1;
  if (queryIndex >= 0 && hashIndex >= 0) cutIndex = Math.min(queryIndex, hashIndex);
  else if (queryIndex >= 0) cutIndex = queryIndex;
  else if (hashIndex >= 0) cutIndex = hashIndex;

  if (cutIndex < 0) return { main: url, suffix: "" };
  return { main: url.slice(0, cutIndex), suffix: url.slice(cutIndex) };
}

function injectCloudinaryTransform(url: string, transform: string): string {
  const { main, suffix } = splitUrlSuffix(url);
  const marker = "/upload/";
  const idx = main.indexOf(marker);
  if (idx < 0) return url;

  const prefix = main.slice(0, idx + marker.length);
  const rest = main.slice(idx + marker.length).replace(/^\/+/, "");
  return `${prefix}${transform}/${rest}${suffix}`;
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

  const isFill = isFillLayout(props);
  const effectiveQuality =
    quality ?? (type === "hero" ? 80 : type === "thumbnail" ? 70 : 75);
  const effectiveSizes = sizes ?? (isFill ? "100vw" : `${props.width}px`);
  const shouldLazy = lazy ?? !priority;
  const baseUrl = imageUrl || "/placeholder.svg";
  let widthTransform = type === "thumbnail" ? 500 : 1000;
  const cloudinaryTransform = `c_limit,w_${widthTransform},q_auto,f_auto`;
  const shouldInjectCloudinary =
    isCloudinaryDeliveryUrl(baseUrl) && !hasCloudinaryTransform(baseUrl);
  const finalUrl = shouldInjectCloudinary
    ? injectCloudinaryTransform(baseUrl, cloudinaryTransform)
    : baseUrl;

  if (isFill) {
    return (
      <Image
        src={finalUrl}
        alt={alt || ""}
        className={className}
        fill
        sizes={effectiveSizes}
        priority={priority}
        quality={effectiveQuality}
        placeholder={placeholder ?? "empty"}
        blurDataURL={blurDataURL}
        fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
        loading={shouldLazy ? "lazy" : "eager"}
      />
    );
  }

  return (
    <Image
      src={finalUrl}
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
      loading={shouldLazy ? "lazy" : "eager"}
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
