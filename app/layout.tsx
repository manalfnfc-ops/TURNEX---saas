import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turnex — Agenda de citas sin fricción",
  description: "Sistema de agendamiento para barberías y salones de uñas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-base text-[#ECE4D6] font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
