"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  User,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { useTranslation } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && !user) {
      router.push("/login");
    }
  }, [isMounted, isUserLoading, user, router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t('nav.ticket_intelligence') },
    { href: "/dashboard/reports", icon: BarChart3, label: t('nav.analytics') },
    { href: "/dashboard/settings", icon: Settings, label: t('nav.settings') },
  ];

  const sidebarVariants = {
    hidden: { x: -300 },
    visible: { 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 }
    }
  };

  const navItemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  if (!isMounted || isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden font-body">
      {/* Sidebar Desktop */}
      <motion.aside 
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden w-72 md:flex md:flex-col bg-card/40 backdrop-blur-2xl border-r border-primary/20 relative z-50"
      >
        <div className="flex h-24 items-center px-8 border-b border-primary/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="bg-primary p-2.5 rounded-none p3-angled-box shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              <ShieldAlert className="h-6 w-6 text-black" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-black font-headline italic tracking-tighter text-primary p3-text-shadow">SMART TICKET</span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60">System Core v3.0</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-8 space-y-2 px-4">
          {navItems.map((item) => (
            <motion.div key={item.href} variants={navItemVariants}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center h-14 transition-all duration-300 p3-nav-skew overflow-hidden",
                  pathname === item.href 
                    ? "bg-primary text-black translate-x-4 shadow-[10px_0_20px_rgba(0,229,255,0.3)]" 
                    : "text-muted-foreground hover:bg-primary/10 hover:translate-x-2"
                )}
              >
                <div className="p3-nav-skew-content flex items-center w-full px-6 gap-4">
                  <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-black" : "group-hover:text-primary")} />
                  <span className="font-black font-headline italic text-lg uppercase truncate">{item.label}</span>
                  {pathname === item.href && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="ml-auto"
                    >
                      <ChevronRight className="h-5 w-5 animate-pulse" />
                    </motion.div>
                  )}
                </div>
                {/* Visual Glitch Decor */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 group-hover:bg-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="p-6 border-t border-primary/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-black text-xs uppercase tracking-widest p3-nav-skew"
            onClick={handleSignOut}
          >
            <div className="p3-nav-skew-content flex items-center">
              <LogOut className="mr-3 h-4 w-4" />
              {t('nav.signout')}
            </div>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col relative overflow-hidden">
        {/* Background Grid Decor */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff05_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-md border-b border-primary/10">
          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden border border-primary/20">
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-card/95 backdrop-blur-2xl p-0 border-r-primary/30">
                <SheetHeader className="px-8 py-10 border-b border-primary/10">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="bg-primary p-2 p3-angled-box">
                      <ShieldAlert className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-2xl font-black font-headline text-primary italic italic">SMART TICKET</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-3 mt-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center h-16 px-6 gap-4 p3-nav-skew transition-all",
                        pathname === item.href 
                          ? "bg-primary text-black shadow-lg" 
                          : "text-muted-foreground active:bg-primary/20"
                      )}
                    >
                      <div className="p3-nav-skew-content flex items-center w-full gap-4">
                        <item.icon className="h-6 w-6" />
                        <span className="font-black font-headline text-xl uppercase italic">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-10 mt-10 border-t border-primary/10">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground font-black h-14 uppercase tracking-widest text-sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-4 h-6 w-6" />
                      {t('nav.signout')}
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl font-black font-headline text-primary uppercase italic tracking-widest">
                {navItems.find(item => item.href === pathname)?.label || "OPERATIONS"}
              </h1>
              <span className="text-[7px] font-black opacity-40 tracking-[0.6em] uppercase">Sector Alpha Monitoring</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-primary p3-text-shadow italic">{user?.email?.split('@')[0] || "OPERATOR"}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Level 99 S-Rank</span>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="h-12 w-12 bg-primary p3-angled-box flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
            >
              <User className="h-6 w-6" />
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 20,
                duration: 0.5 
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
