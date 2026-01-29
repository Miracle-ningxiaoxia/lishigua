import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navigation from "@/components/ui/Navigation";
import AppProvider from "@/components/providers/AppProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from 'sonner';

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
  description: "时光快递驿站 - 记录我们珍贵回忆的数字避风港",
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
        <AuthProvider>
          <CustomCursor />
          <AppProvider>
            <Navigation />
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </AppProvider>
          {/* Toast 通知 - 玻璃拟态风格 */}
          <Toaster 
            position="top-right" 
            expand={true}
            richColors
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
              className: 'sonner-toast',
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
