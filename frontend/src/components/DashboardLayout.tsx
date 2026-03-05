import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Pure hover: collapsed when cursor is away, expanded when cursor is on the sidebar
  const collapsed = !isSidebarHovered;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={title}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onSidebarHoverChange={setIsSidebarHovered}
      />
      <main
        className={`p-4 sm:p-6 lg:transition-[padding-left] duration-300 ${
          collapsed ? "lg:pl-[var(--sidebar-width-collapsed)]" : "lg:pl-[var(--sidebar-width)]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
