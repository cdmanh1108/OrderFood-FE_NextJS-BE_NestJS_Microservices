import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Bún Đậu Làng Mơ",
  description: "Hệ thống order đồ ăn và quản lý quán Bún Đậu Làng Mơ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
