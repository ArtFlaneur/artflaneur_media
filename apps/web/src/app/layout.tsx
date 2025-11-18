import type {Metadata} from "next";
import {Archivo} from "next/font/google";
import "./globals.css";
import {SiteHeader} from "@/components/layout/site-header";
import {SiteFooter} from "@/components/layout/site-footer";

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Art Flaneur",
  description:
    "Contemporary art reviews, guides, ambassadors, and partnerships powered by Art Flaneur.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} antialiased bg-surface-base text-text-primary`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
