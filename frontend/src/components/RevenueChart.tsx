import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";

const data = [
  { month: "Jan", revenue: 18500, orders: 820 },
  { month: "Feb", revenue: 22300, orders: 930 },
  { month: "Mar", revenue: 19800, orders: 870 },
  { month: "Apr", revenue: 27600, orders: 1100 },
  { month: "May", revenue: 32100, orders: 1250 },
  { month: "Jun", revenue: 29400, orders: 1180 },
  { month: "Jul", revenue: 35800, orders: 1380 },
  { month: "Aug", revenue: 38200, orders: 1420 },
  { month: "Sep", revenue: 34500, orders: 1300 },
  { month: "Oct", revenue: 41200, orders: 1520 },
  { month: "Nov", revenue: 44800, orders: 1600 },
  { month: "Dec", revenue: 48295, orders: 1750 },
];

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Revenue Overview</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Monthly revenue and order trends</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Orders
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(220, 13%, 91%)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px hsl(220 60% 20% / 0.08)",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [
              name === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(),
              name === "revenue" ? "Revenue" : "Orders",
            ]}
          />
          <Bar dataKey="revenue" fill="hsl(213, 94%, 52%)" radius={[4, 4, 0, 0]} barSize={28} />
          <Line dataKey="orders" stroke="hsl(220, 60%, 20%)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
