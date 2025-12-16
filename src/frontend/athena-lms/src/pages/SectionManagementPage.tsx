"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSections, createSection, getAllTeachers, type Section, type Teacher } from "../services/api"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Plus, School, Users, GraduationCap } from "lucide-react"

const SectionManagementPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [newSectionName, setNewSectionName] = useState("")
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
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
      const [fetchedSections, fetchedTeachersRes] = await Promise.all([
        getSections(),
        getAllTeachers(0, 100)
      ])
      setSections(fetchedSections)
      setTeachers(fetchedTeachersRes.content)
    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSection(
        { name: newSectionName },
        selectedTeacherId === "" || selectedTeacherId === "unassigned" ? undefined : Number(selectedTeacherId)
      )
      setNewSectionName("")
      setSelectedTeacherId("")
      setSuccess("Section created successfully")
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError("Failed to create section")
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Section Management</h1>
              <p className="text-indigo-100 text-lg max-w-xl">
                Create class sections and assign advisers to organize students.
              </p>
            </div>
            <div className="hidden md:block opacity-80">
              <School className="h-24 w-24 text-white/20" />
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
          {/* Create Section Sidebar/Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Create Section
                </CardTitle>
                <CardDescription>Add a new class section group.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSection} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sectionName">Section Name</Label>
                    <Input
                      id="sectionName"
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      required
                      placeholder="e.g. Grade 10 - Newton"
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adviser">Class Adviser (Optional)</Label>
                    <Select
                      value={selectedTeacherId}
                      onValueChange={setSelectedTeacherId}
                    >
                      <SelectTrigger id="adviser" className="bg-white dark:bg-slate-950">
                        <SelectValue placeholder="Select Adviser" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List Sections Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Existing Sections</CardTitle>
                    <CardDescription>Directory of all class sections.</CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <School className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    Loading sections...
                  </div>
                ) : sections.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <School className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground font-medium">No sections found.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Section Name</TableHead>
                          <TableHead>Adviser</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sections.map((section) => (
                          <TableRow key={section.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground">#{section.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                                  <Users className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{section.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {section.adviserName ? (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-3 w-3 text-indigo-500" />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{section.adviserName}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">Unassigned</span>
                              )}
                            </TableCell>
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

export default SectionManagementPage
