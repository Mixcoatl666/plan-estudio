import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan de estudio",
  description: "Organiza tus tareas de estudio en un calendario.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
