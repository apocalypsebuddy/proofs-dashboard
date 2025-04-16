import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pudding",
  description: "Dashboard for viewing and managing print proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-gray-50 text-gray-900"
      >
        {/* TODO: Add a header and navigation bar here */}
        {children}
      </body>
    </html>
  );
}
