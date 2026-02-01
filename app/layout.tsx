import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/components/providers/auth-modal-provider";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    title: "StartupAI - AI-Powered Startup Orchestration Platform",
    description: "Transform your startup idea into reality with AI-powered analysis, team building, and automation. From ideation to launch.",
    keywords: ["startup", "AI", "automation", "business planning", "entrepreneurship"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
                <SessionProvider>
                    <AuthModalProvider>
                        <MotionProvider>{children}</MotionProvider>
                    </AuthModalProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
