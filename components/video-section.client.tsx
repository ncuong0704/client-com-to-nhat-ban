"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { RevealSection } from "@/components/reveal-section"
import { VideoSectionProps } from "@/types"
import { StrapiImage } from "./StrapiImage"
 

interface VideoItem {
  id: number
  documentId: string
  title: string
  description: string
  youtubeId: string
  category_video: {
    id: number
    documentId: string
    name: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
    order: number | null
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string
}

function getYoutubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function VideoSectionClient({ video, videoRes }: { video: VideoSectionProps, videoRes: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Map tên category -> order (nhỏ trước, null xem như Infinity)
  const categoryOrderMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of (videoRes?.data ?? []) as VideoItem[]) {
      const name = v.category_video?.name || "Không xác định"
      const order = v.category_video?.order ?? Number.POSITIVE_INFINITY
      if (!map.has(name) || (map.get(name)! > order)) {
        map.set(name, order)
      }
    }
    return map
  }, [videoRes?.data])

  const categories = useMemo((): string[] => {
    const cats = Array.from(new Set((videoRes?.data as VideoItem[] | undefined)?.map((v) => v.category_video?.name || "Không xác định") ?? []))
    return cats.sort((a, b) => (categoryOrderMap.get(a) ?? Infinity) - (categoryOrderMap.get(b) ?? Infinity))
  }, [videoRes?.data, categoryOrderMap])

  // compute filtered videos (by category only)
  const filteredVideos = useMemo((): VideoItem[] => {
    const filtered = (videoRes?.data as VideoItem[] | undefined)?.filter((v: VideoItem) => (selectedCategory ? v.category_video?.name || "Không xác định" === selectedCategory : true)) ?? []
    return (filtered as VideoItem[]).slice().sort((a: VideoItem, b: VideoItem) => {
      const oa = a.category_video?.order ?? Number.POSITIVE_INFINITY
      const ob = b.category_video?.order ?? Number.POSITIVE_INFINITY
      if (oa !== ob) return oa - ob
      return (a.title ?? '').localeCompare(b.title ?? '')
    })
  }, [selectedCategory, videoRes?.data])

  // pagination derived
  const pageCount = Math.max(1, Math.ceil(filteredVideos.length / pageSize))
  const clampedPage = Math.min(currentPage, pageCount)
  const startIndex = (clampedPage - 1) * pageSize
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + pageSize)

  // reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  function openVideo(video: VideoItem) {
    setSelectedVideo(video)
    setIsDialogOpen(true)
  }

  return (
    <section id="video" className="relative min-h-screen w-full overflow-hidden pt-16 md:pt-20 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Title & Description */}
        <RevealSection slide={10}>
          <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-primary">
                {video.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {video.description}
              </p>
            </div>
        </RevealSection>

        {/* Controls: Category (single-select) */}
        <RevealSection delayMs={80}>
          <div className="mt-8 flex items-center justify-center gap-3 md:gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                className="h-9 px-3 cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </Button>
              {categories.map((cat) => {
                const active = selectedCategory === cat
                return (
                  <Button
                    key={cat as string}
                    variant={active ? "default" : "outline"}
                    className="h-9 px-3 cursor-pointer"
                    onClick={() => setSelectedCategory(active ? null : cat as string)}
                  >
                    {cat as string}
                  </Button>
                )
              })}
            </div>
          </div>
        </RevealSection>

        {/* Grid Videos */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedVideos.map((video: VideoItem, idx: number) => (
            <RevealSection key={video.documentId} delayMs={idx * 60}>
              <article className="group rounded-xl border border-border bg-background overflow-hidden">
                <button
                  type="button"
                  className="w-full block cursor-pointer"
                  onClick={() => openVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <StrapiImage
                      src={getYoutubeThumbnail(video.youtubeId as string)}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      width={480}
                      height={270}
                    />
                    <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 32 32" width="40" height="40" fill="currentColor" aria-hidden="true">
                          <circle cx="16" cy="16" r="16" fill="currentColor" className="text-primary/80" />
                          <polygon points="13,10 23,16 13,22" fill="white" />
                        </svg>
                      </span>
                    </span>
                  </div>
                </button>
                <div className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">{video.category_video.name}</div>
                  <h3 className="text-base font-semibold line-clamp-2">{video.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                </div>
              </article>
            </RevealSection>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={clampedPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          {/* simple numeric pager (compact) */}
          {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
            // center around current page when many pages
            const offsetStart = Math.min(
              Math.max(1, clampedPage - 2),
              Math.max(1, pageCount - 4)
            )
            const page = offsetStart + i
            const active = page === clampedPage
            return (
              <Button
                key={page}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="cursor-pointer"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={clampedPage >= pageCount}
            className="cursor-pointer"
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Dialog xem video */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full md:min-w-[70vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>{selectedVideo?.description}</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (
              <iframe
                className="w-full h-full rounded-md"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
