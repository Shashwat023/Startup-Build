"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthFormProps {
    mode: "login" | "signup";
}

/**
 * Reusable authentication form component
 * Handles both login and signup with animated form fields
 */
export function AuthForm({ mode }: AuthFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication - no real backend
        console.log("Form submitted:", formData);
        // In a real app, this would call an API
        window.location.href = "/dashboard";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {mode === "signup" && (
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                    </label>
                    <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                </label>
                <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                </label>
                <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {mode === "login" && (
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-neutral-600">Remember me</span>
                    </label>
                    <a href="#" className="text-primary-600 hover:text-primary-700">
                        Forgot password?
                    </a>
                </div>
            )}

            <Button type="submit" className="w-full" size="lg">
                {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
        </motion.form>
    );
}
