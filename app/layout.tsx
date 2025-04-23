import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ConfigureAmplify from "./amplify-config";

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
      <body className="bg-gray-50 text-gray-900 mt-24">
        <ConfigureAmplify />
        <AuthProvider>
          {/* TODO: Add a header and navigation bar here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
