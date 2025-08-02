"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../lib/api"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all") // all, name, username, classroom
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadStudents = async () => {
      try {
        const studentsData = await api.students.getAllForTutor(token)
        console.log("All tutor students data:", studentsData) // Debug log
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (error) {
        console.error("Failed to load students:", error)
        if (error.message.includes("Not found tutor")) {
          setError("You must be registered as a tutor to view students.")
        } else if (error.message.includes("not found classrooms")) {
          setError("You don't have any classrooms yet. Create a classroom to start teaching students.")
        } else {
          setError("Failed to load students: " + error.message)
        }
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [router])

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "N/A"
  }

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return (username?.[0] || "?").toUpperCase()
  }

  // Filter students based on search term and filter type
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const fullName = getFullName(student.first_name, student.last_name).toLowerCase()
    const username = student.username.toLowerCase()

    switch (filterBy) {
      case "name":
        return fullName.includes(searchLower)
      case "username":
        return username.includes(searchLower)
      case "all":
      default:
        return fullName.includes(searchLower) || username.includes(searchLower)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href="/classroom">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Classrooms
              </Button>
            </Link>
            <Link href="/classroom/create">
              <Button className="bg-black text-white hover:bg-gray-800">Create Classroom</Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Students Page */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">My Students</h1>
          <p className="text-xl text-gray-600">Manage and connect with all your students across classrooms</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes("classrooms") && (
              <div className="mt-4">
                <Link href="/classroom/create">
                  <Button className="bg-black text-white hover:bg-gray-800">Create Your First Classroom</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {students.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Students Yet</h2>
            <p className="text-gray-600 mb-8">Create classrooms and add students to start teaching!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/classroom/create">
                <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">Create Classroom</Button>
              </Link>
              <Link href="/classroom">
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white px-8 py-3 text-lg bg-transparent"
                >
                  View Classrooms
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">Search All</option>
                  <option value="name">Search by Name</option>
                  <option value="username">Search by Username</option>
                </select>
              </div>
            </div>

            {/* Students Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-black">{students.length}</div>
                <div className="text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredStudents.length}</div>
                <div className="text-gray-600">Filtered Results</div>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {students.filter((s) => s.first_name && s.last_name).length}
                </div>
                <div className="text-gray-600">Complete Profiles</div>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">
                  {students.filter((s) => s.phone || s.telegram_username).length}
                </div>
                <div className="text-gray-600">With Contact Info</div>
              </div>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-black mb-2">No Students Found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {getInitials(student.first_name, student.last_name, student.username)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-black text-lg">
                          {getFullName(student.first_name, student.last_name)}
                        </h3>
                        <p className="text-gray-600">@{student.username}</p>
                        <p className="text-sm text-gray-500">ID: #{student.id}</p>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-2 mb-4">
                      {student.school_name && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">🏫</span>
                          <span className="text-gray-700">{student.school_name}</span>
                        </div>
                      )}
                      {student.grade && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">📚</span>
                          <span className="text-gray-700">Grade {student.grade}</span>
                        </div>
                      )}
                      {student.phone && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">📞</span>
                          <span className="text-gray-700">{student.phone}</span>
                        </div>
                      )}
                      {student.telegram_username && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">💬</span>
                          <span className="text-gray-700">@{student.telegram_username}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/student/${student.id}`} className="flex-1">
                        <Button className="w-full bg-black text-white hover:bg-gray-800">View Profile</Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex-1 border-black text-black hover:bg-black hover:text-white bg-transparent"
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bulk Actions */}
            {filteredStudents.length > 0 && (
              <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-bold text-black mb-4">Bulk Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                  >
                    Export Student List
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white bg-transparent"
                  >
                    Send Group Message
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white bg-transparent"
                  >
                    Create Group Assignment
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && students.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Total Students: {students.length}</p>
            <p className="text-sm text-gray-600 mb-2">Filtered Students: {filteredStudents.length}</p>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(students[0], null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
