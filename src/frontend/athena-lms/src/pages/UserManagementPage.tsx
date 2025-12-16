"use client"

import React, { useState, useEffect } from "react"
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
import { Search, Loader2, Edit, Trash2, ArrowLeft, UserCog } from "lucide-react"

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

    const fetchUsers = async () => {
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
    }

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
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage users, their roles, and system access.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/admin")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
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
                            <CardTitle>Users Directory</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex gap-2">
                                    {(["ALL", "TEACHER", "STUDENT", "ADMIN"] as const).map((role) => (
                                        <Button
                                            key={role}
                                            variant={filter === role ? "default" : "outline"}
                                            onClick={() => setFilter(role)}
                                            size="sm"
                                        >
                                            {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search users..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <CardDescription>
                            A list of all users in the system including their roles and actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-16 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                Loading...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                <UserCog className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No users found matching your criteria.</p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{user.firstName} {user.lastName}</div>
                                                        <div className="text-xs text-muted-foreground">ID: #{user.id}</div>
                                                    </TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getRoleBadgeVariant("default")}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditClick(user)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
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

                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Page {currentPage + 1} of {totalPages}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
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

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to the user's profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleUpdateUser}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="firstName" className="text-right">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={editingUser.firstName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lastName" className="text-right">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={editingUser.lastName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        value={editingUser.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingUser({ ...editingUser, username: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">
                                        Role
                                    </Label>
                                    <Input
                                        id="role"
                                        value={editingUser.role}
                                        disabled
                                        className="col-span-3 bg-muted"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UserManagementPage
