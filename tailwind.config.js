/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          50: '#E5F2FF',
          100: '#CCE5FF',
          500: '#007AFF',
          600: '#0051D5',
          900: '#003D99',
          DEFAULT: '#007AFF',
          foreground: '#FFFFFF',
        },
        glass: {
          standard: 'rgba(255, 255, 255, 0.4)',
          emphasized: 'rgba(255, 255, 255, 0.5)',
          subtle: 'rgba(255, 255, 255, 0.35)',
        },
        neutral: {
          text: {
            primary: '#1D1D1F',
            secondary: '#86868B',
          },
        },
        semantic: {
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
        },
      },
      fontFamily: {
        primary: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        float: '0 12px 40px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.08)',
        button: '0 4px 12px rgba(0, 122, 255, 0.3)',
        'button-hover': '0 6px 16px rgba(0, 122, 255, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
