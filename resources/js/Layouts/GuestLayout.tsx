import Logo from '@/Components/layout/logo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { system } = usePage().props as any;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
            {/* Backdrop glowing blobs */}
            <div className="absolute -top-[20%] -left-[10%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 space-y-6">
                {/* Brand Logo & Name */}
                <div className="flex flex-col items-center text-center space-y-2 select-none">
                    <Link href="/" className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 hover:scale-105 transition-transform">
                        <Logo />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {system?.app_name ?? "Laravel"}
                    </h2>
                </div>

                {/* Main Glass Card */}
                <div className="w-full overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8 rounded-2xl shadow-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
