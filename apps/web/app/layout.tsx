import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "../src/shared/providers/query.provider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TM Calculator",
  description: "Tax Management Calculator with Client Scenarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
