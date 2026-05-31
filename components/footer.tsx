import { FooterProps } from "@/types"
import { Potta_One } from "next/font/google"
import LucideIcon from "./LucideIcon"
import { StrapiImage } from "./StrapiImage"
import { sanitizeSvgHtml } from "@/lib/utils"
const pottaOne = Potta_One({
  weight: "400",
  subsets: ["latin"],
})
export function Footer({ footer }: { footer: FooterProps }) {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <div className="flex-shrink-0 flex items-center">
              <StrapiImage
                src={footer.logo.image.url}
                width={56}
                height={56}
                type="thumbnail"
                alt={footer.logo.image.alternativeText || footer.logo.name || "Footer logo"}
                className="w-14 h-14 rounded-lg mr-3 object-cover"
              />
              <div>
                <p className={`${pottaOne.className} text-2xl md:text-3xl font-bold text-white`}>
                  {footer.logo.name}
                </p>
                <p className={`${pottaOne.className} text-xs md:text-sm text-white mt-0.5 text-left`}>
                  {footer.logo.subName}
                </p>
              </div>
            </div>
            <p className="text-secondary-foreground/80 leading-relaxed mt-4">
              {footer.slogan}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{footer.title_contact}</h4>
            <div className="space-y-3">
              {footer.items_contact.map((item, index) => (
                <div className="flex items-center gap-3" key={item.icon || index}>
                  <LucideIcon name={item.icon} className="h-5 w-5 text-primary" />
                  <span className="text-secondary-foreground/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{footer.title_social}</h4>
            <div className="flex gap-4">
              {footer.items_social.map((item, index) => (
                <a
                  key={item.name || index}
                  href={item.url}
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group"
                  aria-label={item.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span
                    className="h-8 w-8 text-primary icon-social"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvgHtml(item.logo) }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} {footer.copyright}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
