import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { ADMIN_NAV } from './adminNav';
import igniteLogo from '@/assets/ignite-logo.png';

const COLLAPSE_KEY = 'ignite_admin_sidebar_collapsed';

function isActive(pathname: string, search: string, to: string): boolean {
    const [toPath, toQuery] = to.split('?');
    if (pathname !== toPath) return false;
    return (toQuery ? `?${toQuery}` : '') === search;
}

function initials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
    const location = useLocation();
    return (
        <TooltipProvider delayDuration={200}>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                {ADMIN_NAV.map(group => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map(item => {
                                const active = isActive(location.pathname, location.search, item.to);
                                const link = (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                                        } ${collapsed ? 'justify-center px-0' : ''}`}
                                    >
                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                );
                                if (!collapsed) return link;
                                return (
                                    <Tooltip key={item.label}>
                                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                                        <TooltipContent side="right">{item.label}</TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </TooltipProvider>
    );
}

interface AdminLayoutProps {
    title: string;
    breadcrumb?: string[];
    actions?: ReactNode;
    children: ReactNode;
}

export default function AdminLayout({ title, breadcrumb, actions, children }: AdminLayoutProps) {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); }, [collapsed]);

    return (
        <div className="min-h-screen bg-background flex">
            <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-200 sticky top-0 h-screen ${collapsed ? 'w-[72px]' : 'w-64'}`}>
                <div className="h-16 flex items-center px-4 border-b border-border/50 gap-2 flex-shrink-0">
                    <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto flex-shrink-0" />
                    {!collapsed && <span className="font-bold text-gradient truncate">Ignite Room</span>}
                </div>
                <SidebarContent collapsed={collapsed} />
                <div className="p-2 border-t border-border/50 flex-shrink-0">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors w-full ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                        {!collapsed && 'Collapse'}
                    </button>
                </div>
            </aside>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-64 p-0 flex flex-col">
                    <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                    <div className="h-16 flex items-center px-4 border-b border-border/50 gap-2 flex-shrink-0">
                        <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto flex-shrink-0" />
                        <span className="font-bold text-gradient truncate">Ignite Room</span>
                    </div>
                    <div onClick={() => setMobileOpen(false)} className="flex-1 flex flex-col min-h-0">
                        <SidebarContent collapsed={false} />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 flex-shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        {breadcrumb && breadcrumb.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                                {breadcrumb.map((b, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        {i > 0 && <ChevronRight className="w-3 h-3" />}
                                        {b}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="font-bold text-lg truncate leading-tight">{title}</h1>
                    </div>
                    <div className="flex-1" />
                    {actions}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary font-semibold text-sm flex-shrink-0 hover:bg-primary/25 transition-colors">
                            {initials(user?.name)}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <p className="font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive gap-2">
                                <LogOut className="w-4 h-4" /> Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="flex-1 px-4 sm:px-6 py-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
