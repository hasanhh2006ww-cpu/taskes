import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientLayout from "./layout-client";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlex = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "My Taske — مدير المهام",
  description: "تطبيق إدارة مهام بسيط وسريع للحاسوب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${ibmPlex.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full" style={{ fontFamily: 'var(--font-ibm-plex), var(--font-cairo), system-ui, sans-serif' }}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'var(--font-ibm-plex), var(--font-cairo), sans-serif', fontSize: '14px' },
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
