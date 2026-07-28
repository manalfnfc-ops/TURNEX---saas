import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TURNEX — By MANALF",
  description: "Sistema de agendamiento de citas para cualquier negocio con turnos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-base text-[#ECE9F7] font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
