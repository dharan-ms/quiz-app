"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "../ui/Button";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm transition ${
        active ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-slate-900">
          QuizForge
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavItem href="/quizzes" label="Quizzes" />
          <NavItem href="/leaderboard" label="Leaderboard" />
          {user ? <NavItem href="/profile" label="Profile" /> : null}
          {user?.role === "ADMIN" ? <NavItem href="/admin" label="Admin" /> : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
