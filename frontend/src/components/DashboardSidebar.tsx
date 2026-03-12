import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
} from "lucide-react";

const navItems = [
  { title: "Home", path: "/login", icon: Home, color: "var(--adani-wind-blue)" },
  { title: "Dashboard", path: "/", icon: LayoutDashboard, color: "var(--adani-wind-purple)" },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onSidebarHoverChange?: (hovered: boolean) => void;
}

export function DashboardSidebar({ open, onClose, collapsed, onSidebarHoverChange }: DashboardSidebarProps) {
  const location = useLocation();
  const sidebarWidth = collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={() => onSidebarHoverChange?.(true)}
        onMouseLeave={() => onSidebarHoverChange?.(false)}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-white border-r border-border/50 pt-[var(--header-height)] shadow-[rgba(17,17,26,0.05)_10px_0px_16px] transition-[width] duration-500 ease-in-out lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: sidebarWidth }}
      >
        <div className="relative flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto overflow-x-hidden">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="relative"
                >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${collapsed ? "justify-center px-0" : ""} ${isActive
                        ? "text-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-[-12px] h-6 w-1 rounded-r-full bg-primary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex shrink-0 items-center justify-center transition-all duration-300"
                      >
                        <item.icon
                          className={`h-5 w-5 transition-all duration-300 ${isActive ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : ""}`}
                          style={{ color: isActive ? item.color : "currentColor" }}
                        />
                      </motion.div>
                      
                    <motion.span
                      animate={{ 
                        opacity: collapsed ? 0 : 1,
                        x: collapsed ? -10 : 0,
                        display: collapsed ? 'none' : 'block'
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="truncate tracking-tight"
                    >
                      {item.title}
                    </motion.span>

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                        <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none translate-x-1 group-hover:translate-x-0">
                            {item.title}
                        </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Section / Bottom Branding */}
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-t border-border/50 bg-gradient-to-b from-transparent to-muted/10"
            >
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="h-2 w-2 rounded-full bg-energy-green animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Online</span>
                </div>
            </motion.div>
          )}
        </div>
      </aside>
    </>
  );
}
