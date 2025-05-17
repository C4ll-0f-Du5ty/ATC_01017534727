/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    darkMode: 'class', // enables class-based dark mode
    theme: {
        extend: {
            transitionDuration: {
                DEFAULT: '300ms',
            },
            colors: {
                darkBg: '#111827',
                darkCard: '#1f2937',
                darkText: '#d1d5db',
            },
        },
    },
    plugins: [],
}
