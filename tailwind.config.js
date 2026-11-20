/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F0',
        coral: {
          DEFAULT: '#E85D4A',
          dark: '#D94A37',
          soft: '#F3A493',
          pale: '#FBE9E4',
          wash: '#FDF4F1',
        },
        sage: {
          DEFAULT: '#C5D6BA',
          dark: '#A8C69F',
          pale: '#EEF3E9',
          ink: '#4E6248',
        },
        ink: '#1F2937',
        muted: '#6B7280',
        line: '#EEE7DC',
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 20px 50px rgba(0, 0, 0, 0.06)',
        soft: '0 8px 24px rgba(70, 52, 38, 0.08)',
        coral: '0 9px 22px rgba(232, 93, 74, 0.19)',
      },
      keyframes: {
        flowerSway: {
          '0%, 100%': { transform: 'rotate(-2.5deg) translateY(0px)' },
          '50%': { transform: 'rotate(2.5deg) translateY(-3px)' },
        },
        petalFall: {
          '0%': {
            transform: 'translate3d(0, -12vh, 0) rotate(0deg)',
            opacity: '0',
          },
          '12%': { opacity: 'var(--petal-opacity, 0.5)' },
          '88%': { opacity: 'var(--petal-opacity, 0.5)' },
          '100%': {
            transform:
              'translate3d(var(--petal-drift, 40px), 112vh, 0) rotate(var(--petal-spin, 320deg))',
            opacity: '0',
          },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'flower-sway': 'flowerSway 7s ease-in-out infinite',
        'petal-fall': 'petalFall linear infinite',
        'soft-pulse': 'softPulse 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
