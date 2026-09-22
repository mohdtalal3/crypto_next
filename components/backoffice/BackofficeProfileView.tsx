import { date } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const text = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);

export function BackofficeProfileView({ data }: { data: JsonObject }) {
  const personal = record(data.personal);
  const credentials = record(data.credentials);
  const inviter = record(data.inviter);
  const rows: [string, React.ReactNode][] = [
    ["Backoffice ID", <span className="mono" key="id">{text(data.id)}</span>],
    ["Public ID", <span className="mono" key="public">#{text(data.prettyId)}</span>],
    ["Full name", `${text(personal.name, "")} ${text(personal.surname, "")}`.trim()],
    ["Country", text(personal.country).toUpperCase()],
    ["Birth date", text(personal.birthDate)],
    ["Email", text(credentials.email)],
    ["Nickname", text(credentials.nickname)],
    ["Phone", text(credentials.phone)],
    ["2FA (TOTP)", credentials.totpEnabled ? "Enabled" : "Disabled"],
    ["Member since", String(data.createdAt ?? "").slice(0, 10)],
    ["Blocked", data.blocked ? "Yes" : "No"],
    ["Deleted", data.deleted ? "Yes" : "No"],
    ["Inviter", `${text(inviter.name, "")} ${text(inviter.surname, "")}`.trim() || "—"],
    ["Inviter nickname", inviter.nickname ? `@${text(inviter.nickname)}` : "—"],
    ["Inviter pretty ID", <span className="mono" key="inviter">#{text(inviter.prettyId)}</span>],
    ["Inviter phone", text(inviter.phone)],
    ["Referral link", data.refLink ? <a href={String(data.refLink)} target="_blank" rel="noreferrer" key="link">{String(data.refLink)}</a> : "—"],
  ];
  return <>
    <section className="card profile">
      <div className="avatar">{personal.photo ? <img src={String(personal.photo)} alt=""/> : text(credentials.nickname ?? personal.name, "A")[0]?.toUpperCase()}</div>
      <div><h2>{text(credentials.nickname, `${text(personal.name)} ${text(personal.surname)}`.trim() || "Account")} {data.prettyId ? <span className="badge">#{text(data.prettyId)}</span> : null} <span className={credentials.totpEnabled ? "badge done" : "badge pending"}>{credentials.totpEnabled ? "2FA on" : "2FA off"}</span></h2><p className="subtitle">{text(credentials.email)}</p></div>
    </section>
    <section className="card table-card detail-table"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table></section>
  </>;
}
