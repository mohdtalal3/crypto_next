import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Aurum Portal", description: "Aurum Neo Bank and OrbitOne portal" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
