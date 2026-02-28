import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const activities = [
  { id: 1, user: "Sarah Wilson", action: "Completed project review", time: "2 min ago", status: "completed" },
  { id: 2, user: "Mike Chen", action: "Submitted quarterly report", time: "15 min ago", status: "pending" },
  { id: 3, user: "Emily Davis", action: "Updated inventory records", time: "1 hr ago", status: "completed" },
  { id: 4, user: "Alex Johnson", action: "Created new user account", time: "2 hrs ago", status: "completed" },
  { id: 5, user: "Lisa Park", action: "Flagged transaction #4892", time: "3 hrs ago", status: "flagged" },
  { id: 6, user: "Tom Richards", action: "Deployed v2.4.1 release", time: "5 hrs ago", status: "completed" },
  { id: 7, user: "Nina Patel", action: "Reviewed compliance docs", time: "6 hrs ago", status: "completed" },
  { id: 8, user: "James Lee", action: "Updated API endpoints", time: "7 hrs ago", status: "completed" },
  { id: 9, user: "Rachel Kim", action: "Resolved ticket #1023", time: "8 hrs ago", status: "completed" },
  { id: 10, user: "David Brown", action: "Approved budget request", time: "9 hrs ago", status: "pending" },
  { id: 11, user: "Maria Garcia", action: "Onboarded new vendor", time: "10 hrs ago", status: "completed" },
  { id: 12, user: "Chris Taylor", action: "Flagged expense report", time: "11 hrs ago", status: "flagged" },
];

const PAGE_SIZE = 5;

const statusVariant: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  flagged: "bg-destructive/10 text-destructive border-destructive/20",
};

export function RecentActivity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity =>
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);

  const pageData = useMemo(
    () => filteredActivities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, filteredActivities]
  );

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      <div className="border-b border-border px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Recent Activity</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Latest actions across the platform</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {pageData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50 group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold"
                      >
                        {item.user.split(" ").map((n) => n[0]).join("")}
                      </motion.div>
                      <span className="text-card-foreground">{item.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.action}</td>
                  <td className="px-5 py-3.5">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusVariant[item.status]}`}
                    >
                      {item.status}
                    </motion.span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.time}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 p-4 sm:hidden">
        {pageData.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {item.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-sm font-medium text-card-foreground">{item.user}</span>
              </div>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${statusVariant[item.status]}`}>
                {item.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{item.action}</p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
