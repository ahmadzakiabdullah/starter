import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import axios from 'axios';
import {
    AlertTriangle,
    Check,
    Copy,
    Info,
    Key,
    Plus,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TokenItem {
    id: number;
    name: string;
    last_used_at: string | null;
    last_used_formatted: string;
    created_at: string;
    created_formatted: string;
}

export default function ApiTokenManager() {
    const [tokens, setTokens] = useState<TokenItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTokenName, setNewTokenName] = useState('');
    const [creating, setCreating] = useState(false);
    const [plainTextToken, setPlainTextToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);

    const fetchTokens = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/profile/api-tokens');
            setTokens(response.data.tokens);
        } catch (error) {
            toast.error('Failed to load API tokens.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, []);

    const handleCreateToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTokenName.trim()) return;

        setCreating(true);
        setPlainTextToken(null);
        try {
            const response = await axios.post('/profile/api-tokens', {
                name: newTokenName,
            });
            setPlainTextToken(response.data.plainTextToken);
            setNewTokenName('');
            toast.success('API token generated successfully.');
            fetchTokens();
        } catch (error) {
            toast.error('Failed to generate API token.');
            console.error(error);
        } finally {
            setCreating(false);
        }
    };

    const handleRevokeToken = async (id: number) => {
        setRevokingId(id);
        try {
            await axios.delete(`/profile/api-tokens/${id}`);
            toast.success('API token revoked successfully.');
            setTokens((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            toast.error('Failed to revoke API token.');
            console.error(error);
        } finally {
            setRevokingId(null);
        }
    };

    const copyToClipboard = () => {
        if (!plainTextToken) return;
        navigator.clipboard.writeText(plainTextToken);
        setCopied(true);
        toast.success('Copied API key to clipboard.');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="bg-card overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800/60">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Key className="text-primary h-5 w-5" />
                    API Access Keys
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-xs">
                    Personal Access Tokens allow external services to securely
                    authenticate with this system API.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* CREATE TOKEN FORM */}
                <form
                    onSubmit={handleCreateToken}
                    className="max-w-xl space-y-4"
                >
                    <div className="space-y-2">
                        <Label
                            htmlFor="token_name"
                            className="text-xs font-bold text-slate-700 dark:text-slate-300"
                        >
                            Token Description / Name
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="token_name"
                                placeholder="e.g. Third-party Integration, Github Action, Backup Script"
                                value={newTokenName}
                                onChange={(e) =>
                                    setNewTokenName(e.target.value)
                                }
                                required
                                className="h-9.5 text-xs"
                            />
                            <Button
                                type="submit"
                                disabled={creating || !newTokenName.trim()}
                                className="h-9.5 shrink-0 text-xs"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Generate Token
                            </Button>
                        </div>
                    </div>
                </form>

                {/* DISPLAY NEW PLAIN TEXT TOKEN */}
                {plainTextToken && (
                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/15">
                        <div className="flex items-start gap-2 text-amber-800 dark:text-amber-400">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <h5 className="text-xs font-bold">
                                    Please Copy Your Personal Access Token Now
                                </h5>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-500/90">
                                    For security reasons, this token will not be
                                    displayed again. If you lose this key, you
                                    will need to revoke it and generate a new
                                    one.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 rounded-lg border border-slate-200 bg-white p-2.5 pr-10 font-mono text-xs font-semibold break-all text-slate-800 select-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                                {plainTextToken}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    className="text-muted-foreground hover:text-foreground absolute top-1 right-1 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-900"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="my-6 border-t border-slate-100 dark:border-slate-800/60"></div>

                {/* ACTIVE TOKENS LIST */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Active Tokens ({tokens.length})
                        </h4>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fetchTokens}
                            disabled={loading}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                        </Button>
                    </div>

                    {loading && tokens.length === 0 ? (
                        <div className="text-muted-foreground flex items-center justify-center gap-2 py-6">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-xs">
                                Loading active API keys...
                            </span>
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-muted-foreground space-y-1 rounded-xl border border-dashed bg-slate-50/20 py-8 text-center dark:bg-slate-900/10">
                            <Info className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="text-xs font-semibold">
                                No API keys created yet
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Generate a new token above to connect external
                                services.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border bg-white dark:divide-slate-800/80 dark:bg-slate-950/20">
                            {tokens.map((token) => (
                                <div
                                    key={token.id}
                                    className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                                >
                                    <div className="min-w-0 space-y-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                {token.name}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px]">
                                            <span>
                                                Created:{' '}
                                                {token.created_formatted}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Last Used:{' '}
                                                {token.last_used_formatted}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRevokeToken(token.id)
                                        }
                                        disabled={revokingId === token.id}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
