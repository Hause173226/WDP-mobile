module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#1E3A8A',
          700: '#1D4ED8',
          600: '#2563EB',
        },
        accent: {
          yellow: '#FACC15',
        },
      },
      fontFamily: {
        inter: ['Inter-Regular', 'Inter-Bold', 'Inter-SemiBold'],
      },
    },
  },
  plugins: [],
};
