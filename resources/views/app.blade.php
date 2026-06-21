<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&family=Overpass+Mono:wght@400;500;700&family=PT+Sans:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;800&family=Poppins:wght@400;500;600&family=Roboto:wght@400;500;700&family=Hedvig+Letters+Serif&family=Kumbh+Sans:wght@400;700&family=Outfit:wght@400;700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="bg-background group/layout font-sans antialiased">
        @inertia
    </body>
</html>
