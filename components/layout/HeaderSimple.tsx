'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSelector } from '@/components/ui/global-selector';
import { Sparkles, Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com'
  // Ajoutez vos emails admin ici
];

export function HeaderSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const t = useTranslations('common');

  const navLinks = [
    { href: '/#features', label: t('features') },
    { href: '/#how-it-works', label: t('howItWorks') },
    { href: '/pricing', label: t('pricing') },
    { href: '/#faq', label: t('faq') },
  ];

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.emailAddresses?.some((email) =>
    ADMIN_EMAILS.includes(email.emailAddress)
  ) || false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold">
              <span className="text-foreground">Prompt</span>
              <span className="gradient-text">or</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <GlobalSelector />
            <ThemeToggle />

            <SignedOut>
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="font-medium">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="btn-gradient text-white font-medium">
                    {t('getStarted')}
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="font-medium">
                    {t('dashboard')}
                  </Button>
                </Link>
                <Link href="/editor">
                  <Button size="sm" className="btn-gradient text-white font-medium">
                    {t('editor')}
                  </Button>
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </div>
            </SignedIn>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="h-px bg-border my-4" />

                <SignedOut>
                  <div className="space-y-2 px-4">
                    <Link href="/sign-in" className="block">
                      <Button variant="outline" className="w-full">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="block">
                      <Button className="w-full btn-gradient text-white">
                        {t('getStarted')}
                      </Button>
                    </Link>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="space-y-2 px-4">
                    {isAdmin && (
                      <Link href="/admin" className="block">
                        <Button
                          variant="outline"
                          className="w-full text-purple-600 dark:text-purple-400 border-purple-500"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Link href="/dashboard" className="block">
                      <Button variant="outline" className="w-full">
                        {t('dashboard')}
                      </Button>
                    </Link>
                    <Link href="/editor" className="block">
                      <Button className="w-full btn-gradient text-white">
                        {t('editor')}
                      </Button>
                    </Link>
                    <div className="flex items-center justify-center pt-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
