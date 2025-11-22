'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Users,
  FileText,
  Key,
  Activity,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { isAdminUser } from '@/lib/auth/admin';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble',
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gestion des comptes',
  },
  {
    name: 'Prompts',
    href: '/admin/prompts',
    icon: FileText,
    description: 'Contenu généré',
  },
  {
    name: 'Clés API',
    href: '/admin/api-keys',
    icon: Key,
    description: 'Configuration IA',
  },
  {
    name: 'Logs',
    href: '/admin/logs',
    icon: Activity,
    description: 'Activité système',
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration',
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Éviter le flash pendant l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vérifier les permissions admin
  useEffect(() => {
    if (isLoaded && user) {
      if (!isAdminUser(user.emailAddresses)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Activity className="h-5 w-5 animate-spin text-purple-500" />
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminUser(user.emailAddresses)) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-border bg-card">
        {/* Logo / Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Promptor</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-500' : ''}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-purple-500" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full transition-all hover:border-purple-500"
          >
            {mounted && (
              <>
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Mode Clair
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Mode Sombre
                  </>
                )}
              </>
            )}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 transition-all hover:border-purple-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Quitter Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {isMobile && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 lg:hidden flex flex-col">
            {/* Logo / Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">Promptor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <div
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-purple-500' : ''}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-purple-500" />}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <div className="px-4 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full transition-all hover:border-purple-500"
              >
                {mounted && (
                  <>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Mode Clair
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Mode Sombre
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </div>
              </div>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 transition-all hover:border-purple-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Quitter Admin
                </Button>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Admin Panel</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]" />
      </div>
    </div>
  );
}
