import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
	title: "Personal Finance Pro",
	description: "Best-in-class personal finance tool",
	manifest: "/manifest.webmanifest",
	themeColor: "#0ea5e9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
				<header className="border-b">
					<nav className="container flex items-center gap-6 py-4">
						<Link href="/" className="font-semibold text-brand">Finance Pro</Link>
						<ul className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
							<li><Link href="/dashboard">Dashboard</Link></li>
							<li><Link href="/transactions">Transactions</Link></li>
							<li><Link href="/budget">Budget</Link></li>
							<li><Link href="/investments">Investments</Link></li>
							<li><Link href="/fire">FIRE</Link></li>
							<li><Link href="/settings">Settings</Link></li>
						</ul>
						<div className="ml-auto"><ThemeToggle /></div>
					</nav>
				</header>
				<main className="container py-6">{children}</main>
			</body>
		</html>
	);
}