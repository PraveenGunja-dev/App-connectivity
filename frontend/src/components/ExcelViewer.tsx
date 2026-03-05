import { useEffect, useMemo, useState } from "react";
import {
    FileSpreadsheet,
    Search,
    Download,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExcelViewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [headers, setHeaders] = useState<string[]>([]);
    const [subHeaders, setSubHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sheet, setSheet] = useState<string>("data_to_be_captured");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("accessToken");

                const response = await fetch(`/api/reports/csv-raw?sheet=${encodeURIComponent(sheet)}`, {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : undefined,
                });

                if (!response.ok) {
                    throw new Error("Failed to load report data");
                }

                const json: { data: string[][] } = await response.json();
                if (!json.data || json.data.length < 2) {
                    setHeaders([]);
                    setSubHeaders([]);
                    setRows([]);
                    return;
                }

                // Row 0 = Parents, Row 1 = Children
                const [parentRow, childRow, ...dataRows] = json.data;
                setHeaders(parentRow);
                setSubHeaders(childRow);
                setRows(dataRows);
            } catch (error) {
                console.error(error);
                toast.error("Could not load report data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sheet]);

    const handleDownload = () => {
        const token = localStorage.getItem("accessToken");
        const url = `/api/reports/download/csv?sheet=${encodeURIComponent(sheet)}`;

        const link = document.createElement("a");
        link.href = url;
        if (token) {
            // Browsers don't allow setting headers on simple <a> downloads;
            // since reports API allows optional auth, we can just hit the URL directly.
        }
        link.download = "output_report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRows = useMemo(() => {
        if (!searchTerm) return rows;
        return rows.filter(row =>
            row.some(cell => String(cell || "").toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, rows]);

    // Complex Header Calculation for colSpan and rowSpan
    const complexHeaders = useMemo(() => {
        const result: { text: string; colSpan: number; hasChildren: boolean; startIndex: number }[] = [];
        let i = 0;

        while (i < headers.length) {
            const parentText = String(headers[i] || "").trim();

            // Determine span based on empty cells following this parent
            let span = 1;
            let nextI = i + 1;
            while (nextI < headers.length && String(headers[nextI] || "").trim() === "") {
                span++;
                nextI++;
            }

            // A parent "has children" if the subHeader row contains any label in this span
            const childrenLabels = subHeaders.slice(i, i + span).filter(s => String(s || "").trim() !== "");

            result.push({
                text: parentText.replace(/_/g, " "),
                colSpan: span,
                hasChildren: childrenLabels.length > 0,
                startIndex: i
            });

            i = nextI;
        }
        return result;
    }, [headers, subHeaders]);

    // Determine which column indices belong to standalone parents (rowSpan=2, no children)
    // Only these columns should be skipped in the child header row
    const skippedColumns = useMemo(() => {
        const set = new Set<number>();
        complexHeaders.forEach(h => {
            if (!h.hasChildren) {
                for (let j = h.startIndex; j < h.startIndex + h.colSpan; j++) {
                    set.add(j);
                }
            }
        });
        return set;
    }, [complexHeaders]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden mb-10"
        >
            {/* Professional Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between border-b border-border bg-muted/20 px-8 py-5 gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success shadow-inner">
                        <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-card-foreground tracking-tight">Output Report Viewer</h3>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                {sheet === "data_to_be_captured" && "Live System Output \u2022 Data to be Captured"}
                                {sheet === "margin" && "Live System Output \u2022 Margin"}
                                {sheet === "element_status" && "Live System Output \u2022 Element Status"}
                                {sheet === "transformation_capacity" && "Live System Output \u2022 Transformation Capacity"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[220px] max-w-xs">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder="Filter records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/80 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-primary/30 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={sheet}
                            onChange={(e) => setSheet(e.target.value)}
                            className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="data_to_be_captured">Data to be Captured</option>
                            <option value="margin">Margin</option>
                            <option value="element_status">Element Status</option>
                            <option value="transformation_capacity">Transformation Capacity</option>
                        </select>
                        <Button variant="outline" size="sm" className="h-10 rounded-xl px-4 font-bold border-border/60 hover:bg-secondary transition-all">
                            <Filter className="h-4 w-4 mr-2 opacity-60" />
                            Filter
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-10 rounded-xl px-4 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                            onClick={handleDownload}
                            disabled={headers.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid Interface */}
            <div className="overflow-x-auto max-h-[750px] overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse bg-white">
                    <thead>
                        {/* Row 1: Parent Headers */}
                        <tr className="bg-[#D9EAF7]">
                            {complexHeaders.map((h, i) => (
                                <th
                                    key={i}
                                    colSpan={h.colSpan}
                                    rowSpan={h.hasChildren ? 1 : 2}
                                    className={`px-2.5 py-1.5 font-bold text-[#1A1A1A] text-[11.5px] tracking-tight border-r border-b border-[#94A3B8] align-middle ${h.colSpan > 1 ? "text-center" : "text-left"
                                        }`}
                                >
                                    <div className="whitespace-pre-line leading-[1.2]">
                                        {h.text}
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Row 2: Child Sub-Headers */}
                        <tr className="bg-[#D9EAF7]">
                            {subHeaders.map((sub, i) => {
                                // Only skip columns owned by rowSpan=2 parents (standalone columns)
                                if (skippedColumns.has(i)) return null;
                                return (
                                    <th
                                        key={i}
                                        className="px-2 py-1 font-bold text-[#1A1A1A] text-[10.5px] border-r border-b border-[#94A3B8] text-center align-middle"
                                    >
                                        {sub}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredRows.map((row, rowIndex) => (
                                <motion.tr
                                    key={rowIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-[#E2E8F0] last:border-0 transition-colors hover:bg-blue-50/20"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-2.5 py-1 text-[11.5px] text-[#2D3748] border-r border-[#E2E8F0] last:border-0 whitespace-nowrap"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Footer with row count */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {filteredRows.length} ROWS FOUND
                    </p>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                </div>
            </div>
        </motion.div>
    );
}
