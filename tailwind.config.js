/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Dark mode specific colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic colors for both themes
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        surface: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        card: {
          light: '#ffffff',
          dark: '#334155',
        },
        border: {
          light: '#e2e8f0',
          dark: '#475569',
        },
        text: {
          primary: {
            light: '#1e293b',
            dark: '#f1f5f9',
          },
          secondary: {
            light: '#64748b',
            dark: '#94a3b8',
          },
          muted: {
            light: '#94a3b8',
            dark: '#64748b',
          },
        },
      },
      backgroundColor: {
        'theme-bg': 'var(--bg-color)',
        'theme-surface': 'var(--surface-color)',
        'theme-card': 'var(--card-color)',
      },
      textColor: {
        'theme-text': 'var(--text-color)',
        'theme-text-secondary': 'var(--text-secondary-color)',
        'theme-text-muted': 'var(--text-muted-color)',
      },
      borderColor: {
        'theme-border': 'var(--border-color)',
      },
    },
  },
  plugins: [
    // Custom scrollbar plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgb(29 78 216) transparent',
        },
        '.scrollbar-thumb-primary-700': {
          'scrollbar-color': 'rgb(29 78 216) transparent',
        },
        '.scrollbar-track-transparent': {
          'scrollbar-color': 'rgb(29 78 216) transparent',
        },
        // Webkit scrollbar styles for better cross-browser support
        '.scrollbar-thin::-webkit-scrollbar': {
          'width': '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          'background': 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': 'rgb(29 78 216)',
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': 'rgb(30 64 175)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};

