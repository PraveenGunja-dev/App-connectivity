import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ExcelViewer } from "@/components/ExcelViewer";


import { Button } from "@/components/ui/button";
import { Upload, Download, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState("margin");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.success(`Uploading ${file.name}...`);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/app-connectivity/api/reports/upload", {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data: { id: string; filename: string; saved_as: string } = await response.json();
      toast.success(`PDF uploaded successfully as ${data.saved_as}`);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      // reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    const link = document.createElement("a");
    link.href = `/app-connectivity/api/reports/download/${format}?sheet=${sheet}`;
    link.download = `${sheet}_report.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadOptions(false);
    toast.success(`${format.toUpperCase()} Download Started`);
  };

  return (
    <DashboardLayout title="App Connectivity Dashboard">
      {/* Welcome and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[var(--adani-wind-purple)]/20 bg-[var(--adani-wind-purple)]/5 text-[var(--adani-wind-purple)] hover:bg-[var(--adani-wind-purple)]/10 transition-all duration-300 shadow-sm"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </motion.div>
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-[var(--adani-wind-blue)] to-[var(--adani-wind-purple)] text-white"
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              >
                <Download className="h-4 w-4" />
                Download Report
                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showDownloadOptions ? 'rotate-180' : ''}`} />
              </Button>
            </motion.div>

            {showDownloadOptions && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-1">
                  <button
                    onClick={() => handleDownload('csv')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all rounded-lg text-left"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleDownload('xlsx')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all rounded-lg text-left"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    Export as XLSX
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Sections (Chart & Viewer) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 grid gap-8 xl:grid-cols-1"
        >
          <ExcelViewer sheet={sheet} setSheet={setSheet} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
