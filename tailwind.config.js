const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"SF Pro Display"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                gray: colors.neutral, // Force consistent neutral gray (no blue tint)
                border: "var(--border-color)",
                input: "var(--border-color)",
                ring: "#84CC16", // Lime
                background: "var(--bg-color)",
                foreground: "var(--fg-color)",
                primary: {
                    DEFAULT: "var(--fg-color)", // Auto-flips: Black (Light) <-> White (Dark)
                    foreground: "var(--bg-color)", // Auto-flips: Cream (Light) <-> Black (Dark)
                },
                secondary: {
                    DEFAULT: "var(--secondary-bg)",
                    foreground: "var(--secondary-fg)",
                },
                accent: {
                    DEFAULT: "#84CC16", // Vibrant Lime - Keep consistent
                    foreground: "#FFFFFF",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "var(--muted-bg)",
                    foreground: "var(--muted-fg)",
                },
                popover: {
                    DEFAULT: "var(--card-bg)",
                    foreground: "var(--fg-color)",
                },
                card: {
                    DEFAULT: "var(--card-bg)",
                    foreground: "var(--fg-color)",
                },
            },
            borderRadius: {
                lg: "1.5rem",
                md: "1rem",
                sm: "0.5rem",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
