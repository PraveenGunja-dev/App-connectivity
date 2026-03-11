import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
const adaniLogo = "/assets/logo.png";

const FloatingBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-primary/5 blur-3xl"
                    initial={{
                        width: Math.random() * 400 + 200,
                        height: Math.random() * 400 + 200,
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: 0.3,
                    }}
                    animate={{
                        x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                        y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: Math.random() * 20 + 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                toast.error("Invalid email or password");
                return;
            }

            const data: { access_token: string; token_type: string; user_email: string } = await response.json();

            // Persist auth details for protected routes and API calls
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("userEmail", data.user_email);
            localStorage.setItem("isAuthenticated", "true");

            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-30"
                style={{ backgroundImage: "url('/assets/Adani Power Thumbnail-1.webp')" }}
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] -z-20" />
            <FloatingBackground />

            <div className="w-full max-w-md relative z-10">
                {/* Logo removed from here to shift it inside the card below */}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-border shadow-2xl bg-card">
                        <CardHeader className="space-y-1">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <CardTitle className="flex justify-center mb-4 pt-2">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        src={adaniLogo}
                                        alt="Adani Logo"
                                        className="h-14 object-contain drop-shadow-md"
                                    />
                                </CardTitle>
                                <CardDescription className="text-center font-medium text-foreground/70">
                                    Login to Adani App Connectivity Page
                                </CardDescription>
                            </motion.div>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background border-border focus:border-primary transition-all duration-300 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" title="Enter any password" className="text-foreground/80">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-background border-border focus:border-primary transition-all duration-300 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    />
                                </motion.div>
                            </CardContent>
                            <CardFooter>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="w-full"
                                >
                                    <Button
                                        type="submit"
                                        className="w-full font-semibold transition-all duration-300 relative overflow-hidden group"
                                        disabled={isLoading}
                                    >
                                        <span className="relative z-10">{isLoading ? "Logging in..." : "Login"}</span>
                                        {!isLoading && (
                                            <motion.div
                                                className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                                                initial={false}
                                            />
                                        )}
                                    </Button>
                                </motion.div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8 text-center text-sm text-white/70 font-medium"
                >
                    © {new Date().getFullYear()} Adani Green Energy Limited. All rights reserved.
                </motion.p>
            </div>
        </div>
    );
};

export default Login;
