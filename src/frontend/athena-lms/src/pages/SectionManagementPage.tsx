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
import { ArrowLeft, Loader2, Plus, School } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Sections</h1>
            <p className="text-muted-foreground mt-1">Add and manage class sections and assign advisers.</p>
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
            <CardTitle>Add New Section</CardTitle>
            <CardDescription>Create a new section and optionally assign a class adviser.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSection} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="sectionName">Section Name</Label>
                <Input
                  id="sectionName"
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                  placeholder="e.g. Grade 10 - Newton"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="adviser">Class Adviser (Optional)</Label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger id="adviser">
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
              <Button type="submit" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Sections</CardTitle>
            <CardDescription>List of all class sections in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading...
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <School className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No sections found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Adviser</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium text-muted-foreground">#{section.id}</TableCell>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>
                          {section.adviserName ? (
                            <span className="text-primary font-medium">{section.adviserName}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
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
  )
}

export default SectionManagementPage
