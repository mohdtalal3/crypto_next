export function BackLink({ href = "/tools", label = "All tools" }: { href?: string; label?: string }) {
  return <a className="btn ghost back-link" href={href}><span aria-hidden>←</span> {label}</a>;
}
