import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getLocale } from "@/lib/locale-server";
import { isTheme } from "@/lib/theme";
import { LocaleProvider } from "./components/LocaleProvider";
import "./globals.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

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
  const savedTheme = (await cookies()).get("theme")?.value;
  const theme = isTheme(savedTheme) ? savedTheme : "light";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} data-theme={theme} className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale} initialTheme={theme}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
