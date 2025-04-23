import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ConfigureAmplify from "./amplify-config";
import Navigation from "./components/Navigation";

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
      <body className="bg-gray-50 text-gray-900">
        <ConfigureAmplify />
        <AuthProvider>
          <Navigation />
          <main className="mt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
