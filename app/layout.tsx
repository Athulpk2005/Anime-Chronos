import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Anime Chronos - Premium Anime Tracker",
    description: "A web-based platform for anime enthusiasts to discover movies and series.",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`${inter.variable} font-sans bg-background-dark text-slate-100 min-h-screen relative`} suppressHydrationWarning>
                {/* Background Blobs */}
                <div className="blob top-[-10%] left-[-10%]"></div>
                <div className="blob blob-cyan bottom-[10%] right-[-5%]"></div>
                <div className="blob top-[40%] left-[30%]"></div>

                <ClientLayoutWrapper>
                    {children}
                </ClientLayoutWrapper>
            </body>
        </html>
    );
}
