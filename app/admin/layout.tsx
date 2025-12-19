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
  ChevronDown,
  Sun,
  Moon,
  Coins,
  Package,
  Tag,
  Receipt,
  Brain,
  DollarSign,
  TestTube,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { isAdminUser } from '@/lib/auth/admin';
import { NextIntlClientProvider } from 'next-intl';
import { GlobalSelector } from '@/components/ui/global-selector';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  description?: string;
}

interface NavGroup {
  name: string;
  icon: typeof LayoutDashboard;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

const navigation: NavEntry[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble',
  },
  {
    name: 'Credits',
    icon: Coins,
    items: [
      { name: 'Vue generale', href: '/admin/credits', icon: Coins },
      { name: 'Packs', href: '/admin/credits/packs', icon: Package },
      { name: 'Promotions auto', href: '/admin/credits/promotions', icon: Tag },
      { name: 'Codes promo', href: '/admin/credits/promo-codes', icon: Tag },
      { name: 'Transactions', href: '/admin/credits/transactions', icon: Receipt },
    ],
  },
  {
    name: 'Intelligence Artificielle',
    icon: Brain,
    items: [
      { name: 'Modeles par tier', href: '/admin/models', icon: Brain },
      { name: 'Couts des modeles', href: '/admin/models/costs', icon: DollarSign },
      { name: 'Cles API', href: '/admin/api-keys', icon: Key },
      { name: 'Test des cles', href: '/admin/api-keys/test', icon: TestTube },
    ],
  },
  {
    name: 'Contenu',
    icon: FileText,
    items: [
      { name: 'Utilisateurs', href: '/admin/users', icon: Users },
      { name: 'Prompts', href: '/admin/prompts', icon: FileText },
    ],
  },
  {
    name: 'Systeme',
    icon: Settings,
    items: [
      { name: 'Logs', href: '/admin/logs', icon: Activity },
      { name: 'Parametres', href: '/admin/settings', icon: Settings },
    ],
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Credits', 'Intelligence Artificielle']);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  // Load messages for GlobalSelector
  useEffect(() => {
    fetch('/api/messages?locale=fr')
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(() => {
        // Fallback to basic messages
        import('@/messages/fr.json').then(m => setMessages(m.default));
      });
  }, []);

  // Eviter le flash pendant l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detecter la taille de l'ecran
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

  // Verifier les permissions admin
  useEffect(() => {
    if (isLoaded && user) {
      if (!isAdminUser(user.emailAddresses)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoaded, router]);

  // Auto-expand le groupe qui contient la page active
  useEffect(() => {
    navigation.forEach(entry => {
      if (isNavGroup(entry)) {
        const hasActivePage = entry.items.some(item =>
          pathname === item.href || pathname.startsWith(item.href + '/')
        );
        if (hasActivePage && !expandedGroups.includes(entry.name)) {
          setExpandedGroups(prev => [...prev, entry.name]);
        }
      }
    });
  }, [pathname, expandedGroups]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

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

  const renderNavItem = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link key={item.href} href={item.href} onClick={onClick}>
        <div
          className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            active
              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Icon className={`h-4 w-4 ${active ? 'text-purple-500' : ''}`} />
          <span className="font-medium text-sm">{item.name}</span>
          {active && <ChevronRight className="h-4 w-4 ml-auto text-purple-500" />}
        </div>
      </Link>
    );
  };

  const renderNavGroup = (group: NavGroup, onClick?: () => void) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.includes(group.name);
    const hasActivePage = group.items.some(item => isActive(item.href));

    return (
      <div key={group.name} className="space-y-1">
        <button
          type="button"
          onClick={() => toggleGroup(group.name)}
          className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            hasActivePage
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Icon className={`h-4 w-4 ${hasActivePage ? 'text-purple-500' : ''}`} />
          <span className="font-medium text-sm flex-1 text-left">{group.name}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 pl-4 border-l border-border space-y-1">
            {group.items.map(item => renderNavItem(item, onClick))}
          </div>
        )}
      </div>
    );
  };

  const renderNavigation = (onClick?: () => void) => (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {navigation.map(entry =>
        isNavGroup(entry)
          ? renderNavGroup(entry, onClick)
          : renderNavItem(entry, onClick)
      )}
    </nav>
  );

  const renderUserInfo = () => (
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
  );

  const renderThemeToggle = () => (
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
  );

  const renderHeader = () => (
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
      {messages && (
        <NextIntlClientProvider messages={messages} locale="fr">
          <GlobalSelector compact />
        </NextIntlClientProvider>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-border bg-card">
        {renderHeader()}
        {renderNavigation()}
        {renderThemeToggle()}
        {renderUserInfo()}
      </aside>

      {/* Sidebar Mobile */}
      {isMobile && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={e => e.key === 'Escape' && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Fermer le menu"
          />

          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 lg:hidden flex flex-col">
            {/* Header avec bouton fermer */}
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

            {renderNavigation(() => setSidebarOpen(false))}
            {renderThemeToggle()}
            {renderUserInfo()}
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
          <div className="w-9" />
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
