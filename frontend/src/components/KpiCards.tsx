import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trending: "up" | "down";
  icon: React.ElementType;
  index: number;
}

function KpiCard({ title, value, change, trending, icon: Icon, index }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover dark:bg-card/50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          </div>
          <motion.div
            whileHover={{ rotate: 15 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"
          >
            <Icon className="h-5 w-5 text-accent" />
          </motion.div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {trending === "up" ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={`text-sm font-medium ${trending === "up" ? "text-success" : "text-destructive"}`}>
            {change}
          </span>
          <span className="text-sm text-muted-foreground">vs last hour</span>
        </div>
      </div>
    </motion.div>
  );
}

const initialKpiData = [
  { title: "Total Revenue", rawValue: 48295, format: (v: number) => `$${v.toLocaleString()}`, change: 12.5, icon: DollarSign },
  { title: "Active Users", rawValue: 2847, format: (v: number) => v.toLocaleString(), change: 8.2, icon: Users },
  { title: "Orders", rawValue: 1423, format: (v: number) => v.toLocaleString(), change: -3.1, icon: ShoppingCart },
  { title: "Conversion", rawValue: 3.24, format: (v: number) => `${v.toFixed(2)}%`, change: 0.8, icon: Activity },
];

export function KpiCards() {
  const [data, setData] = useState(initialKpiData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        const change = (Math.random() - 0.5) * 0.5;
        const newValue = item.rawValue * (1 + change / 100);
        return {
          ...item,
          rawValue: newValue,
          change: item.change + change
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((kpi, index) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.format(kpi.rawValue)}
          change={`${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%`}
          trending={kpi.change >= 0 ? "up" : "down"}
          icon={kpi.icon}
          index={index}
        />
      ))}
    </div>
  );
}
