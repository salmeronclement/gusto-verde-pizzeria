/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#C6933B',        // Or Moutarde (boutons, prix)
                secondary: '#30401B',      // Vert Forêt Profond
                accent: '#A49C66',         // Vert Olive Clair
                cream: '#D6C5AC',          // Beige/Crème Naturel
                forest: '#30401B',         // Alias Vert Forêt
                dark: '#1B1B1B',          // Texte foncé
                white: '#FFFFFF',
                gray: {
                    50: '#F9F9F9',
                    100: '#F3F3F3',
                    200: '#E5E5E5',
                    300: '#D1D1D1',
                    400: '#B0B0B0',
                    500: '#888888',
                    600: '#666666',
                    700: '#444444',
                    800: '#2A2A2A',
                    900: '#1A1A1A',
                },
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
                lobster: ['Lobster Two', 'cursive'],
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                    '2xl': '6rem',
                },
            },
        },
    },
    plugins: [],
}
