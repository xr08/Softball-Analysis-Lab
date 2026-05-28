import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Softball Analysis Lab",
  description: "Local-first softball batter tagging MVP"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
