export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar: string | null;
    email_verified_at?: string | null;
    roles: string[];
    permissions: string[];
}

export interface FlashMessages { success: string | null; error: string | null; }
export interface Notification { id: string; title: string; message: string; url: string | null; read_at: string | null; created_at: string; }
export interface Notifications { unread_count: number; items: Notification[]; }
export interface Announcement { id: number; title: string; content: string; style: 'info' | 'warning' | 'danger' | 'success'; is_active: boolean; starts_at: string | null; ends_at: string | null; }
export interface SystemSettings { [key: string]: string | number | boolean | null; }

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash: FlashMessages;
    notifications: Notifications;
    system: SystemSettings;
    app_version: string;
    active_announcement: Announcement | null;
};
