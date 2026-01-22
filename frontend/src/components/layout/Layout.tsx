import { Outlet } from 'react-router-dom'
import { ReactNode, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ServiceStatusBanner from '../ui/ServiceStatusBanner'
import AnnouncementBanner from '../ui/AnnouncementBanner'
import { useServiceStore } from '../../store/useServiceStore'

import ActiveOrderButton from './ActiveOrderButton'

interface LayoutProps {
    children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const { fetchServiceStatus } = useServiceStore()

    useEffect(() => {
        fetchServiceStatus()
    }, [fetchServiceStatus])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <AnnouncementBanner />
            {/* <ServiceStatusBanner /> */}
            <main className="flex-1">{children || <Outlet />}</main>
            <ActiveOrderButton />
            <Footer />
        </div>
    )
}
