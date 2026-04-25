import { AuthProvider } from "@/context/auth-context";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Better Shop",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
