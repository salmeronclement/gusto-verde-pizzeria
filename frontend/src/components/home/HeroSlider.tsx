import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { Loader2 } from 'lucide-react'

interface HeroSlide {
  id: number
  image_url: string
  title: string
  subtitle: string
  display_order: number
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * ⚠️ IMPORTANT
   * Cette variable DOIT exister :
   * .env.production → VITE_API_URL=http://51.68.229.173:5005/api
   */
  const API_BASE = import.meta.env.VITE_API_URL || 'http://51.68.229.173:5005/api'

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/content/hero-slides`
        )

        if (!response.ok) {
          throw new Error(`❌ API error ${response.status}`)
        }

        const data = await response.json()
        setSlides(data)
      } catch (error) {
        console.error('Error fetching hero slides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [API_BASE])

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <section className="relative h-[50vh] min-h-[400px] md:h-[700px] bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </section>
    )
  }

  /* =========================
     NO SLIDES
     ========================= */
  if (slides.length === 0) {
    return (
      <section className="relative h-[50vh] min-h-[400px] md:h-[700px] bg-forest flex items-center">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
              Bienvenue chez <br />
              <span className="text-primary">Gusto Verde</span>
            </h1>

            <p className="text-xl text-cream/80 mb-8">
              Cuisine italienne authentique • Produits frais & faits maison
            </p>

            <a
              href="/menu"
              className="inline-block bg-primary hover:bg-accent text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105"
            >
              Découvrir la carte
            </a>
          </div>
        </div>
      </section>
    )
  }

  /* =========================
     CAROUSEL
     ========================= */
  return (
    <section className="relative group hero-slider">
      {/* Custom Swiper Navigation Styling */}
      <style>{`
        .hero-slider .swiper-button-prev,
        .hero-slider .swiper-button-next {
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          color: white;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
          display: none; /* Hide on mobile to prevent overlap */
        }
        .hero-slider .swiper-button-prev:after,
        .hero-slider .swiper-button-next:after {
          font-size: 16px;
          font-weight: bold;
        }
        @media (min-width: 768px) {
            .hero-slider .swiper-button-prev,
            .hero-slider .swiper-button-next {
              width: 56px;
              height: 56px;
              display: flex; /* Show on desktop */
              justify-content: center;
              align-items: center;
              background: rgba(45, 90, 61, 0.9);
            }
            .hero-slider .swiper-button-prev:after,
            .hero-slider .swiper-button-next:after {
              font-size: 20px;
            }
        }
        .hero-slider .swiper-button-prev:hover,
        .hero-slider .swiper-button-next:hover {
          background: #B8860B;
          transform: scale(1.1);
          opacity: 1;
        }
        .hero-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: white;
          opacity: 0.5;
        }
        .hero-slider .swiper-pagination-bullet-active {
          background: #B8860B;
          opacity: 1;
        }
      `}</style>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1500}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop
        className="h-[50vh] min-h-[400px] md:h-[700px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => (
              <div className="relative h-full w-full overflow-hidden">
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image_url})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="container-custom h-full relative z-10 flex items-center">
                  <div className="max-w-3xl">
                    {(slide.title || slide.subtitle) && (
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
                        {slide.title}
                        {slide.subtitle && (
                          <>
                            <br />
                            <span className="text-primary text-2xl md:text-4xl">
                              {slide.subtitle}
                            </span>
                          </>
                        )}
                      </h2>
                    )}

                    <a
                      href="/menu"
                      className="inline-block bg-primary hover:bg-accent text-white font-bold text-base px-6 py-3 md:text-lg md:px-8 md:py-4 rounded-full transition-all hover:scale-105"
                    >
                      Commander maintenant
                    </a>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
