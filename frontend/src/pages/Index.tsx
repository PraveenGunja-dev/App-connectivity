import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";

import { ExcelViewer } from "@/components/ExcelViewer";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const response = await fetch("/api/reports/upload", {
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

  const handleDownloadCSV = () => {
    toast.info("Preparing Report CSV...");

    const link = document.createElement("a");
    link.href = "/api/reports/download/csv";
    link.download = "output_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report downloaded successfully!");
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
              className="flex items-center gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-300 shadow-sm"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleDownloadCSV}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </motion.div>
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
          <ExcelViewer />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
