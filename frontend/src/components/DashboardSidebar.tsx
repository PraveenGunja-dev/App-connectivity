import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
} from "lucide-react";

const navItems = [
  { title: "Home", path: "/login", icon: Home },
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={() => onSidebarHoverChange?.(true)}
        onMouseLeave={() => onSidebarHoverChange?.(false)}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-white border-r border-slate-200/60 pt-[var(--header-height)] shadow-[0_0_20px_rgba(0,0,0,0.02)] transition-[width] duration-500 ease-in-out lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: sidebarWidth }}
      >
        <div className="relative flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-300 ${collapsed ? "justify-center px-0" : ""} ${isActive
                        ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.1)]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-[-12px] h-6 w-1 rounded-r-full bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex shrink-0 items-center justify-center transition-all duration-300"
                      >
                        <item.icon
                          className={`h-5 w-5 transition-all duration-300 ${isActive ? "text-primary filter drop-shadow-[0_0_3px_hsl(var(--primary)/0.3)]" : "text-slate-400 group-hover:text-slate-600"}`}
                        />
                      </motion.div>
                      
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="truncate tracking-tight"
                      >
                        {item.title}
                      </motion.span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                        <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none translate-x-2 group-hover:translate-x-0">
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
              className="p-6 border-t border-slate-100 bg-slate-50/50"
            >
                <div className="flex items-center gap-3 px-1">
                    <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status</span>
                </div>
            </motion.div>
          )}
        </div>
      </aside>
    </>
  );
}
