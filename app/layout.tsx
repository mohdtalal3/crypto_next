import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const garamond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = { title: "Aurum Portal — D.A.R.A.", description: "D.A.R.A. member portal: Neo Bank, OrbitOne and claim tools." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${inter.variable} ${garamond.variable}`}><body>{children}</body></html>; }
