'use client';

import {
    ColorModeSelector,
    ContentLayoutSelector,
    PresetSelector,
    ResetThemeButton,
    SidebarModeSelector,
    ThemeRadiusSelector,
    ThemeScaleSelector,
} from '@/components/theme-customizer/index';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Palette } from 'lucide-react';

export function ThemeCustomizerPanel() {
    const isMobile = useIsMobile();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                    <Palette />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="me-4 w-72 p-4 shadow-xl lg:me-0"
                align={isMobile ? 'center' : 'end'}
            >
                <div className="grid space-y-4">
                    <PresetSelector />
                    <ThemeScaleSelector />
                    <ThemeRadiusSelector />
                    <ColorModeSelector />
                    <ContentLayoutSelector />
                    <SidebarModeSelector />
                </div>
                <ResetThemeButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
