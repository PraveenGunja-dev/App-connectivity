import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function ExcelViewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [headers, setHeaders] = useState<string[]>([]);
    const [subHeaders, setSubHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sheet, setSheet] = useState<string>("data_to_be_captured");
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedRegion, setSelectedRegion] = useState("All Regions");
    const [selectedSubstation, setSelectedSubstation] = useState("All Substations");


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
        // Reset filters when sheet changes
        setSelectedState("All States");
        setSelectedRegion("All Regions");
        setSelectedSubstation("All Substations");
    }, [sheet]);


    const findColIdx = (term: string) => {
        const idx = headers.findIndex(h => h?.toLowerCase().includes(term));
        return idx !== -1 ? idx : subHeaders.findIndex(h => h?.toLowerCase().includes(term));
    };

    const uniqueStates = useMemo(() => {
        const idx = findColIdx("state");
        if (idx === -1) return [];
        const seen = new Set<string>();
        rows.forEach(row => {
            const val = row[idx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, headers, subHeaders]);

    const uniqueRegions = useMemo(() => {
        const idx = findColIdx("region");
        if (idx === -1) return [];
        const seen = new Set<string>();
        rows.forEach(row => {
            const val = row[idx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, headers, subHeaders]);

    const uniqueSubstations = useMemo(() => {
        const idx = findColIdx("substation");
        if (idx === -1) return [];
        const seen = new Set<string>();
        rows.forEach(row => {
            const val = row[idx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, headers, subHeaders]);

    const filteredRows = useMemo(() => {
        let result = rows;

        const stateIdx = findColIdx("state");
        const regionIdx = findColIdx("region");
        const substationIdx = findColIdx("substation");

        if (selectedState !== "All States" && stateIdx !== -1) {
            result = result.filter(row => (row[stateIdx] || "").toLowerCase() === selectedState.toLowerCase());
        }

        if (selectedRegion !== "All Regions" && regionIdx !== -1) {
            result = result.filter(row => (row[regionIdx] || "").toLowerCase() === selectedRegion.toLowerCase());
        }

        if (selectedSubstation !== "All Substations" && substationIdx !== -1) {
            result = result.filter(row => (row[substationIdx] || "").toLowerCase() === selectedSubstation.toLowerCase());
        }

        if (searchTerm) {
            result = result.filter(row =>
                row.some(cell => String(cell || "").toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return result;
    }, [searchTerm, rows, selectedState, selectedRegion, selectedSubstation, subHeaders]);

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
            {/* Professional Streamlined Toolbar */}
            <div className="flex flex-col lg:flex-row items-center bg-muted/10 px-6 py-4 gap-4 border-b border-border">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-primary/20 transition-all font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Report:</span>
                        <select
                            value={sheet}
                            onChange={(e) => setSheet(e.target.value)}
                            className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="data_to_be_captured">Data to be Captured</option>
                            <option value="margin">Margin</option>
                            <option value="element_status">Element Status</option>
                            <option value="transformation_capacity">Transformation Capacity</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">State:</span>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer min-w-[100px]"
                        >
                            <option value="All States">All States</option>
                            {uniqueStates.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Region:</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="All Regions">All Regions</option>
                            {uniqueRegions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Substation:</span>
                        <select
                            value={selectedSubstation}
                            onChange={(e) => setSelectedSubstation(e.target.value)}
                            className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer max-w-[150px]"
                        >
                            <option value="All Substations">All Substations</option>
                            {uniqueSubstations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
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
