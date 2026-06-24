<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        @php
            $systemSettings = \App\Models\Setting::values();
            $favicon = $systemSettings['app_favicon'] ?? null;
            $availableFonts = ['inter', 'geist', 'roboto', 'poppins', 'montserrat', 'pt-sans', 'overpass-mono'];
            $systemFont = in_array($systemSettings['system_font'] ?? 'inter', $availableFonts, true)
                ? $systemSettings['system_font']
                : 'inter';
        @endphp
        @if($favicon)
            <link rel="icon" href="{{ $favicon }}">
        @else
            <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Overpass+Mono:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="bg-background group/layout font-sans antialiased" data-theme-font="{{ $systemFont }}">
        @inertia
    </body>
</html>
