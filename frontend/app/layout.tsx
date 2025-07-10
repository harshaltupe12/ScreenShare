import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserCircleIcon, MicrophoneIcon, VideoCameraIcon, ShareIcon, FaceSmileIcon, ChatBubbleLeftRightIcon, HandRaisedIcon, EllipsisHorizontalIcon, PhoneXMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "jerry - AI Meeting Assistant",
  description: "AI-powered real-time meeting assistant with screen sharing and voice interaction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
