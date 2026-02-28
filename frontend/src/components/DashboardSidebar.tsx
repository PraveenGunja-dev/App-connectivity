import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const location = useLocation();

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
        className={`fixed left-0 top-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col bg-sidebar pt-[var(--header-height)] transition-transform duration-300 lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="flex items-center justify-center"
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 transition-colors ${isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-muted group-hover:text-sidebar-accent-foreground"
                        }`}
                    />
                  </motion.div>
                  <motion.span
                    animate={isActive ? { x: 2 } : { x: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.title}
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-5 w-5 shrink-0 text-sidebar-muted" />
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
