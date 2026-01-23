import Link from "next/link";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";

/**
 * Footer component with gold accents
 */
export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-neutral-950">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0C37A] to-[#D4A84A]">
                                <Rocket className="w-6 h-6 text-black" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] bg-clip-text text-transparent">
                                StartupAI
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400">
                            AI-powered platform for orchestrating your startup journey from idea to launch.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/crew" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Board Panel Advisory
                                </Link>
                            </li>
                            <li>
                                <Link href="/enhance" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Enhance Idea
                                </Link>
                            </li>
                            <li>
                                <Link href="/investor" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Investor
                                </Link>
                            </li>
                            <li>
                                <Link href="/predictor" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Predictor
                                </Link>
                            </li>
                            <li>
                                <Link href="/rag" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Chatbot
                                </Link>
                            </li>
                            <li>
                                <Link href="/pitcher" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Pitcher
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-sm text-neutral-400 hover:text-[#F0C37A] transition-colors">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-[#F0C37A] transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-[#F0C37A] transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-[#F0C37A] transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-neutral-400">
                    <p>&copy; {new Date().getFullYear()} StartupAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
