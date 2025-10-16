import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "../components/providers/store-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Maritime Desk - Denizcilik Sektöründe Güvenilir Ortağınız",
  description: "Maritime Desk - Denizcilik Sektöründe Güvenilir Ortağınız",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <StoreProvider>
          <Toaster position="top-center" />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}