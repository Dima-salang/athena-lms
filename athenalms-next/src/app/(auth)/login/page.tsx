"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Route to the right place based on the signed-in user.
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const user = await meRes.json();
        if (user.mustChangePassword) {
          router.push("/change-password");
        } else if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (user.role === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Can't reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon={GraduationCap}
      title="Athena LMS"
      description="Sign in to your account"
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="space-y-1.5">
            <Label htmlFor="username">Username or email</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New student?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthShell>
  );
}
