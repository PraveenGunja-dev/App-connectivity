import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleMicrosoftSSO = async () => {
        setIsLoading(true);
        try {
            // Microsoft SSO authentication logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
            
            // Set authentication
            localStorage.setItem("accessToken", "microsoft-sso-token");
            localStorage.setItem("userEmail", "user@microsoft.com");
            localStorage.setItem("isAuthenticated", "true");
            
            toast.success("Microsoft SSO Login successful!");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Microsoft SSO login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnterApplication = () => {
        setIsLoading(true);
        try {
            // Direct application entry without authentication
            localStorage.setItem("accessToken", "guest-token");
            localStorage.setItem("userEmail", "guest@appconnectivity.com");
            localStorage.setItem("isAuthenticated", "true");
            
            toast.success("Welcome to App Connectivity!");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to enter application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground" style={{ fontFamily: 'Adani, sans-serif' }}>
            {/* Grid Background */}
            <div className="fixed inset-0 z-0 bg-grid">
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background/90 z-0 pointer-events-none"></div>
            </div>

            {/* Content layered on top */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                {/* Main Content Area */}
                <main className="w-full max-w-5xl flex flex-col items-center">
                    
                    {/* Top Logo & Branding */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center mb-10 mt-8 md:mt-0"
                    >
                        <img src="/app-connectivity/assets/logo.png" alt="Adani Logo" className="h-10 md:h-12 w-auto object-contain" />
                    </motion.div>

                    {/* Grand Futuristic Title */}
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#0B74B0] via-[#75479C] to-[#BD3861] bg-clip-text text-transparent tracking-[0.2em] ml-[0.2em] mb-6 uppercase text-center leading-tight drop-shadow-md dark:drop-shadow-xl"
                    >
                        APP CONNECTIVITY
                    </motion.h1>

                    {/* Subtitle with Tracking & Borders */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full max-w-3xl border-t border-b border-border py-4 mb-20 text-center flex justify-center"
                    >
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base tracking-[0.4em] ml-[0.4em] font-light uppercase">
                            Transmission Line Management System
                        </p>
                    </motion.div>

                    {/* Centered Login Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        {/* Microsoft SSO Button */}
                        <Button
                            onClick={handleMicrosoftSSO}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full sm:w-auto min-w-[280px] h-16 text-xl font-bold border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <svg className="w-7 h-7 mr-3" viewBox="0 0 23 23" fill="currentColor">
                                <path d="M10.875 0L0 1.375V10.875H10.875V0Z" />
                                <path d="M22.75 0H12.25V10.875H22.75V0Z" />
                                <path d="M10.875 12.25H0V21.75L10.875 23V12.25Z" />
                                <path d="M22.75 12.25H12.25V23L22.75 21.75V12.25Z" />
                            </svg>
                            {isLoading ? "Authenticating..." : "Microsoft SSO"}
                        </Button>

                        {/* Enter Application Button */}
                        <Button
                            onClick={handleEnterApplication}
                            disabled={isLoading}
                            className="w-full sm:w-auto min-w-[280px] h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? "Entering..." : "Enter Application"}
                        </Button>
                    </motion.div>
                </main>
            </div>

            <style>{`
                .bg-grid {
                    background-image: 
                        linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>
        </div>
    );
};

export default Login;
