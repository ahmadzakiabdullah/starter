import { BellIcon, ClockIcon } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";

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
  const { notifications } = usePage().props as unknown as { notifications: { unread_count: number; items: Notification[] } };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="relative">
          <BellIcon />
          {notifications.unread_count > 0 && <span className="bg-destructive absolute end-0.5 top-0.5 block size-1.5 shrink-0 rounded-full"></span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">Notifications</div>
            <Button variant="link" className="h-auto p-0 text-xs" size="icon-sm" asChild>
              <Link href={route('notifications.index')}>View all</Link>
            </Button>
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {notifications.items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications.</div>
          ) : notifications.items.map((item: Notification) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => !item.read_at && router.patch(route('notifications.read', item.id))}
              asChild
              className="group flex cursor-pointer items-start gap-9 rounded-none border-b px-4 py-3">
              <Link href={item.url ?? route('notifications.index')} className="flex flex-1 items-start justify-between gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="dark:group-hover:text-default-800 truncate text-sm font-medium">
                    {item.title}
                  </div>
                  <div className="dark:group-hover:text-default-700 text-muted-foreground line-clamp-1 text-xs">
                    {item.message}
                  </div>
                  <div className="dark:group-hover:text-default-500 text-muted-foreground flex items-center gap-1 text-xs">
                    <ClockIcon className="size-3!" />
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                {!item.read_at && <span className="bg-destructive/80 mt-1.5 block size-2 shrink-0 rounded-full border" />}
              </Link>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
