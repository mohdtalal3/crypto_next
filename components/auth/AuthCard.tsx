import { PasswordInput } from "@/components/auth/PasswordInput";
export function AuthCard({ mode, error }: { mode: "login" | "signup"; error?: string }) {
  const signup = mode === "signup";
  return <main className="center"><section className="card auth-card"><img className="logo" src="/logo.png" alt="D.A.R.A." /><h1>Aurum Portal</h1><p className="subtitle">{signup ? "Create your account to open the dashboard." : "Log in to your dashboard."}</p>{error && <p className="alert">⚠️ {error}</p>}<form className="form-stack" action={`/api/auth/${mode}`} method="post"><input className="text-input" type="email" name="email" placeholder="you@example.com" required autoFocus /><PasswordInput /><button className="btn primary wide" type="submit">{signup ? "Create account" : "Log in"}</button></form><p className="divider">or</p><a className="btn ghost wide" href={signup ? "/login" : "/signup"}>{signup ? "I already have an account" : "New here? Create an account"}</a></section></main>;
}
