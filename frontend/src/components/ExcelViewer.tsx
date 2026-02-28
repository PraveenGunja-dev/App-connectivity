import { useState, useMemo } from "react";
import {
    FileSpreadsheet,
    Search,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Mock "Output" Data - This looks like a real business report
const MOCK_EXCEL_DATA = [
    ["Date", "Reference ID", "Description", "Category", "Amount", "Status", "Connectivity"],
    ["2026-02-28", "AD-9921", "Server Instance - Asia South", "Infrastructure", "$1,240.00", "Success", "Active"],
    ["2026-02-28", "AD-9922", "Database Cluster Backup", "Cloud Services", "$450.00", "Success", "Active"],
    ["2026-02-27", "AD-9923", "API Gateway Subscription", "Software", "$89.99", "Pending", "Warning"],
    ["2026-02-27", "AD-9924", "Security Audit - Q1", "Compliance", "$2,100.00", "Success", "Active"],
    ["2026-02-26", "AD-9925", "Load Balancer Config", "Network", "$320.00", "Failed", "Offline"],
    ["2026-02-26", "AD-9926", "SSL Certificate Renewal", "Security", "$149.00", "Success", "Active"],
    ["2026-02-25", "AD-9927", "Data Storage Expansion", "Hardware", "$850.00", "Success", "Active"],
    ["2026-02-25", "AD-9928", "Employee Training Portal", "Operations", "$1,200.00", "Success", "Active"],
    ["2026-02-24", "AD-9929", "CDN Bandwidth Overage", "Network", "$112.50", "Success", "Active"],
    ["2026-02-24", "AD-9930", "Legacy System Migration", "Engineering", "$5,000.00", "Success", "Active"],
];

const PAGE_SIZE = 8;

export function ExcelViewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const headers = MOCK_EXCEL_DATA[0];
    const rows = useMemo(() => MOCK_EXCEL_DATA.slice(1), []);

    const filteredRows = useMemo(() => {
        if (!searchTerm) return rows;
        return rows.filter(row =>
            row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, rows]);

    const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
    const pageData = useMemo(() =>
        filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [page, filteredRows]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-xl border border-border bg-card shadow-lg transition-all dark:bg-card/40 overflow-hidden"
        >
            {/* Excel Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border bg-muted/30 px-6 py-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                        <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-card-foreground">Output Report Viewer</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sheet1 - Business Output 2026</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search in sheet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 h-10 w-10">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 h-10 w-10">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid Interface */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="w-10 border-r border-border p-2 text-center text-[10px] font-bold text-muted-foreground">#</th>
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-r border-border last:border-0"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {pageData.map((row, rowIndex) => (
                                <motion.tr
                                    key={rowIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group border-b border-border last:border-0 transition-colors hover:bg-primary/5"
                                >
                                    <td className="w-10 border-r border-border bg-muted/10 p-2 text-center text-[10px] font-medium text-muted-foreground group-hover:bg-primary/10">
                                        {(page - 1) * PAGE_SIZE + rowIndex + 1}
                                    </td>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-4 py-3.5 text-sm text-card-foreground border-r border-border last:border-0"
                                        >
                                            {cellIndex === 5 ? (
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cell === 'Success' ? 'bg-success/10 text-success' :
                                                        cell === 'Pending' ? 'bg-warning/10 text-warning' :
                                                            'bg-destructive/10 text-destructive'
                                                    }`}>
                                                    {cell}
                                                </span>
                                            ) : cellIndex === 6 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${cell === 'Active' ? 'bg-success' :
                                                            cell === 'Warning' ? 'bg-warning' :
                                                                'bg-destructive animate-pulse'
                                                        }`} />
                                                    <span className="font-medium">{cell}</span>
                                                </div>
                                            ) : (
                                                cell
                                            )}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Excel Footer / Pagination */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {filteredRows.length} ROWS FOUND
                    </p>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        SUM: $13,445.49
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setPage(p)}
                                className="h-8 w-8 text-xs font-bold"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
