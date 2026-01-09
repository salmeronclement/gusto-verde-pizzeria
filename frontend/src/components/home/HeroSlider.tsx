import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface HeroSlide {
  id: number
  image_url: string
  title: string
  subtitle: string
  display_order: number
}

import { getHeroSlides } from '../../services/api'
// ... imports

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await getHeroSlides()
        setSlides(data)
      } catch (error) {
        console.error('Error fetching hero slides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // Loading state
  if (loading) {
    return (
      <section className="relative h-[600px] md:h-[700px] bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </section>
    )
  }

  // 0 slides: Placeholder
  if (slides.length === 0) {
    return (
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-forest" />

        <div className="container-custom h-full relative z-10 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
              Bienvenue chez <br />
              <span className="text-primary">Gusto Verde</span>
            </h1>
            <p className="text-xl text-cream/80 mb-8">
              Cuisine italienne authentique • Ingrédients frais et bio
            </p>
            <Link
              to="/nos-pizzas"
              className="inline-block bg-primary hover:bg-accent text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105"
            >
              Découvrir notre carte
            </Link>
          </motion.div>
        </div>
      </section>
    )
  }

  // Carousel mode
  return (
    <section className="relative group">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop
        className="h-[600px] md:h-[700px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => (
              <div className="relative h-full w-full overflow-hidden">
                <motion.div
                  initial={{ scale: 1.2 }}
                  animate={{ scale: isActive ? 1 : 1.2 }}
                  transition={{ duration: 8, ease: 'easeOut' }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image_url})` }}
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="container-custom h-full relative z-10 flex items-center">
                  <div className="max-w-3xl">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
                      {slide.title}
                      {slide.subtitle && (
                        <>
                          <br />
                          <span className="text-primary text-3xl md:text-4xl">
                            {slide.subtitle}
                          </span>
                        </>
                      )}
                    </h2>

                    <Link
                      to="/nos-pizzas"
                      className="inline-block bg-primary hover:bg-accent text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105"
                    >
                      Commander maintenant
                    </Link>
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
