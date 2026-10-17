import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RootPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "ADMIN") {
    redirect("/admin");
  } else if (role === "TEACHER") {
    redirect("/teacher");
  } else if (role === "STUDENT") {
    redirect("/student");
  }

  redirect("/login");
}
