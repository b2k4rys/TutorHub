"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../lib/api"

export default function ClassroomList() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadClassrooms = async () => {
      try {
        const classroomsData = await api.classroom.list(token)
        console.log("Classrooms data:", classroomsData) // Debug log
        setClassrooms(classroomsData)
      } catch (error) {
        console.error("Failed to load classrooms:", error)
        if (error.message.includes("You are not a tutor")) {
          setError("You need to be registered as a tutor to view classrooms.")
        } else {
          setError("Failed to load classrooms: " + error.message)
        }
        setClassrooms([])
      } finally {
        setLoading(false)
      }
    }

    loadClassrooms()
  }, [router])

  const getSubjectName = (subject) => {
    const subjects = {
      MATH: "Mathematics",
      ENGLISH: "English",
      OTHER: "Other",
    }
    return subjects[subject] || subject
  }

  const getClassroomTypeName = (type) => {
    const types = {
      individual: "Individual (1-on-1)",
      group: "Group Class",
    }
    return types[type] || type
  }

  const getStudentNames = (students) => {
    if (!students || students.length === 0) return []

    // Handle different possible formats from the API
    return students.map((student) => {
      if (typeof student === "object" && student.user) {
        // Full student object with user data
        return `${student.user.first_name || ""} ${student.user.last_name || ""}`.trim() || student.user.username
      } else if (typeof student === "object" && student.username) {
        // Student object with username
        return student.username
      } else if (typeof student === "string") {
        // Just username string
        return student
      } else {
        // Fallback
        return "Unknown Student"
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classrooms...</p>
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

      {/* Classrooms List */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">My Classrooms</h1>
          <p className="text-xl text-gray-600">Manage your teaching sessions and students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes("tutor") && (
              <p className="text-red-600 text-sm mt-2">Please contact an administrator to register as a tutor.</p>
            )}
          </div>
        )}

        {classrooms.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Classrooms Yet</h2>
            <p className="text-gray-600 mb-8">Create your first classroom to start teaching!</p>
            <Link href="/classroom/create">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                Create Your First Classroom
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black">{getSubjectName(classroom.subject)}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      classroom.classroom_type === "individual"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {getClassroomTypeName(classroom.classroom_type)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Students:</span> {classroom.students?.length || 0}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Classroom ID:</span> #{classroom.id}
                  </p>
                </div>

                {classroom.students && classroom.students.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Enrolled Students:</p>
                    <div className="space-y-1">
                      {getStudentNames(classroom.students)
                        .slice(0, 3)
                        .map((studentName, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            • {studentName}
                          </p>
                        ))}
                      {classroom.students.length > 3 && (
                        <p className="text-sm text-gray-500">+{classroom.students.length - 3} more...</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/classroom/${classroom.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-black text-black hover:bg-black hover:text-white bg-transparent"
                    >
                      View Details
                    </Button>
                  </Link>
                  <Button className="flex-1 bg-black text-white hover:bg-gray-800">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && classrooms.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(classrooms[0], null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
