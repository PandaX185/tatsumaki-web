import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tatsumaki Chat",
  description: "Realtime chatting app using Golang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
