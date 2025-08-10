"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../../lib/api"

export default function ClassroomHomeworks() {
  const [homeworks, setHomeworks] = useState([])
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState(null) // 'tutor' or 'student'
  const router = useRouter()
  const params = useParams()
  const classroomId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    const user = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    const loadData = async () => {
      try {
        // Load classroom details first
        const classroomData = await api.classroom.get(classroomId, token)
        setClassroom(classroomData)

        // Determine user role
        if (user && classroomData.tutor.username === user.username) {
          setUserRole("tutor")
        } else {
          setUserRole("student")
        }

        // Load homeworks for this classroom
        const homeworksData = await api.homeworks.getByClassroom(classroomId, token)
        console.log("Classroom homeworks data:", homeworksData) // Debug log
        setHomeworks(Array.isArray(homeworksData) ? homeworksData : [])
      } catch (error) {
        console.error("Failed to load classroom homeworks:", error)
        if (
          error.message.includes("Not tutor of this classroom") ||
          error.message.includes("Not student of this classroom")
        ) {
          setError("You don't have permission to view homeworks for this classroom.")
        } else if (error.message.includes("Classroom not found")) {
          setError("Classroom not found.")
        } else {
          setError("Failed to load homeworks: " + error.message)
        }
        setHomeworks([])
      } finally {
        setLoading(false)
      }
    }

    if (classroomId) {
      loadData()
    }
  }, [router, classroomId])

  const getSubjectName = (subject) => {
    const subjects = {
      MATH: "Mathematics",
      ENGLISH: "English",
      OTHER: "Other",
    }
    return subjects[subject] || subject
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const getDaysUntilDue = (dateString) => {
    if (!dateString) return null
    try {
      const dueDate = new Date(dateString)
      const now = new Date()
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const getDueDateStatus = (dateString) => {
    const days = getDaysUntilDue(dateString)
    if (days === null) return { text: "", color: "text-gray-500" }
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: "text-red-600" }
    if (days === 0) return { text: "Due today", color: "text-red-500" }
    if (days === 1) return { text: "Due tomorrow", color: "text-orange-500" }
    if (days <= 3) return { text: `Due in ${days} days`, color: "text-orange-500" }
    if (days <= 7) return { text: `Due in ${days} days`, color: "text-yellow-600" }
    return { text: `Due in ${days} days`, color: "text-green-600" }
  }

  const getAttachmentName = (attachmentPath) => {
    if (!attachmentPath) return null
    return attachmentPath.split("/").pop()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classroom homeworks...</p>
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
            <Link href={`/classroom/${classroomId}`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Classroom
              </Button>
            </Link>
            <Link href="/classroom">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                All Classrooms
              </Button>
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

      {/* Classroom Homeworks */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-12">
          {classroom && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-2">{getSubjectName(classroom.subject)} - Homeworks</h1>
              <p className="text-xl text-gray-600">
                Classroom #{classroom.id} • {userRole === "tutor" ? "Tutor View" : "Student View"}
              </p>
              <div className="mt-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    userRole === "tutor" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userRole === "tutor" ? "👨‍🏫 Managing as Tutor" : "👨‍🎓 Viewing as Student"}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Tutor Actions */}
        {userRole === "tutor" && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Tutor Actions</h3>
                <p className="text-gray-600">Manage homework assignments for this classroom.</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/classroom/${classroomId}/homeworks/create`}>
                  <Button className="bg-black text-white hover:bg-gray-800">Create New Homework</Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                >
                  Grade Submissions
                </Button>
              </div>
            </div>
          </div>
        )}

        {homeworks.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Homeworks Yet</h2>
            <p className="text-gray-600 mb-8">
              {userRole === "tutor"
                ? "You haven't created any homework assignments for this classroom yet."
                : "Your tutor hasn't assigned any homework for this classroom yet."}
            </p>
            {userRole === "tutor" && (
              <Link href={`/classroom/${classroomId}/homeworks/create`}>
                <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  Create First Homework
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {homeworks.map((homework) => {
              const dueDateStatus = getDueDateStatus(homework.due_date)
              const attachmentName = getAttachmentName(homework.attachment)

              return (
                <div
                  key={homework.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black">{homework.title}</h3>
                        {homework.is_optional && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{homework.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Due Date</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(homework.due_date)}</p>
                      {dueDateStatus.text && (
                        <p className={`text-xs font-medium ${dueDateStatus.color}`}>{dueDateStatus.text}</p>
                      )}
                    </div>
                  </div>

                  {/* Attachment */}
                  {attachmentName && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">📎 Attachment:</span>
                        <a
                          href={`http://localhost:8000${homework.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:underline font-medium text-sm"
                        >
                          {attachmentName}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href={`/homeworks/${homework.id}`}>
                      <Button className="bg-black text-white hover:bg-gray-800">View Details</Button>
                    </Link>
                    {userRole === "student" && (
                      <Button
                        variant="outline"
                        className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                      >
                        Submit Work
                      </Button>
                    )}
                    {userRole === "tutor" && (
                      <>
                        <Button
                          variant="outline"
                          className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                        >
                          Edit Homework
                        </Button>
                        <Link href={`/classroom/${classroomId}/homeworks/${homework.id}/submissions`}>
                          <Button
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white bg-transparent"
                          >
                            View Submissions
                          </Button>
                        </Link>
                      </>
                    )}
                    {attachmentName && (
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                        onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Stats for Tutor */}
        {homeworks.length > 0 && userRole === "tutor" && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-black">{homeworks.length}</div>
              <div className="text-gray-600">Total Assignments</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{homeworks.filter((hw) => !hw.is_optional).length}</div>
              <div className="text-gray-600">Required</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{homeworks.filter((hw) => hw.is_optional).length}</div>
              <div className="text-gray-600">Optional</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">
                {
                  homeworks.filter((hw) => {
                    const days = getDaysUntilDue(hw.due_date)
                    return days !== null && days >= 0 && days <= 7
                  }).length
                }
              </div>
              <div className="text-gray-600">Due This Week</div>
            </div>
          </div>
        )}

        {/* Quick Stats for Student */}
        {homeworks.length > 0 && userRole === "student" && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-black">{homeworks.length}</div>
              <div className="text-gray-600">Total Assignments</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {homeworks.filter((hw) => getDaysUntilDue(hw.due_date) > 3).length}
              </div>
              <div className="text-gray-600">Upcoming</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">
                {
                  homeworks.filter((hw) => {
                    const days = getDaysUntilDue(hw.due_date)
                    return days !== null && days >= 0 && days <= 3
                  }).length
                }
              </div>
              <div className="text-gray-600">Due Soon</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {homeworks.filter((hw) => getDaysUntilDue(hw.due_date) < 0).length}
              </div>
              <div className="text-gray-600">Overdue</div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && homeworks.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">User Role: {userRole}</p>
            <p className="text-sm text-gray-600 mb-2">Classroom ID: {classroomId}</p>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(homeworks[0], null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
