"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsers, deleteUser, updateUser, type User } from "../services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, Loader2, Edit, Trash2, ArrowLeft, UserCog, ShieldCheck, GraduationCap, Users } from "lucide-react"

const UserManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [filter, setFilter] = useState<"ALL" | "TEACHER" | "STUDENT" | "ADMIN">("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pageSize] = useState(100) // Default page size

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(0) // Reset to first page on search change
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(0)
    }, [filter])

    // Fetch users when dependencies change
    useEffect(() => {
        fetchUsers()
    }, [currentPage, filter, debouncedSearch])
    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            // Pass the filter, search, and pagination params to the backend
            const data = await getAllUsers(currentPage, pageSize, filter, debouncedSearch)
            setUsers(data.content)
            setTotalPages(data.page.totalPages)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch users", err)
            setError("Failed to load users.")
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, filter, debouncedSearch])

    // Fetch users when dependencies change
    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

        try {
            await deleteUser(id)
            setSuccess("User deleted successfully.")
            // Optimistically update local state just to remove the item from view
            setUsers(users.filter(u => u.id !== id))
            // Re-fetch to ensure sync with server pagination
            fetchUsers()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error("Failed to delete user", err)
            setError("Failed to delete user.")
        }
    }

    const handleEditClick = (user: User) => {
        setEditingUser(user)
        setShowEditModal(true)
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return

        try {
            await updateUser(editingUser)
            setSuccess("User updated successfully.")

            // Update local state and refetch
            setUsers(users.map(u => u.id === editingUser.id ? editingUser : u))
            fetchUsers()

            setShowEditModal(false)
            setEditingUser(null)
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error("Failed to update user", err)
            setError("Failed to update user.")
        }
    }

    // Pagination Handlers
    const handlePreviousPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1)
    }

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1)
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'default' // primary
            case 'TEACHER': return 'secondary' // secondary
            default: return 'outline' // student/others
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
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">User Management</h1>
                            <p className="text-indigo-100 text-lg max-w-xl">
                                Administer users, assign roles, and manage system access privileges.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-80">
                            <UserCog className="h-24 w-24 text-white/20" />
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
                                <CardTitle className="text-xl">Users Directory</CardTitle>
                                <CardDescription className="mt-1">
                                    Manage existing users and updated their information.
                                </CardDescription>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    {(["ALL", "TEACHER", "STUDENT", "ADMIN"] as const).map((role) => (
                                        <Button
                                            key={role}
                                            variant={filter === role ? "default" : "ghost"}
                                            onClick={() => setFilter(role)}
                                            size="sm"
                                            className={`rounded-md transition-all ${filter === role ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search users..."
                                        className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary/50 mb-4" />
                                <p>Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserCog className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 pb-1">No users found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    We couldn't find any users match your search or filter criteria.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead>User Profile</TableHead>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/50">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">ID: #{user.id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 py-1 px-2 rounded-md w-fit my-auto">
                                                        @{user.username}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.role === 'ADMIN' && (
                                                            <Badge variant="default" className="bg-slate-900 hover:bg-slate-800 gap-1 pl-1 pr-2">
                                                                <ShieldCheck className="h-3 w-3" /> Admin
                                                            </Badge>
                                                        )}
                                                        {user.role === 'TEACHER' && (
                                                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 gap-1 pl-1 pr-2">
                                                                <GraduationCap className="h-3 w-3" /> Teacher
                                                            </Badge>
                                                        )}
                                                        {user.role === 'STUDENT' && (
                                                            <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 gap-1 pl-1 pr-2">
                                                                <Users className="h-3 w-3" /> Student
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                onClick={() => handleEditClick(user)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                onClick={() => handleDelete(user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </div>
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
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 0}
                                            className="h-8"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
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

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>
                            Make changes to account details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={editingUser.firstName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={editingUser.lastName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                    <Input
                                        id="username"
                                        value={editingUser.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, username: e.target.value })}
                                        className="pl-7"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Assigned Role</Label>
                                <Input
                                    id="role"
                                    value={editingUser.role}
                                    disabled
                                    className="bg-muted text-muted-foreground font-mono text-xs uppercase"
                                />
                                <p className="text-[10px] text-muted-foreground">Role changes must be done by super-admin.</p>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UserManagementPage
