"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionOption {
  id: string;
  name: string;
  adviserName?: string | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    lrn: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    sectionId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/shared/sections")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSections(data))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.lrn && !/^\d{12}$/.test(formData.lrn)) {
      setError("LRN must be exactly 12 numeric digits.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: "STUDENT",
          sectionId: formData.sectionId || undefined,
          lrn: formData.lrn,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Can't reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon={GraduationCap}
      title="Student registration"
      description="Create your account to take tests and see your results."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? (
            <Alert variant="success">
              Account created. Taking you to sign in…
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lrn">LRN (12 digits)</Label>
              <Input
                id="lrn"
                name="lrn"
                inputMode="numeric"
                placeholder="12-digit number"
                value={formData.lrn}
                onChange={(e) => handleChange("lrn", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="section">Class section</Label>
            <Select
              value={formData.sectionId}
              onValueChange={(val) => handleChange("sectionId", val)}
            >
              <SelectTrigger id="section">
                <SelectValue placeholder="Select your section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.name} {sec.adviserName ? `(${sec.adviserName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="student@school.edu.ph"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthShell>
  );
}
