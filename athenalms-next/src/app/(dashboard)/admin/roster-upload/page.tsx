"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface ProvisionedStudent {
  name: string;
  username: string;
  temporaryPassword: string;
  lrn: string;
}

interface RosterUploadResponse {
  success: boolean;
  message: string;
  totalRecordsInFile: number;
  successfulCount: number;
  failedCount: number;
  validationErrors: Array<{ row: number; field?: string; message: string }>;
  creationErrors: Array<{ lrn: string; error: string }>;
  students: ProvisionedStudent[];
}

export default function RosterUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<RosterUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/roster-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Roster upload failed");
        setUploading(false);
        return;
      }

      setResult(data);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roster Batch Provisioning</h1>
        <p className="text-sm text-muted-foreground">
          Bulk-import students from an Excel (.xlsx) or CSV file. Automatically generates student accounts, links sections, and assigns default passwords with mandatory first-login password changes.
        </p>
      </div>

      {/* Upload Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Select Roster File</CardTitle>
          <CardDescription>
            Required columns in spreadsheet: <strong>LRN</strong>, <strong>FirstName</strong>, <strong>LastName</strong>, <strong>Section</strong>, optional <strong>Email</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">
                {file ? file.name : "Click to select or drag and drop Excel / CSV file"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .xlsx, .xls, .csv (Max 10MB)
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
            disabled={!file || uploading}
          >
            Clear
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Roster...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Students
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results View */}
      {result && (
        <Card className="border-success">
          <CardHeader className="border-b-2 border-border bg-success/10 pb-4">
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-base font-semibold">
                Import Complete: {result.successfulCount} Account(s) Provisioned
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Initial password for all newly created students has been set to their 12-digit LRN. They will be forced to choose a new password upon first login.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Assigned Username</TableHead>
                  <TableHead>LRN</TableHead>
                  <TableHead>Initial Password</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.students.map((s: ProvisionedStudent, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-sm">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.username}</TableCell>
                    <TableCell className="font-mono text-xs">{s.lrn}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.temporaryPassword}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success" className="text-[10px]">
                        Created (Must Change PW)
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
