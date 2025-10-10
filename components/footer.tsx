import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/logo-black.jpg"
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
              <h3 className="text-2xl font-bold">Cơm Tô Nhật Bản</h3>
            </div>
            <p className="text-secondary-foreground/80 leading-relaxed">
            Ẩm thực Nhật chính thống được giao tận nhà. Nguyên liệu tươi ngon, công thức truyền thống, tiện lợi hiện đại.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ chúng tôi</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-secondary-foreground/80">+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-secondary-foreground/80">hello@phohouse.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-secondary-foreground/80">123 Nguyen Hue St, District 1, HCMC</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} Cơm Tô Nhật Bản. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
