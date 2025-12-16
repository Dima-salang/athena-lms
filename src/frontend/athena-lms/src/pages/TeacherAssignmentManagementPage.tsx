"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    getAllTeacherAssignments,
    createTeacherAssignment,
    deleteTeacherAssignment,
    getAllTeachers,
    getSections,
    getSubjects,
    type TeacherAssignment,
    type Teacher,
    type Section,
    type Subject
} from "../services/api"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Plus, School, Trash2, Users, BookOpen } from "lucide-react"

const TeacherAssignmentManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [sections, setSections] = useState<Section[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newAssignment, setNewAssignment] = useState<{
        teacherId: string;
        sectionId: string;
        subjectId: string;
    }>({
        teacherId: "",
        sectionId: "",
        subjectId: "",
    })

    useEffect(() => {
        fetchData()
    }, [currentPage]) // Refetch when page changes

    const fetchData = async () => {
        setLoading(true)
        try {
            const [assignmentsRes, teachersRes, sectionsData, subjectsData] = await Promise.all([
                getAllTeacherAssignments(currentPage, pageSize),
                getAllTeachers(0, 100), // Get first 100 teachers for dropdown
                getSections(),
                getSubjects(),
            ])
            setAssignments(assignmentsRes.content)
            setTotalPages(assignmentsRes.page.totalPages)

            setTeachers(teachersRes.content) // Extract content from PaginatedResponse
            setSections(sectionsData)
            setSubjects(subjectsData)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch data", err)
            setError("Failed to load data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!newAssignment.teacherId || !newAssignment.sectionId || !newAssignment.subjectId) {
            setError("Please select teacher, section, and subject.")
            return
        }

        try {
            const teacher = teachers.find(t => t.id === Number(newAssignment.teacherId))
            const section = sections.find(s => s.id === Number(newAssignment.sectionId))
            const subject = subjects.find(s => s.id === Number(newAssignment.subjectId))

            if (!teacher || !section || !subject) {
                setError("Invalid selection.")
                return
            }

            await createTeacherAssignment({
                teacher,
                section,
                subject
            })

            setSuccess("Teacher assignment created successfully!")
            setNewAssignment({ teacherId: "", sectionId: "", subjectId: "" })
            setShowCreateModal(false)
            fetchData()

            setTimeout(() => setSuccess(null), 3000)
        } catch (err: any) {
            console.error("Failed to create assignment", err)
            // Check if the error response has a message from the backend (e.g. "Teacher assignment already exists")
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message)
            } else if (err.response && err.response.status === 409) { // Conflict
                setError("Teacher assignment already exists.")
            } else {
                setError("Failed to create assignment. It might already exist.")
            }
        }
    }

    const handleDeleteAssignment = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this assignment?")) return

        try {
            await deleteTeacherAssignment(id)
            setSuccess("Assignment removed successfully")
            // Refresh data to keep pagination correct
            fetchData()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error("Failed to delete assignment", err)
            setError("Failed to remove assignment.")
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Teacher Assignments</h1>
                        <p className="text-muted-foreground mt-1">Manage which teachers handle specific subjects and sections.</p>
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
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="space-y-1">
                                <CardTitle>Current Assignments</CardTitle>
                                <CardDescription>
                                    List of all active teacher assignments.
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Teacher
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                Loading...
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No teacher assignments found.</p>
                                <Button variant="link" onClick={() => setShowCreateModal(true)} className="mt-2">
                                    Create your first assignment
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Teacher</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Section</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                            {assignment.subject?.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <School className="h-4 w-4 text-muted-foreground" />
                                                            {assignment.section?.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Remove</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Page {currentPage + 1} of {totalPages}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Teacher</DialogTitle>
                        <DialogDescription>
                            Assign a teacher to a subject and section.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="teacher">Teacher</Label>
                            <Select
                                value={newAssignment.teacherId}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, teacherId: value })}
                            >
                                <SelectTrigger id="teacher">
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.firstName} {t.lastName} ({t.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Select
                                value={newAssignment.subjectId}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, subjectId: value })}
                            >
                                <SelectTrigger id="subject">
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section">Section</Label>
                            <Select
                                value={newAssignment.sectionId}
                                onValueChange={(value) => setNewAssignment({ ...newAssignment, sectionId: value })}
                            >
                                <SelectTrigger id="section">
                                    <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Assign</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TeacherAssignmentManagementPage
