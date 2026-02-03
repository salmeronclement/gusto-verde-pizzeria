import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function StructuredData() {
    const { settings } = useSettingsStore();

    // Dynamic data from settings
    const brandName = settings?.contact_info?.brand_name || 'Gusto Verde';
    const phone = settings?.contact_info?.phone || '04 91 555 444';
    const address = settings?.contact_info?.address || '24 boulevard Notre Dame, 13006 Marseille';
    const email = settings?.contact_info?.email || 'contact@gustoverde.fr';

    // Parse address for structured data
    const addressParts = address.split(',').map(part => part.trim());
    const streetAddress = addressParts[0] || '24 boulevard Notre Dame';
    const postalCode = addressParts[1]?.match(/\d{5}/)?.[0] || '13006';
    const city = addressParts[1]?.replace(/\d{5}/, '').trim() || 'Marseille';

    // Build opening hours from schedule
    const openingHours = settings?.schedule?.filter(day => !day.closed).map(day => {
        const dayMap: { [key: string]: string } = {
            'Lundi': 'Monday',
            'Mardi': 'Tuesday',
            'Mercredi': 'Wednesday',
            'Jeudi': 'Thursday',
            'Vendredi': 'Friday',
            'Samedi': 'Saturday',
            'Dimanche': 'Sunday'
        };
        return `${dayMap[day.day]} ${day.open}-${day.close}`;
    }) || [];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        '@id': 'https://gustoverde.fr',
        name: brandName,
        image: 'https://gustoverde.fr/logo.png',
        telephone: phone,
        email: email,
        priceRange: '€€',
        servesCuisine: 'Italienne',
        acceptsReservations: 'True',
        address: {
            '@type': 'PostalAddress',
            streetAddress: streetAddress,
            addressLocality: city,
            postalCode: postalCode,
            addressCountry: 'FR'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '43.2965',
            longitude: '5.3698'
        },
        openingHoursSpecification: openingHours.map(hours => {
            const [day, time] = hours.split(' ');
            const [opens, closes] = time.split('-');
            return {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: day,
                opens: opens || '11:30',
                closes: closes || '22:30'
            };
        }),
        url: 'https://gustoverde.fr',
        menu: 'https://gustoverde.fr/nos-pizzas',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127'
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
