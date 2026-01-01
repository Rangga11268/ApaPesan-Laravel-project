import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Manrope", ...defaultTheme.fontFamily.sans],
                display: ["Syne", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Midnight Aurora Palette
                background: "#05070a", // Deepest charcoal
                surface: "#0f172a", // Dark blue-grey
                primary: {
                    DEFAULT: "#7c3aed", // Electric Violet
                    50: "#f5f3ff",
                    100: "#ede9fe",
                    200: "#ddd6fe",
                    300: "#c4b5fd",
                    400: "#a78bfa",
                    500: "#8b5cf6",
                    600: "#7c3aed",
                    700: "#6d28d9",
                    800: "#5b21b6",
                    900: "#4c1d95",
                },
                secondary: {
                    DEFAULT: "#10b981", // Emerald Neon
                    50: "#ecfdf5",
                    100: "#d1fae5",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981",
                    600: "#059669",
                    700: "#047857",
                    800: "#065f46",
                    900: "#064e3b",
                },
                accent: {
                    // Pink/Fuchsia for highlights
                    DEFAULT: "#d946ef",
                    50: "#fdf4ff",
                    100: "#fae8ff",
                    200: "#f5d0fe",
                    300: "#f0abfc",
                    400: "#e879f9",
                    500: "#d946ef",
                    600: "#c026d3",
                    700: "#a21caf",
                    800: "#86198f",
                    900: "#701a75",
                },
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in",
                "slide-up": "slideUp 0.3s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
                "pulse-soft": "pulseSoft 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                pulseSoft: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.6" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
        },
        screens: {
            xs: "420px",
            sm: "680px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
    },

    plugins: [forms, typography, daisyui],

    // daisyUI config with custom dark theme
    daisyui: {
        themes: [
            {
                midnight: {
                    primary: "#7c3aed",
                    secondary: "#10b981",
                    accent: "#d946ef",
                    neutral: "#0f172a",
                    "base-100": "#05070a",
                    "base-200": "#0f172a",
                    "base-300": "#1e293b",
                    info: "#3abff8",
                    success: "#36d399",
                    warning: "#fbbd23",
                    error: "#f87272",
                },
            },
        ],
    },
};
