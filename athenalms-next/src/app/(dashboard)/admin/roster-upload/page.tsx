"use client";

import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { RosterDropzone } from "@/components/admin/roster/RosterDropzone";
import { RosterImportResult } from "@/components/admin/roster/RosterImportResult";
import type { RosterUploadResponse } from "@/components/admin/roster/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function RosterUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<RosterUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/roster-upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The class list could not be imported.");
        toast.error(data.error || "The class list could not be imported.");
        return;
      }

      setResult(data as RosterUploadResponse);
      toast.success(
        `Import finished — ${data.successfulCount} account${
          data.successfulCount === 1 ? "" : "s"
        } created`
      );
    } catch {
      setError("Something went wrong while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/admin/roster-upload/template";
  };

  const exportCredentials = () => {
    window.location.href = "/api/admin/roster-upload/credentials";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Import students"
        description="Add a whole class at once from an Excel or CSV list. New students sign in with their LRN and change it at first sign-in."
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4" aria-hidden />
              Download template
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportCredentials}>
              <Download className="h-4 w-4" aria-hidden />
              Download passwords
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Choose the class list file</CardTitle>
          <CardDescription>
            Columns needed: <strong>LRN</strong>, <strong>FirstName</strong>,{" "}
            <strong>LastName</strong>, <strong>Section</strong> — and <strong>Email</strong> if
            you have it. Start from the template if you are unsure.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <RosterDropzone file={file} onFileChange={setFile} disabled={uploading} />

          {error ? <Alert variant="error">{error}</Alert> : null}
        </CardContent>

        <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setResult(null);
              setError(null);
            }}
            disabled={!file || uploading}
          >
            Clear
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Importing…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" aria-hidden />
                Import students
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <RosterImportResult result={result} onExportCredentials={exportCredentials} />
      ) : null}
    </div>
  );
}
