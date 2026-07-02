import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import ClientLayout from "./layout-client";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "Stilldo — مدير المهام",
  description:
    "A calm productivity app for managing tasks, habits and focus sessions.",
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
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="h-full"
        style={{
          fontFamily:
            "var(--font-cairo), system-ui, sans-serif",
        }}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily:
                "var(--font-cairo), sans-serif",
              fontSize: "14px",
            },
          }}
        />

        <ClientLayout>{children}</ClientLayout>

        <Analytics />
      </body>
    </html>
  );
}
