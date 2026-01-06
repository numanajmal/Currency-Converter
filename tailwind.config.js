/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#0a0a0a',
                'brand-green': '#00d37f',
                // Update these for flexible usage if needed, or keep    relying on utilities
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
            },
            backgroundImage: {
                'grid-pattern': "url('https://grainy-gradients.vercel.app/noise.svg')",
            }
        },
    },
    plugins: [],
}
