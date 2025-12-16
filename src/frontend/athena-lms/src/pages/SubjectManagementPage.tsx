"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSubjects, createSubject, type Subject } from "../services/api"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, BookOpen, Loader2, Plus, Library } from "lucide-react"

const SubjectManagementPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDescription, setNewSubjectDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const fetchedSubjects = await getSubjects()
      setSubjects(fetchedSubjects)
    } catch (err) {
      setError("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSubject({ name: newSubjectName, description: newSubjectDescription })
      setNewSubjectName("")
      setNewSubjectDescription("")
      setSuccess("Subject created successfully")
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError("Failed to create subject")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with decorative background */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-900 dark:to-indigo-900 text-white p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="text-indigo-100 hover:text-white hover:bg-white/10 pl-0 -ml-3 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subject Management</h1>
              <p className="text-indigo-100 text-lg max-w-xl">
                Organize your curriculum by managing subjects and topics.
              </p>
            </div>
            <div className="hidden md:block opacity-80">
              <Library className="h-24 w-24 text-white/20" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-600" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-600" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Subject Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New Subject
                </CardTitle>
                <CardDescription>Define a new subject area.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                      placeholder="e.g. Mathematics"
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSubjectDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSubjectDescription(e.target.value)}
                      required
                      placeholder="Brief description..."
                      rows={4}
                      className="resize-none bg-white dark:bg-slate-950"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List Subjects Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Subjects</CardTitle>
                    <CardDescription>Catalog of all active subjects.</CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    Loading subjects...
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Library className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground font-medium">No subjects found.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject) => (
                          <TableRow key={subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground">#{subject.id}</TableCell>
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">{subject.name}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{subject.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectManagementPage
