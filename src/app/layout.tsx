import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import { auth } from "@/lib/auth";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await cookies();
  const session = await auth();
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

        <SessionProviderWrapper session={session}>
          {children}
        </SessionProviderWrapper>

        <Analytics />
      </body>
    </html>
  );
}
