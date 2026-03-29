import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order System MVP",
  description: "Plataforma simple de toma y gestión de pedidos para local o restaurante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
