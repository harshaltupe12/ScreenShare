import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScreenShare.AI - AI Meeting Assistant",
  description:
    "AI-powered real-time meeting assistant with screen sharing and voice interaction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ConditionalNavbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
