import React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarInitialsProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    avatarUrl?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function getDeterministicGradient(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 35) % 360; // 35 degrees shift for smooth analogous gradient
    const color1 = `hsl(${h1}, 75%, 60%)`;
    const color2 = `hsl(${h2}, 85%, 48%)`;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
}

export const AvatarInitials = React.forwardRef<HTMLDivElement, AvatarInitialsProps>(
    ({ name, avatarUrl, size = 'md', className, style, ...props }, ref) => {
        const initials = getInitials(name || 'User');
        const gradient = getDeterministicGradient(name || 'User');

        const sizeClasses = {
            sm: 'h-8 w-8 text-xs',
            md: 'h-10 w-10 text-sm font-semibold',
            lg: 'h-16 w-16 text-lg font-bold',
            xl: 'h-24 w-24 text-2xl font-bold',
        };

        if (avatarUrl) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        'relative flex shrink-0 overflow-hidden rounded-full border border-border/40 shadow-sm transition-transform duration-200 hover:scale-[1.02]',
                        sizeClasses[size],
                        className
                    )}
                    {...props}
                >
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            // Revert to initials on load failure
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex shrink-0 items-center justify-center rounded-full border border-white/10 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                    sizeClasses[size],
                    className
                )}
                style={{
                    background: gradient,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                    ...style,
                }}
                {...props}
            >
                {initials}
            </div>
        );
    }
);

AvatarInitials.displayName = 'AvatarInitials';
