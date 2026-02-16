Feature: Storybook Implementation
Goal: Create a UI component library documentation using Storybook.
Architecture:
- Use Storybook for React + Vite.
- document core UI components (`Button`, `Input`, `Badge`, `Card`).
- Ensure dark mode support in Storybook.

Steps:
1.  **Initialize Storybook**: Run `npx storybook@latest init`.
2.  **Configure Storybook**:
    - Add dark mode addon (optional but good).
    - Configure `preview.ts` to support Tailwind/CSS variables.
3.  **Create Stories**:
    - `src/components/ui/Button/Button.stories.tsx`
    - `src/components/ui/Input/Input.stories.tsx`
    - `src/components/ui/Badge/Badge.stories.tsx`
4.  **Verify**: Run `npm run storybook`.

Dependencies:
- `storybook`
- `@storybook/react-vite`
- `@storybook/addon-essentials`
