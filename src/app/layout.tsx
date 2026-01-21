import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navigation from "@/components/ui/Navigation";
import AppProvider from "@/components/providers/AppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "李事瓜粉丝后援团",
  description: "拾光纪 - 记录我们珍贵回忆的数字避风港",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased bg-black text-[#ededed]`}
      >
        <CustomCursor />
        <AppProvider>
          <Navigation />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AppProvider>
      </body>
    </html>
  );
}
