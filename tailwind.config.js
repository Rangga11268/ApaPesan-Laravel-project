import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
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
                background: "var(--color-bg)",
                surface: {
                    DEFAULT: "var(--color-surface)",
                    elevated: "var(--color-surface-elevated)",
                },
                "surface-elevated": "var(--color-surface-elevated)",
                border: {
                    DEFAULT: "var(--color-border)",
                    active: "var(--color-border-active)",
                    subtle: "var(--color-border)",
                },
                "border-active": "var(--color-border-active)",
                "border-subtle": "var(--color-border)",
                "text-main": "var(--color-text-main)",
                "text-muted": "var(--color-text-muted)",
                main: "var(--color-text-main)",
                muted: "var(--color-text-muted)",
                "accent-primary": "var(--color-primary)",
                primary: {
                    DEFAULT: "var(--color-primary)",
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                secondary: {
                    DEFAULT: "#10b981",
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
                    DEFAULT: "var(--color-primary)",
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
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

    daisyui: {
        themes: [
            {
                light: {
                    primary: "#2563eb",
                    secondary: "#10b981",
                    accent: "#3b82f6",
                    neutral: "#1e293b",
                    "base-100": "#ffffff",
                    "base-200": "#f8fafc",
                    "base-300": "#f1f5f9",
                    info: "#38bdf8",
                    success: "#10b981",
                    warning: "#f59e0b",
                    error: "#ef4444",
                },
                dark: {
                    primary: "#3b82f6",
                    secondary: "#10b981",
                    accent: "#60a5fa",
                    neutral: "#111827",
                    "base-100": "#0b0f17",
                    "base-200": "#111827",
                    "base-300": "#1f2937",
                    info: "#38bdf8",
                    success: "#10b981",
                    warning: "#f59e0b",
                    error: "#ef4444",
                },
            },
        ],
        darkTheme: "dark",
    },
};
