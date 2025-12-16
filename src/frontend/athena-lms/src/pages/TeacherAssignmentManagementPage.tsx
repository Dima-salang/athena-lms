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
import { Badge } from "@/components/ui/badge"
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
import { ArrowLeft, Loader2, Plus, School, Trash2, BookOpen, GraduationCap, Briefcase } from "lucide-react"

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
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
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Teacher Assignments</h1>
                            <p className="text-indigo-100 text-lg max-w-xl">
                                Assign teachers to specific subjects and sections to manage workload.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-80">
                            <Briefcase className="h-24 w-24 text-white/20" />
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

                <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl">Assignments Directory</CardTitle>
                                <CardDescription className="mt-1">
                                    Manage existing academic assignments.
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 shadow-md">
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Teacher
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary/50 mb-4" />
                                <p>Loading assignments...</p>
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 pb-1">No assignments found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                                    Get started by creating the first teacher assignment.
                                </p>
                                <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                                    Create Assignment
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead>Teacher</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Section</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignments.map((assignment) => (
                                                <TableRow key={assignment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                                <GraduationCap className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                                    {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">@{assignment.teacher?.username}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-slate-700 dark:text-slate-300">{assignment.subject?.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <School className="h-4 w-4 text-muted-foreground" />
                                                            <Badge variant="outline" className="font-normal text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700">
                                                                {assignment.section?.name}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

                                <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page <span className="font-medium text-foreground">{currentPage + 1}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="h-8"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                            className="h-8"
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
                            Create a new academic assignment connection.
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
                                            {t.firstName} {t.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select
                                    value={newAssignment.subjectId}
                                    onValueChange={(value) => setNewAssignment({ ...newAssignment, subjectId: value })}
                                >
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select Subject" />
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
                                        <SelectValue placeholder="Select Section" />
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
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button type="submit">Create Assignment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TeacherAssignmentManagementPage
