import type { Metadata } from "next";
import { getLocale } from "@/lib/locale-server";
import { LocaleProvider } from "./components/LocaleProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu",
  description: "Digital restaurant menus",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
