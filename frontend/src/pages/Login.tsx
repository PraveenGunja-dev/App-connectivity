import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
const adaniLogo = "/assets/adani-renewables-logo.jpg";

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Any email and password works for now
        setTimeout(() => {
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userEmail", email);
            setIsLoading(false);
            toast.success("Login successful!");
            navigate("/");
        }, 1000);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
            <FloatingBackground />

            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex justify-center mb-8"
                >
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={adaniLogo}
                        alt="Adani Logo"
                        className="h-20 object-contain drop-shadow-md"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-border/40 shadow-2xl backdrop-blur-md bg-card/70 ring-1 ring-white/20">
                        <CardHeader className="space-y-1">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                                <CardDescription className="text-center">
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
                                        className="bg-background/40 border-border/40 focus:border-primary/50 transition-all duration-300 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
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
                                        className="bg-background/40 border-border/40 focus:border-primary/50 transition-all duration-300 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
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
                    className="mt-8 text-center text-sm text-muted-foreground"
                >
                    © {new Date().getFullYear()} Adani Green Energy Limited. All rights reserved.
                </motion.p>
            </div>
        </div>
    );
};

export default Login;
