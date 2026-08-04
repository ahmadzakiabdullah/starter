'use client';

import { useThemeConfig } from '@/Components/active-theme';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { THEMES, type ThemeType } from '@/lib/themes';
import { usePage } from '@inertiajs/react';
import { Check, Monitor, MoonIcon, Palette, SunIcon } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme: mode, setTheme: setMode } = useNextTheme();
    const { theme: config, setTheme: setConfig } = useThemeConfig();
    const { props: pageProps } = usePage();
    const system = pageProps.system;
    const showPresets = system?.module_theme_presets !== false;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button size="icon-sm" variant="ghost" className="h-8 w-8" disabled>
                <SunIcon className="h-4 w-4" />
            </Button>
        );
    }

    const activePreset = config.preset || 'default';

    const handlePresetSelect = (presetValue: string) => {
        setConfig({
            ...config,
            preset: presetValue as ThemeType['preset'],
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon-sm"
                    variant="ghost"
                    className="relative h-8 w-8 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {mode === 'dark' ? (
                        <MoonIcon className="text-primary h-4 w-4" />
                    ) : (
                        <SunIcon className="text-primary h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle theme dropdown</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-popover w-52 border border-slate-200 p-1 shadow-md sm:rounded-xl dark:border-slate-800"
            >
                <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <Monitor className="h-3.5 w-3.5" />
                    Theme Mode
                </DropdownMenuLabel>

                <DropdownMenuItem
                    onClick={() => setMode('light')}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${
                        mode === 'light' ? 'bg-accent/40 font-semibold' : ''
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <SunIcon className="h-3.5 w-3.5 text-amber-500" />
                        Light
                    </span>
                    {mode === 'light' && (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setMode('dark')}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${
                        mode === 'dark' ? 'bg-accent/40 font-semibold' : ''
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <MoonIcon className="h-3.5 w-3.5 text-indigo-500" />
                        Dark
                    </span>
                    {mode === 'dark' && (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setMode('system')}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${
                        mode === 'system' ? 'bg-accent/40 font-semibold' : ''
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Monitor className="h-3.5 w-3.5 text-slate-500" />
                        System
                    </span>
                    {mode === 'system' && (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                </DropdownMenuItem>

                {showPresets && (
                    <>
                        <DropdownMenuSeparator className="border-slate-100 dark:border-slate-800" />

                        <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase">
                            <Palette className="h-3.5 w-3.5" />
                            Color Preset
                        </DropdownMenuLabel>

                        <div className="max-h-48 space-y-0.5 overflow-y-auto pr-0.5">
                            {THEMES.map((themePreset) => {
                                const isPresetSelected =
                                    activePreset === themePreset.value;
                                return (
                                    <DropdownMenuItem
                                        key={themePreset.value}
                                        onClick={() =>
                                            handlePresetSelect(
                                                themePreset.value,
                                            )
                                        }
                                        className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${
                                            isPresetSelected
                                                ? 'bg-accent/40 font-semibold'
                                                : ''
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-200 dark:border-slate-700"
                                                style={{
                                                    backgroundColor:
                                                        themePreset.colors[0],
                                                }}
                                            />
                                            {themePreset.name}
                                        </span>
                                        {isPresetSelected && (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
