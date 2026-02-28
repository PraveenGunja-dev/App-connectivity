import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiCards } from "@/components/KpiCards";
import { RevenueChart } from "@/components/RevenueChart";
import { ExcelViewer } from "@/components/ExcelViewer";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userEmail = localStorage.getItem("userEmail") || "admin@adani.com";
  const rawName = userEmail.split(/[._@]/)[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        toast.success(`Uploading ${file.name}...`);
        // Simulating upload process
        setTimeout(() => {
          toast.success("PDF uploaded successfully!");
        }, 2000);
      } else {
        toast.error("Please upload a PDF file.");
      }
    }
  };

  const handleDownloadCSV = () => {
    toast.info("Preparing CSV download...");

    // Mock CSV data
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Name,Revenue,Change,Date\n"
      + "Total Revenue,$48295,+12.5%,Feb 2026\n"
      + "Active Users,2847,+8.2%,Feb 2026\n"
      + "Orders,1423,-3.1%,Feb 2026";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV downloaded successfully!");
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
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Welcome back, {displayName} 👋
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-1 text-muted-foreground"
          >
            Here's what's happening across your business today.
          </motion.p>
        </div>

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

      {/* Main Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <KpiCards />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 grid gap-8 xl:grid-cols-1"
        >
          <RevenueChart />
          <ExcelViewer />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
