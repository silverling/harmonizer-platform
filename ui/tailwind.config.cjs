/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        smiley: ["SmileySans", "sans-serif"],
      },
      backgroundImage: {
        wave: "url('/src/assets/cool-background.svg')",
      },
      animation: {
        "fade-in-title": "fade-in-title 0.8s cubic-bezier(0.39, 0.575, 0.565, 1) both",
        "fade-in-toolbar": "fade-in-toolbar 0.8s cubic-bezier(0.39, 0.575, 0.565, 1) both",
      },
      keyframes: {
        "fade-in-title": {
          "0%": {
            "-webkit-transform": "translateX(50px)",
            transform: "translateX(50px)",
            opacity: 0,
          },
          "100%": {
            "-webkit-transform": "translateX(0)",
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        "fade-in-toolbar": {
          "0%": {
            "-webkit-transform": "translateX(-20px)",
            transform: "translateX(-20px)",
            opacity: 0,
          },
          "100%": {
            "-webkit-transform": "translateX(0px)",
            transform: "translateX(0px)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
