import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "../components/providers/store-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Maritime Desk - Denizcilik Sektöründe Güvenilir Ortağınız",
  description: "Maritime Desk - Denizcilik Sektöründe Güvenilir Ortağınız",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="tr">
      <body>
        <StoreProvider>
          <Toaster />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}