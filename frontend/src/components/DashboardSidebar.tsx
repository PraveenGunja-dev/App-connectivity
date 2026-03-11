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
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar border-r border-sidebar-border pt-[var(--header-height)] transition-[width] duration-300 ease-in-out lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: sidebarWidth }}
      >
        <div className="relative flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto overflow-x-hidden">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-300 ${collapsed ? "justify-center px-2" : ""} ${isActive
                        ? "bg-gradient-to-r from-[var(--adani-wind-blue)]/10 to-[var(--adani-wind-purple)]/10 text-foreground shadow-sm ring-1 ring-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:ring-1 hover:ring-primary/20"
                        }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 3 }}
                        className="flex shrink-0 items-center justify-center transition-all duration-300"
                      >
                        <item.icon
                          className="h-6 w-6 transition-colors duration-300"
                          style={{ color: isActive ? item.color : "var(--gray-400)" }}
                          // In the CSS we'll handle the hover color transition effectively
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.color = item.color;
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.color = "var(--gray-400)";
                          }}
                        />
                      </motion.div>
                    {!collapsed && (
                      <motion.span
                        animate={isActive ? { x: 2 } : { x: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom spacer (keeps layout consistent without logout button) */}
          <div className={`border-t border-sidebar-border transition-[padding] duration-300 ${collapsed ? "px-2 py-3" : "px-2 py-3"}`} />
        </div>
      </aside>
    </>
  );
}
