import Logo from '@/Components/layout/logo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { system } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-950">
            {/* Backdrop glowing blobs */}
            <div className="bg-primary/10 pointer-events-none absolute -top-[20%] -left-[10%] h-[450px] w-[450px] rounded-full blur-[100px]" />
            <div className="pointer-events-none absolute -right-[10%] -bottom-[20%] h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md space-y-6">
                {/* Brand Logo & Name */}
                <div className="flex flex-col items-center space-y-2 text-center select-none">
                    <Link
                        href="/"
                        className="bg-primary/10 border-primary/20 inline-flex items-center justify-center rounded-2xl border p-3 transition-transform hover:scale-105"
                    >
                        <Logo />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {system?.app_name ?? 'Laravel'}
                    </h2>
                </div>

                {/* Main Glass Card */}
                <div className="w-full overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-slate-800/40 dark:bg-slate-900/60">
                    {children}
                </div>
            </div>
        </div>
    );
}
