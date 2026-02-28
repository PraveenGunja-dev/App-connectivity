import { motion } from "framer-motion";
import { Bell, Search, ChevronDown, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const adaniLogo = "/assets/adani-renewables-logo.jpg";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";

interface DashboardHeaderProps {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DashboardHeader({ title, sidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
  const { resolvedTheme } = useTheme();
  const userEmail = localStorage.getItem("userEmail") || "admin@adani.com";
  // Extract the first part of the email as the name
  const rawName = userEmail.split(/[._@]/)[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-border bg-card px-4 sm:px-6 transition-colors dark:bg-card/80 dark:backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <motion.img
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            src={adaniLogo}
            alt="Adani"
            className="h-10 sm:h-12 object-contain ml-2 cursor-pointer transition-all duration-300 dark:bg-white dark:rounded-lg dark:p-1.5 dark:shadow-sm"
            style={{ mixBlendMode: resolvedTheme === 'dark' ? 'normal' : 'multiply' } as any}
          />
        </motion.div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-border sm:block mx-2" />

        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 sm:block"
        >
          {title}
        </motion.h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--secondary))" }}
          whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors"
        >
          <Search className="h-[18px] w-[18px]" />
        </motion.button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--secondary))" }}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent border border-card"
          />
        </motion.button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-border sm:block" />

        {/* User */}
        <motion.button
          whileHover={{ x: 2 }}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-transform active:scale-95">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </motion.button>
      </div>
    </header>
  );
}
