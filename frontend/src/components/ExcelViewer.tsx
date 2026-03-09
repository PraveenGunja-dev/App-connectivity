import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

export function ExcelViewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden mb-10">
            {/* Professional Streamlined Toolbar */}
            <div className="flex flex-col lg:flex-row items-center bg-gradient-to-r from-muted/20 to-muted/5 px-6 py-4 gap-4 border-b border-border/50">
                <div className="relative flex-1 min-w-[240px] max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background/50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 hover:border-primary/20 transition-all font-medium shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-extrabold text-primary/70 uppercase tracking-widest border-r border-border/50 pr-2 mr-1">Report</span>
                        <select
                            value={sheet}
                            onChange={(e) => setSheet(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
                        >
                            <option value="data_to_be_captured">Data to be Captured</option>
                            <option value="margin">Margin</option>
                            <option value="element_status">Element Status</option>
                            <option value="transformation_capacity">Transformation Capacity</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-extrabold text-primary/70 uppercase tracking-widest border-r border-border/50 pr-2 mr-1">State</span>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer min-w-[120px] text-foreground/80 hover:text-foreground transition-colors"
                        >
                            <option value="All States">All States</option>
                            {uniqueStates.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-extrabold text-primary/70 uppercase tracking-widest border-r border-border/50 pr-2 mr-1">Region</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
                        >
                            <option value="All Regions">All Regions</option>
                            {uniqueRegions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-[10px] font-extrabold text-primary/70 uppercase tracking-widest border-r border-border/50 pr-2 mr-1">Substation</span>
                        <select
                            value={selectedSubstation}
                            onChange={(e) => setSelectedSubstation(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer max-w-[180px] text-foreground/80 hover:text-foreground transition-colors"
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                        Reset
                    </button>
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
                        {visibleRows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer with row count */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {filteredRows.length} ROWS FOUND
                    </p>
                    {filteredRows.length > visibleRows.length && (
                        <p className="text-[10px] text-muted-foreground">
                            Showing first {visibleRows.length} rows for performance.
                        </p>
                    )}
                    <div className="h-4 w-px bg-border hidden sm:block" />
                </div>
            </div>
        </div>
    );
}
