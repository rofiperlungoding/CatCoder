/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                border: "#E5E5E5", // Gray 200
                input: "#E5E5E5",
                ring: "#84CC16", // Lime
                background: "#F4F4F0", // AeroSense Cream
                foreground: "#1A1A1A", // AeroSense Dark Charcoal
                primary: {
                    DEFAULT: "#1A1A1A", // Black/Charcoal for primary actions
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#FFFFFF", // White for secondary actions/cards
                    foreground: "#1A1A1A",
                },
                accent: {
                    DEFAULT: "#84CC16", // Vibrant Lime
                    foreground: "#FFFFFF",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "#F5F5F5", // Light Gray for varying backgrounds
                    foreground: "#737373",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#1A1A1A",
                },
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#1A1A1A",
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
