import HeroSlider from '../components/home/HeroSlider'
import CategoryCarousel from '../components/home/CategoryCarousel'
import InfoHoraires from '../components/home/InfoHoraires'
import OffreSpeciale from '../components/home/OffreSpeciale'
import Avantages from '../components/home/Avantages'
import BlogCarousel from '../components/home/BlogCarousel'
import TestimonialsCarousel from '../components/home/TestimonialsCarousel'
import FeatureBand from '../components/common/FeatureBand'

export default function HomePage() {
    return (
        <>
            <HeroSlider />
            <CategoryCarousel />
            <InfoHoraires />
            <OffreSpeciale />
            <Avantages />
            <BlogCarousel />
            <TestimonialsCarousel />
            <FeatureBand />
        </>
    )
}
