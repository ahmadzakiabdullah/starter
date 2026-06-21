import React, { PropsWithChildren } from "react";
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/Components/layout/header";

export default function AuthenticatedLayout({
    children,
}: PropsWithChildren) {
    return (
        <SidebarProvider
            defaultOpen={true}
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 64)",
                    "--header-height": "calc(var(--spacing) * 14)",
                    "--content-padding": "calc(var(--spacing) * 4)",
                    "--content-margin": "calc(var(--spacing) * 1.5)",
                    "--content-full-height":
                        "calc(100vh - var(--header-height) - (var(--content-padding) * 2) - (var(--content-margin) * 2))"
                } as React.CSSProperties
            }>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="bg-muted/40 flex flex-1 flex-col">
                    <div className="@container/main p-(--content-padding) xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
