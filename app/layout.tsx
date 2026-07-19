import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Solo - May the source be with me",
  description: "Official Code Solo site with App Store and privacy policy links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
