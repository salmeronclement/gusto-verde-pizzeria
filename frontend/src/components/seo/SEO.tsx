import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonicalUrl: string;
    image?: string;
    type?: string;
    noIndex?: boolean;
}

export default function SEO({
    title,
    description,
    canonicalUrl,
    image = 'https://gustoverde.fr/logo.png',
    type = 'website',
    noIndex = false
}: SEOProps) {
    const fullUrl = `https://gustoverde.fr${canonicalUrl}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="fr_FR" />
            <meta property="og:site_name" content="Gusto Verde" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Additional SEO */}
            <meta name="geo.region" content="FR-13" />
            <meta name="geo.placename" content="Marseille" />
            <meta name="geo.position" content="43.2965;5.3698" />
            <meta name="ICBM" content="43.2965, 5.3698" />
        </Helmet>
    );
}
