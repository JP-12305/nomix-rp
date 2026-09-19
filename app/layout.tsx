import type { Metadata } from "next";
import { Rajdhani, Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import CyberBackground from "@/components/ui/CyberBackground";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-orbitron",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com"),
  title: "NOMIX Roleplay | Premium FiveM Community",
  description: "YOUR CITY. YOUR STORY. YOUR LEGACY. Experience the next generation of FiveM roleplay with custom economy, high-tier crime, and living urban stories.",
  keywords: ["FiveM", "GTA RP", "NOMIX RP", "Roleplay Server", "FiveM Whitelist", "Custom FiveM Economy"],
  openGraph: {
    title: "NOMIX Roleplay | Premium FiveM Community",
    description: "YOUR CITY. YOUR STORY. YOUR LEGACY. Join the whitelist today.",
    url: "https://nomixrp.com",
    siteName: "NOMIX Roleplay",
    images: [
      {
        url: "/logo/logo.png",
        width: 800,
        height: 800,
        alt: "NOMIX Roleplay Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${orbitron.variable} ${inter.variable} font-sans bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <AuthProvider>
          <CyberBackground />
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
