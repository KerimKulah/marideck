
import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "../components/providers/store-provider";

export const metadata: Metadata = {
  title: "K-Maritime - Denizcilik Sektöründe Güvenilir Ortağınız",
  description: "K-Maritime - Denizcilik Sektöründe Güvenilir Ortağınız",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="tr">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
