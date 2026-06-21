"use client";

import { PanelLeftIcon } from "lucide-react";

import { Separator } from "@/Components/ui/separator";
import Notifications from "@/Components/layout/header/notifications";
import Search from "@/Components/layout/header/search";
import ThemeSwitch from "@/Components/layout/header/theme-switch";
import UserMenu from "@/Components/layout/header/user-menu";
import { ThemeCustomizerPanel } from "@/Components/theme-customizer";
import { Button } from "@/Components/ui/button";
import { useSidebar } from "@/Components/ui/sidebar";
import { usePage } from "@inertiajs/react";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { props: pageProps } = usePage();
  const system = pageProps.system as any;
  const showNotifications = system?.module_notifications !== false;

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost">
          <PanelLeftIcon />
        </Button>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Search />

        <div className="ml-auto flex items-center gap-2">
          {showNotifications && <Notifications />}
          <ThemeSwitch />
          <ThemeCustomizerPanel />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
