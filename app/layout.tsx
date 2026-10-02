import type { Metadata, Viewport } from "next";
import { Figtree, Plus_Jakarta_Sans } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { uiLangFromNative } from "@/lib/i18n/t";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/auth";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lingoleaf",
  description: "Lectura interactiva y vocabulario con repetición espaciada, gratis.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#14181C",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  let uiLang: 'es' | 'en' = 'es';
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('native_language')
      .eq('id', userId)
      .single();
    uiLang = uiLangFromNative(profile?.native_language);
  }

  return (
    <html
      lang={uiLang}
      className={`${figtree.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider uiLang={uiLang}>{children}</I18nProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
