"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsers, deleteUser, updateUser, type User } from "../services/api"

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

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <button
                        onClick={() => navigate("/admin")}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {success}
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {(["ALL", "TEACHER", "STUDENT", "ADMIN"] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilter(role)}
                                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === role
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {role === "ALL" ? "All Users" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                            </button>
                        ))}
                    </div>

                    <div className="w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-slate-600">
                        No users found matching your criteria.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {user.firstName} {user.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 0}
                                className={`px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium transition ${currentPage === 0
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-600">
                                Page <span className="font-semibold text-slate-900">{currentPage + 1}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                                className={`px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium transition ${currentPage >= totalPages - 1
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </main>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Edit User</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={editingUser.firstName}
                                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={editingUser.lastName}
                                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            {/* Role Editing - Optional, can stay read-only or be editable */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={editingUser.role}
                                    disabled
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingUser(null)
                                    }}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagementPage
