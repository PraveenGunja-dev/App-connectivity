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
        className={`flex-1 transition-[padding-left] duration-500 ease-in-out ${
          collapsed ? "lg:pl-[var(--sidebar-width-collapsed)]" : "lg:pl-[var(--sidebar-width)]"
        }`}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
