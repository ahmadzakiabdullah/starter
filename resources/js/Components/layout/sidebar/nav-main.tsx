"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/Components/ui/sidebar";
import {
  ActivityIcon,
  ArchiveRestoreIcon,
  BadgeDollarSignIcon,
  BrainCircuitIcon,
  BrainIcon,
  Building2Icon,
  CalendarIcon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ClipboardMinusIcon,
  ComponentIcon,
  CookieIcon,
  FingerprintIcon,
  FolderDotIcon,
  FolderIcon,
  GaugeIcon,
  GraduationCapIcon,
  ImagesIcon,
  KeyIcon,
  MailIcon,
  MessageSquareIcon,
  ProportionsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  StickyNoteIcon,
  UserIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
  Github,
  RedoDotIcon,
  BrushCleaningIcon,
  CreditCardIcon,
  SpeechIcon,
  MessageSquareHeartIcon,
  BookAIcon,
  PuzzleIcon,
  LayoutDashboard
} from "lucide-react";
import { usePage, Link } from "@inertiajs/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem[];
  isActive?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function getNavGroups(user: any): NavGroup[] {
  const canManageUsers = user?.permissions?.includes('manage-users') || user?.roles?.includes('superadmin');
  const canManageRoles = user?.permissions?.includes('manage-roles') || user?.roles?.includes('superadmin');
  const canManageSettings = user?.roles?.includes('superadmin');
  const showAdminGroup = canManageUsers || canManageRoles || canManageSettings;

  return [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Media Library",
          href: "/dashboard/media",
          icon: ImagesIcon,
        },
        {
          title: "System Changelog",
          href: "/dashboard/changelogs",
          icon: ActivityIcon,
        },
      ],
    },
    ...(showAdminGroup
      ? [
          {
            title: "Access Control",
            items: [
              ...(canManageUsers
                ? [
                    {
                      title: "User Directory",
                      href: "/dashboard/users",
                      icon: UsersIcon,
                    },
                  ]
                : []),
              ...(canManageRoles
                ? [
                    {
                      title: "Access Matrix",
                      href: "/dashboard/roles",
                      icon: KeyIcon,
                    },
                  ]
                : []),
              ...(canManageRoles
                ? [
                    {
                      title: "Audit Trail",
                      href: "/dashboard/audit-logs",
                      icon: ClipboardCheckIcon,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(canManageSettings
      ? [
          {
            title: "System Control",
            items: [
              {
                title: "System Settings",
                href: "/dashboard/settings",
                icon: SettingsIcon,
              },
              {
                title: "System Diagnostics",
                href: "/dashboard/health",
                icon: GaugeIcon,
              },
              {
                title: "Database Backups",
                href: "/dashboard/backups",
                icon: ArchiveRestoreIcon,
              },
              {
                title: "Log Inspector",
                href: "/dashboard/logs",
                icon: ClipboardMinusIcon,
              },
            ],
          },
        ]
      : []),
  ];
}

export function NavMain() {
  const { url } = usePage();
  const pathname = url;
  const { isMobile } = useSidebar();
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const navGroups = getNavGroups(user);

  return (
    <>
      {navGroups.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => {
                const isActive = item.isActive !== undefined 
                  ? item.isActive 
                  : (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.title}>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <>
                        <div className="hidden group-data-[collapsible=icon]:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-48 rounded-lg">
                              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                              {item.items?.map((subItem) => (
                                <DropdownMenuItem
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                  asChild
                                  key={subItem.title}>
                                  <a href={subItem.href}>{subItem.title}</a>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Collapsible
                          className="group/collapsible block group-data-[collapsible=icon]:hidden"
                          defaultOpen={!!item.items.find((s) => s.href === pathname)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                              tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, key) => (
                                <SidebarMenuSubItem key={key}>
                                  <SidebarMenuSubButton
                                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                    isActive={pathname === subItem.href}
                                    asChild>
                                    <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <SidebarMenuButton
                        className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                        isActive={isActive}
                        tooltip={item.title}
                        asChild>
                        <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    {!!item.isComing && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                        Coming
                      </SidebarMenuBadge>
                    )}
                    {!!item.isNew && (
                      <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                        New
                      </SidebarMenuBadge>
                    )}
                    {!!item.isDataBadge && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                        {item.isDataBadge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
