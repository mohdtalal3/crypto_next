"use client";

import { useState } from "react";

export function PasswordInput({ placeholder = "Password (min 8 characters)", autoFocus }: { placeholder?: string; autoFocus?: boolean }) {
  const [show, setShow] = useState(false);
  return <div className="password-field">
    <input className="text-input" type={show ? "text" : "password"} name="password" placeholder={placeholder} minLength={8} required autoFocus={autoFocus}/>
    <button className="password-toggle" type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
  </div>;
}
