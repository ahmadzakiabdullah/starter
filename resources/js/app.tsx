import '../css/app.css';
import './bootstrap';

import { ActiveThemeProvider } from '@/Components/active-theme';
import { Toaster } from '@/Components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from 'next-themes';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <ActiveThemeProvider>
                    <App {...props} />
                    <Toaster position="top-center" richColors />
                </ActiveThemeProvider>
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
