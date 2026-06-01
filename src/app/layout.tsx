import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import ApolloWrapper from "@/lib/graphql/apollo-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "모여맵 MoyeMap - 내 주변 소셜 모임을 한눈에",
  description: "소셜 파티, 게스트하우스 파티, 혼술바 정보를 네이버 지도로 한눈에 비교하세요.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-57x57.png",   sizes: "57x57" },
      { url: "/icons/apple-icon-60x60.png",   sizes: "60x60" },
      { url: "/icons/apple-icon-72x72.png",   sizes: "72x72" },
      { url: "/icons/apple-icon-76x76.png",   sizes: "76x76" },
      { url: "/icons/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/icons/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      { rel: "msapplication-TileImage", url: "/icons/ms-icon-144x144.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-surface text-text font-sans overflow-hidden transition-colors duration-300">
        <ApolloWrapper>
          <ThemeProvider>
            {naverMapClientId && (
              <Script
                src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapClientId}`}
                strategy="beforeInteractive"
              />
            )}
            <div className="flex flex-col h-full">
              <Header />
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
