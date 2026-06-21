import { usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';

export default function Logo() {
  const { system } = usePage().props as any;

  const logoType = system?.app_logo_type ?? 'icon';
  const logoIconName = system?.app_logo_icon ?? 'Sparkles';
  const logoImageUrl = system?.app_logo_image;

  if (logoType === 'image' && logoImageUrl) {
    return (
      <img
        src={logoImageUrl}
        width={30}
        height={30}
        className="me-1 rounded-[5px] object-cover transition-all group-data-collapsible:size-6 group-data-[collapsible=icon]:size-8"
        alt={system?.app_name ?? "logo"}
      />
    );
  }

  // Dynamic Lucide icon lookup
  const IconComponent = (LucideIcons as any)[logoIconName] || LucideIcons.Sparkles;

  return (
    <div className="flex size-8 items-center justify-center bg-primary/10 text-primary rounded-lg p-1.5 me-1 transition-all group-data-collapsible:size-6 group-data-[collapsible=icon]:size-8">
      <IconComponent className="h-5 w-5 shrink-0" />
    </div>
  );
}
