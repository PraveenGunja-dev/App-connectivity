import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface ExcelViewerProps {
    sheet: string;
    setSheet: (sheet: string) => void;
}

export function ExcelViewer({ sheet, setSheet }: ExcelViewerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [headers, setHeaders] = useState<string[]>([]);
    const [subHeaders, setSubHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [metadata, setMetadata] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedRegion, setSelectedRegion] = useState("All Regions");
    const [selectedSubstation, setSelectedSubstation] = useState("All Substations");


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("accessToken");

                const response = await fetch(`/app-connectivity/api/reports/csv-raw?sheet=${encodeURIComponent(sheet)}`, {
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

                if (sheet === "transformation_capacity" && json.data.length >= 3) {
                    // Row 0 = Metadata row, Row 1 = Parents, Row 2 = Children
                    const [metaRow, parentRow, childRow, ...dataRows] = json.data;
                    setHeaders(parentRow);
                    setSubHeaders(childRow);
                    setRows(dataRows);
                    const metaText = metaRow.filter(c => c?.trim()).join(" ");
                    setMetadata(metaText || null);
                } else {
                    // Row 0 = Parents, Row 1 = Children
                    const [parentRow, childRow, ...dataRows] = json.data;
                    setHeaders(parentRow);
                    setSubHeaders(childRow);
                    setRows(dataRows);
                    setMetadata(null);
                }
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
        setSearchTerm("");
    }, [sheet]);

    // Debounce search input so we don't recompute filters on every keystroke
    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
        }, 300);
        return () => clearTimeout(handle);
    }, [searchTerm]);


    const getColIdx = (terms: string[]) => {
        for (const term of terms) {
            const idx = headers.findIndex(h => h?.toLowerCase().trim() === term.toLowerCase());
            if (idx !== -1) return idx;
            const idxSub = subHeaders.findIndex(h => h?.toLowerCase().trim() === term.toLowerCase());
            if (idxSub !== -1) return idxSub;
        }
        for (const term of terms) {
            const idx = headers.findIndex(h => h?.toLowerCase().includes(term.toLowerCase()));
            if (idx !== -1) return idx;
            const idxSub = subHeaders.findIndex(h => h?.toLowerCase().includes(term.toLowerCase()));
            if (idxSub !== -1) return idxSub;
        }
        return -1;
    };

    const stateIdx = useMemo(() => getColIdx(["state"]), [headers, subHeaders]);
    const regionIdx = useMemo(() => getColIdx(["region"]), [headers, subHeaders]);
    const substationIdx = useMemo(() => getColIdx(["substation", "pooling s/s", "pooling station", "s/s name"]), [headers, subHeaders]);

    const normalize = (val: string) => (val || "").trim().toLowerCase();

    // Derived unique options based on OTHER active filters (Cascading Logic)
    const uniqueStates = useMemo(() => {
        if (stateIdx === -1) return [];
        const filtered = rows.filter(row => {
            const matchesRegion = selectedRegion === "All Regions" || regionIdx === -1 || normalize(row[regionIdx]) === normalize(selectedRegion);
            const matchesSubstation = selectedSubstation === "All Substations" || substationIdx === -1 || normalize(row[substationIdx]) === normalize(selectedSubstation);
            const matchesSearch = !debouncedSearchTerm || row.some(cell => normalize(cell).includes(normalize(debouncedSearchTerm)));
            return matchesRegion && matchesSubstation && matchesSearch;
        });
        const seen = new Set<string>();
        filtered.forEach(row => {
            const val = row[stateIdx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, stateIdx, regionIdx, substationIdx, selectedRegion, selectedSubstation, debouncedSearchTerm]);

    const uniqueRegions = useMemo(() => {
        if (regionIdx === -1) return [];
        const filtered = rows.filter(row => {
            const matchesState = selectedState === "All States" || stateIdx === -1 || normalize(row[stateIdx]) === normalize(selectedState);
            const matchesSubstation = selectedSubstation === "All Substations" || substationIdx === -1 || normalize(row[substationIdx]) === normalize(selectedSubstation);
            const matchesSearch = !debouncedSearchTerm || row.some(cell => normalize(cell).includes(normalize(debouncedSearchTerm)));
            return matchesState && matchesSubstation && matchesSearch;
        });
        const seen = new Set<string>();
        filtered.forEach(row => {
            const val = row[regionIdx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, stateIdx, regionIdx, substationIdx, selectedState, selectedSubstation, debouncedSearchTerm]);

    const uniqueSubstations = useMemo(() => {
        if (substationIdx === -1) return [];
        const filtered = rows.filter(row => {
            const matchesState = selectedState === "All States" || stateIdx === -1 || normalize(row[stateIdx]) === normalize(selectedState);
            const matchesRegion = selectedRegion === "All Regions" || regionIdx === -1 || normalize(row[regionIdx]) === normalize(selectedRegion);
            const matchesSearch = !debouncedSearchTerm || row.some(cell => normalize(cell).includes(normalize(debouncedSearchTerm)));
            return matchesState && matchesRegion && matchesSearch;
        });
        const seen = new Set<string>();
        filtered.forEach(row => {
            const val = row[substationIdx]?.trim();
            if (val) seen.add(val);
        });
        return Array.from(seen).sort();
    }, [rows, stateIdx, regionIdx, substationIdx, selectedState, selectedRegion, debouncedSearchTerm]);

    // Auto-reset filters if they become invalid due to other selections
    useEffect(() => {
        if (selectedState !== "All States" && uniqueStates.length > 0 && !uniqueStates.includes(selectedState)) {
            setSelectedState("All States");
        }
    }, [uniqueStates, selectedState]);

    useEffect(() => {
        if (selectedRegion !== "All Regions" && uniqueRegions.length > 0 && !uniqueRegions.includes(selectedRegion)) {
            setSelectedRegion("All Regions");
        }
    }, [uniqueRegions, selectedRegion]);

    useEffect(() => {
        if (selectedSubstation !== "All Substations" && uniqueSubstations.length > 0 && !uniqueSubstations.includes(selectedSubstation)) {
            setSelectedSubstation("All Substations");
        }
    }, [uniqueSubstations, selectedSubstation]);

    const filteredRows = useMemo(() => {
        let result = rows;

        if (selectedState !== "All States" && stateIdx !== -1) {
            result = result.filter(row => normalize(row[stateIdx]) === normalize(selectedState));
        }

        if (selectedRegion !== "All Regions" && regionIdx !== -1) {
            result = result.filter(row => normalize(row[regionIdx]) === normalize(selectedRegion));
        }

        if (selectedSubstation !== "All Substations" && substationIdx !== -1) {
            result = result.filter(row => normalize(row[substationIdx]) === normalize(selectedSubstation));
        }

        if (debouncedSearchTerm) {
            result = result.filter(row =>
                row.some(cell => normalize(cell).includes(normalize(debouncedSearchTerm)))
            );
        }

        return result;
    }, [debouncedSearchTerm, rows, selectedState, selectedRegion, selectedSubstation, stateIdx, regionIdx, substationIdx]);

    // Cap the number of rendered rows to keep the DOM fast even for huge datasets
    const MAX_VISIBLE_ROWS = 2000;
    const visibleRows = useMemo(() => {
        if (filteredRows.length <= MAX_VISIBLE_ROWS) return filteredRows;
        return filteredRows.slice(0, MAX_VISIBLE_ROWS);
    }, [filteredRows]);

    // Complex Header Calculation for colSpan and rowSpan
    const complexHeaders = useMemo(() => {
        if (!headers || headers.length === 0) return [];
        
        const result: { text: string; colSpan: number; hasChildren: boolean; startIndex: number }[] = [];
        let i = 0;

        while (i < headers.length) {
            const rawText = headers[i];
            const parentText = String(rawText || "").trim();

            // Determine span based on empty cells following this parent
            // If the parent is empty, it might still have children in the subHeaders
            let span = 1;
            let nextI = i + 1;
            while (nextI < headers.length && String(headers[nextI] || "").trim() === "") {
                span++;
                nextI++;
            }

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

    // Fixed and equal column width for a robust, consistent grid
    const COLUMN_WIDTH = 150; // pixels
    const CELL_HEIGHT = "h-[40px]";

    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden mb-10 transition-all duration-300 hover:shadow-primary/5">
            {/* Professional Streamlined Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-muted/30 via-muted/10 to-transparent px-6 py-5 gap-4 border-b border-border/60">
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-r border-border/80 pr-3 mr-1">Report</span>
                        <select
                            value={sheet}
                            onChange={(e) => setSheet(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-foreground/90 hover:text-primary transition-colors"
                        >
                            <option value="margin">Margin</option>
                            <option value="transformation_capacity">Transformation Capacity</option>
                            <option value="data_to_be_captured">Data to be captured</option>
                            <option value="element_status">Element Status</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-black text-[var(--adani-wind-purple)] uppercase tracking-[0.2em] border-r border-border/80 pr-3 mr-1">State</span>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer max-w-[140px] text-foreground/90 hover:text-[var(--adani-wind-purple)] transition-colors"
                        >
                            <option value="All States">All States</option>
                            {uniqueStates.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-black text-[var(--adani-wind-magenta)] uppercase tracking-[0.2em] border-r border-border/80 pr-3 mr-1">Region</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-foreground/90 hover:text-[var(--adani-wind-magenta)] transition-colors"
                        >
                            <option value="All Regions">All Regions</option>
                            {uniqueRegions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-black text-[var(--adani-wind-red)] uppercase tracking-[0.2em] border-r border-border/80 pr-3 mr-1">Station</span>
                        <select
                            value={selectedSubstation}
                            onChange={(e) => setSelectedSubstation(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer max-w-[180px] text-foreground/90 hover:text-[var(--adani-wind-red)] transition-colors"
                        >
                            <option value="All Substations">All Substations</option>
                            {uniqueSubstations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedState("All States");
                            setSelectedRegion("All Regions");
                            setSelectedSubstation("All Substations");
                            setSearchTerm("");
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--adani-wind-blue)] hover:text-white hover:border-[var(--adani-wind-blue)] hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Metadata Banner */}
            {metadata && (
                <div className="px-6 py-3 flex justify-end bg-primary/5 border-b border-primary/10">
                    <span className="text-[12px] font-bold text-primary tracking-wide flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        {metadata}
                    </span>
                </div>
            )}

            {/* Grid Interface */}
            <div className="relative overflow-x-auto max-h-[850px] overflow-y-auto custom-scrollbar bg-slate-50/30 border border-slate-200/60 rounded-b-2xl">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Synchronizing Data...</span>
                        </div>
                    </div>
                )}

                <table className="w-full border-separate border-spacing-0 table-fixed min-w-full">
                    <colgroup>
                        {/* Data Columns */}
                        {(headers.length > 0 ? headers : Array(20).fill("")).map((_, i) => (
                            <col key={i} style={{ width: `${COLUMN_WIDTH}px` }} />
                        ))}
                    </colgroup>
                    <thead className="sticky top-0 z-40 bg-white">
                        {/* Row 1: Parent Headers */}
                        <tr className="bg-slate-100 shadow-sm">
                            
                            {complexHeaders.map((h, i) => (
                                <th
                                    key={i}
                                    colSpan={h.colSpan}
                                    rowSpan={h.hasChildren ? 1 : 2}
                                    className="p-0 border-r border-b border-slate-300 align-middle text-center sticky top-0 bg-slate-100 z-40 font-bold text-slate-800 text-[11px] uppercase tracking-wider"
                                >
                                    <div 
                                        className="flex items-center justify-center text-center px-2 leading-tight overflow-hidden text-[11px]"
                                        style={{ 
                                            height: h.hasChildren ? '36px' : '72px',
                                            width: `${h.colSpan * COLUMN_WIDTH}px`
                                        }}
                                    >
                                        <span className="line-clamp-2">{h.text || (h.hasChildren ? "" : " ")}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Row 2: Child Sub-Headers */}
                        <tr className="bg-slate-100 shadow-sm">
                            {subHeaders.map((sub, i) => {
                                // Only skip columns owned by rowSpan=2 parents (standalone columns)
                                if (skippedColumns.has(i)) return null;
                                return (
                                    <th
                                        key={i}
                                        className="p-0 border-r border-b border-slate-300 align-middle text-center sticky top-[36px] bg-slate-100 z-40 font-bold text-slate-800 text-[10px] uppercase tracking-tight"
                                    >
                                        <div 
                                            className="h-[36px] flex items-center justify-center text-center px-2 leading-tight overflow-hidden text-[10px]"
                                            style={{ width: `${COLUMN_WIDTH}px` }}
                                        >
                                            <span className="line-clamp-2">{sub}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="relative z-10 bg-white">
                        {visibleRows.map((row, rowIndex) => {
                            const isTransformationCapacity = sheet === "transformation_capacity";
                            const isHighlighted = isTransformationCapacity && 
                                                 row[0] === "63" && 
                                                 row[3] === "Bhadla-IV";
                            
                            // Calculate actual serial number based on filtering
                            const serialNumber = rowIndex + 1;

                            return (
                                <tr
                                    key={rowIndex}
                                    className={`group transition-colors ${
                                        isHighlighted 
                                        ? "bg-amber-50/80 hover:bg-amber-100/80" 
                                        : "hover:bg-slate-50"
                                    }`}
                                >
                                    
                                    {/* Data Columns */}
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className={`p-0 border-r border-b border-slate-200 align-middle ${
                                                isHighlighted ? "border-amber-200/50" : ""
                                            }`}
                                        >
                                            <div 
                                                className={`flex items-center justify-start text-left px-3 overflow-x-auto whitespace-nowrap scrollbar-hide text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors ${CELL_HEIGHT}`}
                                                style={{ width: `${COLUMN_WIDTH}px` }}
                                            >
                                                {cell}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer with row count */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {visibleRows.length} ROW{visibleRows.length !== 1 ? 'S' : ''} FOUND
                    </p>
                    {filteredRows.length > visibleRows.length && (
                        <p className="text-[10px] text-muted-foreground">
                            (Total: {filteredRows.length} rows - showing first {visibleRows.length} for performance)
                        </p>
                    )}
                    <div className="h-4 w-px bg-border hidden sm:block" />
                </div>
            </div>
        </div>
    );
}
