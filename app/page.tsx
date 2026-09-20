import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthCard } from "@/components/auth/AuthCard";
export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) { if (await getSession()) redirect("/tools"); const { error } = await searchParams; return <AuthCard mode="login" error={error}/>; }
