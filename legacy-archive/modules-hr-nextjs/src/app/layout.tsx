import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGroup ERP — Nhân Sự",
  description: "Module quản lý nhân sự của hệ thống SGROUP ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
