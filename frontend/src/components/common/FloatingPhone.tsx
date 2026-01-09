import { useState } from 'react'

export default function FloatingPhone() {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div className="fixed bottom-8 right-8 z-40">
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 bg-dark text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                    Appelez-nous !
                    <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-dark"></div>
                </div>
            )}

            {/* Floating Phone Button */}
            <a
                href="tel:0491555444"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="flex items-center justify-center w-16 h-16 bg-primary hover:bg-secondary text-white rounded-full shadow-2xl transition-all hover:scale-110 animate-pulse"
                aria-label="Appeler 04 91 555 444"
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
            </a>
        </div>
    )
}
