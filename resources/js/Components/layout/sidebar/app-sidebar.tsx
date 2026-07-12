'use client';

import { useIsTablet } from '@/hooks/use-mobile';
import { Link, usePage } from '@inertiajs/react';
import { PlusIcon } from '@radix-ui/react-icons';
import { ChevronsUpDown, ShoppingBagIcon, UserCircle2Icon } from 'lucide-react';
import * as React from 'react';
import { useEffect } from 'react';

import Logo from '@/Components/layout/logo';
import { NavMain } from '@/Components/layout/sidebar/nav-main';
import { NavUser } from '@/Components/layout/sidebar/nav-user';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/Components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { url, props: pageProps } = usePage();
    const pathname = url;
    const system = pageProps.system as { app_name?: string } | undefined;
    const appVersion = pageProps.app_version as string | undefined;
    const { setOpen, setOpenMobile, isMobile } = useSidebar();
    const isTablet = useIsTablet();

    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [pathname]);

    useEffect(() => {
        setOpen(!isTablet);
    }, [isTablet]);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:text-foreground h-12 group-data-[collapsible=icon]:px-0! hover:bg-[var(--primary)]/5">
                                    <Logo />
                                    <div className="flex flex-col items-start gap-0.5 overflow-hidden select-none group-data-[collapsible=icon]:hidden">
                                        <span className="text-foreground truncate text-sm leading-tight font-semibold">
                                            {system?.app_name ?? 'Laravel'}
                                        </span>
                                        {appVersion && (
                                            <Link
                                                href={route('changelogs.index')}
                                                className="bg-primary/10 text-primary hover:bg-primary/20 rounded px-1.5 py-0.5 font-mono text-[9px] leading-none font-bold transition-all"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {appVersion}
                                            </Link>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="mt-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-md border">
                                        <ShoppingBagIcon className="text-muted-foreground size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            E-commerce
                                        </span>
                                        <span className="text-xs text-green-700">
                                            Active
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-md border">
                                        <UserCircle2Icon className="text-muted-foreground size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            Blog Platform
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Inactive
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <Button className="w-full">
                                    <PlusIcon />
                                    New Project
                                </Button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea className="h-full">
                    <NavMain />
                </ScrollArea>
            </SidebarContent>
            <SidebarFooter>
                <Card className="gap-4 overflow-hidden py-4 group-data-[collapsible=icon]:hidden">
                    <CardHeader className="px-3">
                        <CardTitle>Download</CardTitle>
                        <CardDescription>
                            Unlock lifetime access to all dashboards, templates
                            and components.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3">
                        <Button className="w-full" asChild>
                            <Link
                                href="https://shadcnuikit.com/pricing"
                                target="_blank"
                            >
                                Get Shadcn UI Kit
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
