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
import { ArrowLeft, BookOpen, Loader2, Plus } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
            <p className="text-muted-foreground mt-1">Add and manage subjects for your tests.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add New Subject</CardTitle>
            <CardDescription>Create a new subject to categorize your tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                  placeholder="e.g. Mathematics, Physics, English"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSubjectDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSubjectDescription(e.target.value)}
                  required
                  placeholder="Provide a brief description of the subject..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Subjects</CardTitle>
            <CardDescription>List of all subjects available in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading...
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No subjects found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium text-muted-foreground">#{subject.id}</TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell className="text-muted-foreground">{subject.description}</TableCell>
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
  )
}

export default SubjectManagementPage
