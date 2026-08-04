import { Button } from '@/Components/ui/button';
import { usePage } from '@inertiajs/react';
import {
    AlertOctagon,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AnnouncementBanner() {
    const { active_announcement, system } = usePage().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active_announcement && system?.module_announcements !== false) {
            const dismissed = sessionStorage.getItem(
                `dismissed_announcement_${active_announcement.id}`,
            );
            if (!dismissed) {
                setVisible(true);
            }
        } else {
            setVisible(false);
        }
    }, [active_announcement, system]);

    if (
        !active_announcement ||
        !visible ||
        system?.module_announcements === false
    ) {
        return null;
    }

    const handleDismiss = () => {
        sessionStorage.setItem(
            `dismissed_announcement_${active_announcement.id}`,
            'true',
        );
        setVisible(false);
    };

    const getStyleClasses = (style: string) => {
        switch (style) {
            case 'warning':
                return {
                    bg: 'bg-amber-500 text-white dark:bg-amber-950/60 dark:text-amber-300 border-b border-amber-600/20',
                    icon: (
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-white dark:text-amber-400" />
                    ),
                };
            case 'danger':
                return {
                    bg: 'bg-destructive text-destructive-foreground dark:bg-red-950/60 dark:text-red-300 border-b border-red-960/20',
                    icon: (
                        <AlertOctagon className="text-destructive-foreground h-4.5 w-4.5 shrink-0 dark:text-red-400" />
                    ),
                };
            case 'success':
                return {
                    bg: 'bg-emerald-600 text-white dark:bg-emerald-950/60 dark:text-emerald-300 border-b border-emerald-600/20',
                    icon: (
                        <CheckCircle className="h-4.5 w-4.5 shrink-0 text-white dark:text-emerald-400" />
                    ),
                };
            case 'info':
            default:
                return {
                    bg: 'bg-indigo-600 text-white dark:bg-indigo-950/60 dark:text-indigo-300 border-b border-indigo-600/20',
                    icon: (
                        <Info className="h-4.5 w-4.5 shrink-0 text-white dark:text-indigo-400" />
                    ),
                };
        }
    };

    const styleClasses = getStyleClasses(active_announcement.style);

    return (
        <div
            className={`relative px-4 py-2.5 transition-all duration-300 ${styleClasses.bg}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {styleClasses.icon}
                    <div className="flex-1 truncate text-xs leading-normal font-semibold">
                        <span className="mr-1.5 font-bold underline">
                            {active_announcement.title}:
                        </span>
                        <span>{active_announcement.content}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="h-7 w-7 shrink-0 rounded-full text-current hover:bg-white/10 dark:hover:bg-white/5"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss announcement</span>
                </Button>
            </div>
        </div>
    );
}
