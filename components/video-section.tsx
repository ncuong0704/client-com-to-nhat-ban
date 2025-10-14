import { getVideoData } from "@/data/loaders"
import { VideoSectionClient } from "./video-section.client"
import { VideoSectionProps } from "@/types"
import { Loading } from "./loading"

export async function VideoSection({ video, locale }: { video: VideoSectionProps, locale: string }) {
  const [videoRes] = await Promise.all([
    getVideoData(locale),
  ])
  if (!videoRes || !videoRes.data) {
    return <Loading />
  }
  return (
    <VideoSectionClient video={video} videoRes={videoRes} />
  )
}
