import { useIsMobile } from '@/hooks/use-mobile';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BellIcon,
    ClockIcon,
    Mail,
    ShieldAlert,
    Sliders,
    UserCheck,
} from 'lucide-react';

import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { ScrollArea } from '@/Components/ui/scroll-area';

type Notification = {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read_at: string | null;
    created_at: string;
};

const Notifications = () => {
    const isMobile = useIsMobile();
    const { notifications } = usePage().props as any;
    const unreadCount = notifications?.unread_count ?? 0;
    const items = notifications?.items ?? [];

    // Contextual icon resolver matching the main index view
    const getNotificationIcon = (title: string) => {
        const text = title.toLowerCase();
        if (
            text.includes('password') ||
            text.includes('security') ||
            text.includes('permission') ||
            text.includes('role') ||
            text.includes('access')
        ) {
            return {
                icon: ShieldAlert,
                bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            };
        }
        if (
            text.includes('setting') ||
            text.includes('smtp') ||
            text.includes('cache') ||
            text.includes('config')
        ) {
            return {
                icon: Sliders,
                bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            };
        }
        if (
            text.includes('user') ||
            text.includes('profile') ||
            text.includes('account') ||
            text.includes('member')
        ) {
            return {
                icon: UserCheck,
                bg: 'bg-green-500/10 text-green-500 border-green-500/20',
            };
        }
        if (
            text.includes('mail') ||
            text.includes('email') ||
            text.includes('verification')
        ) {
            return {
                icon: Mail,
                bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            };
        }
        return {
            icon: Bell,
            bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        };
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost" className="relative">
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className="bg-destructive absolute end-0.5 top-0.5 block size-1.5 shrink-0 rounded-full"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={isMobile ? 'center' : 'end'}
                className="ms-4 w-80 p-0"
            >
                <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
                    <div className="flex justify-between border-b px-6 py-4">
                        <div className="text-xs font-medium">Notifications</div>
                        <Button
                            variant="link"
                            className="text-primary h-auto p-0 text-[10px] font-semibold"
                            size="icon-sm"
                            asChild
                        >
                            <Link href={route('notifications.index')}>
                                View all
                            </Link>
                        </Button>
                    </div>
                </DropdownMenuLabel>

                <ScrollArea className="h-[350px]">
                    {items.length === 0 ? (
                        <div className="text-muted-foreground p-6 text-center text-xs">
                            No notifications.
                        </div>
                    ) : (
                        items.map((item: Notification) => {
                            const config = getNotificationIcon(item.title);
                            const IconComponent = config.icon;

                            return (
                                <DropdownMenuItem
                                    key={item.id}
                                    onSelect={() =>
                                        !item.read_at &&
                                        router.patch(
                                            route(
                                                'notifications.read',
                                                item.id,
                                            ),
                                        )
                                    }
                                    asChild
                                    className="group hover:bg-muted/30 flex cursor-pointer items-start gap-3 rounded-none border-b px-4 py-3"
                                >
                                    <Link
                                        href={
                                            item.url ??
                                            route('notifications.index')
                                        }
                                        className="flex flex-1 items-start gap-2.5"
                                    >
                                        <div
                                            className={`shrink-0 rounded border p-1.5 ${config.bg}`}
                                        >
                                            <IconComponent className="h-3 w-3" />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <div className="text-foreground flex items-center gap-1.5 truncate text-xs font-semibold">
                                                {item.title}
                                                {!item.read_at && (
                                                    <span className="bg-primary block size-1.5 shrink-0 rounded-full" />
                                                )}
                                            </div>
                                            <div className="text-muted-foreground line-clamp-2 text-[10px] leading-normal break-words">
                                                {item.message}
                                            </div>
                                            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[9px]">
                                                <ClockIcon className="size-3!" />
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleTimeString(
                                                    undefined,
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
