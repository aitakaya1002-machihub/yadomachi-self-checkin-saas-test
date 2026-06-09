import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "宿まちチェックイン",
  description: "一棟貸し宿向けセルフチェックインSaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
