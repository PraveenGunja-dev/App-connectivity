import { motion } from "framer-motion";
import { Bell, Search, Menu, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const adaniLogo = "/assets/logo.png";

interface DashboardHeaderProps {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DashboardHeader({ title, sidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
  const userEmail = localStorage.getItem("userEmail") || "admin@adani.com";
  // Extract the first part of the email as the name
  const rawName = userEmail.split(/[._@]/)[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="glass-header h-[var(--header-height)] px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-foreground lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={adaniLogo}
            alt="Adani"
            className="h-9 sm:h-11 object-contain cursor-pointer"
          />
          <div className="hidden h-6 w-px bg-border sm:block mx-1" />
          <h1 className="hidden sm:block text-xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--adani-wind-blue)] via-[var(--adani-wind-purple)] via-[var(--adani-wind-magenta)] to-[var(--adani-wind-red)]">
              {title}
            </span>
          </h1>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-secondary/50 rounded-xl px-3 py-1.5 border border-border/50 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search keywords..."
            className="bg-transparent border-none outline-none text-sm px-2 w-48 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-2 pr-2 border-r border-border/50 mr-1">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--secondary))" }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary border-2 border-card shadow-sm" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 rounded-xl pl-2 pr-1 py-1 transition-all hover:bg-secondary/80 group"
          >
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold text-foreground leading-tight">{displayName}</p>
            </div>
            <Avatar className="h-10 w-10 ring-2 ring-[var(--adani-wind-purple)]/20 shadow-md transition-transform group-hover:scale-105 active:scale-95">
              <AvatarFallback className="bg-gradient-to-br from-[var(--adani-wind-blue)] via-[var(--adani-wind-purple)] to-[var(--adani-wind-magenta)] text-sm font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("userEmail");
              window.location.href = "/login";
            }}
            className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
