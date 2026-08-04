import { usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function Logo() {
    const { system } = usePage().props;

    const logoType = (system?.app_logo_type ?? 'icon') as string;
    const logoIconName = (system?.app_logo_icon ?? 'Sparkles') as string;
    const logoImageUrl = system?.app_logo_image as string | undefined;

    if (logoType === 'image' && logoImageUrl) {
        return (
            <img
                src={logoImageUrl}
                width={30}
                height={30}
                className="me-1 rounded-[5px] object-cover transition-all group-data-collapsible:size-6 group-data-[collapsible=icon]:size-8"
                alt={(system?.app_name ?? 'logo') as string}
            />
        );
    }

    // Dynamic Lucide icon lookup
    const IconComponent: LucideIcon =
        (LucideIcons[logoIconName as keyof typeof LucideIcons] as LucideIcon) ||
        LucideIcons.Sparkles;

    return (
        <div className="bg-primary/10 text-primary me-1 flex size-8 items-center justify-center rounded-lg p-1.5 transition-all group-data-collapsible:size-6 group-data-[collapsible=icon]:size-8">
            <IconComponent className="h-5 w-5 shrink-0" />
        </div>
    );
}
