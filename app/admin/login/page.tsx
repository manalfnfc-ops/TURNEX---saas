"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin/onboarding");
    router.refresh();
  }

  return (
    <main className="max-w-sm mx-auto mt-24 px-4">
      <p className="eyebrow mb-2">MANALF</p>
      <h1 className="font-display text-3xl font-semibold mb-1 text-white">TURNEX</h1>
      <p className="text-muted text-sm mb-8">Panel del negocio</p>
      <form onSubmit={handleLogin} className="space-y-3" autoComplete="off">
        <input className="input" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
        <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
