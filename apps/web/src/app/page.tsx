import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 px-6 py-12 text-white">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-100">
          Production-ready Quiz Platform
        </p>
        <h1 className="mb-4 text-3xl font-bold md:text-5xl">Build, attempt, and rank in real-time quizzes</h1>
        <p className="mb-6 max-w-2xl text-indigo-100">
          QuizForge supports MCQ, True/False, and Fill-in-the-Blank quizzes with secure session auth, timed attempts,
          answer review, history, and an admin dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/quizzes" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700">
            Explore Quizzes
          </Link>
          <Link href="/register" className="rounded-md border border-white/60 px-4 py-2 text-sm font-semibold">
            Create Account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Secure by default",
            description: "Session-based auth with httpOnly cookies and role-based access control.",
          },
          {
            title: "Timer + auto submit",
            description: "Whole quiz timer with expiry handling and double-submit protection.",
          },
          {
            title: "Admin productivity",
            description: "CRUD for quizzes/questions, analytics insights, and audit trail support.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
