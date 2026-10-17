import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar role={user.role} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
