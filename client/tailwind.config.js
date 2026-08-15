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
        brand: {
          coral: '#FF5A5F',       // Primary coral / red from reference
          coralDark: '#E04A50',
          coralLight: '#FF7E82',
          teal: '#2BC4B6',        // Vibrant teal from top tabs
          tealDark: '#20A396',
          sky: '#3ABFF8',         // Sky blue for SMS/links
          amber: '#F59E0B',       // Warm yellow for Events/Rating
          peach: '#F97316',
          dark: '#1E2430',        // Deep slate from reference sidebar
          darker: '#161B26',
          card: '#272E3D',
          lightBg: '#F3F5F9',     // Clean soft background from reference
          surface: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'coral': '0 8px 25px -4px rgba(255, 90, 95, 0.35)',
        'teal': '0 8px 25px -4px rgba(43, 196, 182, 0.35)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
