Feature: PWA Implementation
Goal: Enable offline support and installability for CatCoder.
Architecture: Use `vite-plugin-pwa` to generate a service worker and manifest file.
Tech Stack: vite-plugin-pwa

Steps:
1.  **Install `vite-plugin-pwa`**: Add dependency.
2.  **Configure `vite.config.ts`**: Add `VitePWA` plugin with auto-update strategy and cache first for assets.
3.  **Configure Manifest**: Define app name, short name, theme color, background color, and icons.
4.  **Create Maskable Icon**: Use `generate_image` or existing `logo.png` (cropping/resize) to create proper PWA icons (192x192, 512x512, maskable). Wait, I don't have powerful image editing. I'll check if I can just use `logo.png` for now and note it as a TODO for better assets, or use a tool. I have `generate_image`! I can use it to create proper icons if needed, or stick to the existing one. For now, I'll use `logo.png` as source.
5.  **Add Meta Tags**: Update `index.html` with theme-color and apple-touch-icon.
6.  **Verify**: Build and check for service worker registration.
