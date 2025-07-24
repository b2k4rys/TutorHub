"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../lib/api"

export default function StudentDetail() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewerType, setViewerType] = useState(null) // 'tutor' or 'student'
  const router = useRouter()
  const params = useParams()
  const studentId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadStudentDetail = async () => {
      try {
        const studentData = await api.students.getDetail(studentId, token)
        console.log("Student detail data:", studentData) // Debug log
        setStudent(studentData)

        // Determine viewer type based on available fields
        if (studentData.school_name !== undefined || studentData.phone !== undefined) {
          setViewerType("tutor") // Full access - tutor view
        } else {
          setViewerType("student") // Limited access - student view
        }
      } catch (error) {
        console.error("Failed to load student details:", error)
        if (error.message.includes("No such classroom")) {
          setError("You don't have permission to view this student's details.")
        } else if (error.message.includes("not found such user")) {
          setError("Student not found.")
        } else {
          setError("Failed to load student details: " + error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      loadStudentDetail()
    }
  }, [router, studentId])

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "N/A"
  }

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return (username?.[0] || "?").toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-black">
              TutorHub
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-black mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The requested student could not be found."}</p>
          <Link href="/dashboard">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Dashboard</Button>
          </Link>
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

      {/* Student Details */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-black rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
            {getInitials(student.first_name, student.last_name, student.username)}
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">{getFullName(student.first_name, student.last_name)}</h1>
          <p className="text-xl text-gray-600">@{student.username}</p>
          {viewerType && (
            <div className="mt-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  viewerType === "tutor" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {viewerType === "tutor" ? "Tutor View - Full Access" : "Student View - Limited Access"}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Full Name</p>
                <p className="text-black">{getFullName(student.first_name, student.last_name)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Username</p>
                <p className="text-black">@{student.username}</p>
              </div>
              {viewerType === "tutor" && student.grade && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Grade</p>
                  <p className="text-black">{student.grade}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information - Only for Tutors */}
          {viewerType === "tutor" && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">📞</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                {student.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                    <p className="text-black">{student.phone}</p>
                  </div>
                )}
                {student.telegram_username && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telegram</p>
                    <p className="text-black">{student.telegram_username}</p>
                  </div>
                )}
                {!student.phone && !student.telegram_username && (
                  <p className="text-gray-500 italic">No contact information available</p>
                )}
              </div>
            </div>
          )}

          {/* Academic Information - Only for Tutors */}
          {viewerType === "tutor" && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">🏫</span>
                Academic Information
              </h2>
              <div className="space-y-4">
                {student.school_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">School</p>
                    <p className="text-black">{student.school_name}</p>
                  </div>
                )}
                {student.grade && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grade Level</p>
                    <p className="text-black">{student.grade}</p>
                  </div>
                )}
                {!student.school_name && !student.grade && (
                  <p className="text-gray-500 italic">No academic information available</p>
                )}
              </div>
            </div>
          )}

          {/* Limited Info Message for Students */}
          {viewerType === "student" && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">ℹ️</span>
                Classmate View
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You're viewing limited information about your classmate. Only basic details are available to protect
                  privacy.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Contact information and detailed academic records are only visible to tutors
                    for privacy and safety reasons.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {viewerType === "tutor" && (
            <>
              <Button className="bg-black text-white hover:bg-gray-800">Send Message</Button>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                View Progress
              </Button>
            </>
          )}
          {viewerType === "student" && <Button className="bg-black text-white hover:bg-gray-800">Send Message</Button>}
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Viewer Type: {viewerType}</p>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(student, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
