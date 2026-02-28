import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={title}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[var(--sidebar-width)] transition-all duration-300">
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
