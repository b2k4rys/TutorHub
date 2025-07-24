"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../lib/api"

export default function ClassroomDetail() {
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const classroomId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadClassroom = async () => {
      try {
        const classroomData = await api.classroom.get(classroomId, token)
        console.log("Classroom detail data:", classroomData) // Debug log
        setClassroom(classroomData)
      } catch (error) {
        console.error("Failed to load classroom:", error)
        setError("Failed to load classroom details: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    if (classroomId) {
      loadClassroom()
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

  const getClassroomTypeName = (type) => {
    const types = {
      individual: "Individual (1-on-1)",
      group: "Group Class",
    }
    return types[type] || type
  }

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "N/A"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classroom details...</p>
        </div>
      </div>
    )
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-black">
              TutorHub
            </Link>
            <Link href="/classroom">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Classrooms
              </Button>
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-black mb-4">Classroom Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The requested classroom could not be found."}</p>
          <Link href="/classroom">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Classrooms</Button>
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
                Back to Classrooms
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

      {/* Classroom Details */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">{getSubjectName(classroom.subject)}</h1>
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    classroom.classroom_type === "individual"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {getClassroomTypeName(classroom.classroom_type)}
                </span>
                <span className="text-gray-600">Classroom ID: #{classroom.id}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-black text-white hover:bg-gray-800">Edit Classroom</Button>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Add Students
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tutor Information */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">👨‍🏫</span>
                Tutor Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-black">{getFullName(classroom.tutor.first_name, classroom.tutor.last_name)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Username</p>
                  <p className="text-black">@{classroom.tutor.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tutor ID</p>
                  <p className="text-black">#{classroom.tutor.id}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full border-black text-black hover:bg-black hover:text-white bg-transparent"
                >
                  View Profile
                </Button>
              </div>
            </div>

            {/* Classroom Stats */}
            <div className="border border-gray-200 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Students</span>
                  <span className="font-bold text-black">{classroom.students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classroom Type</span>
                  <span className="font-bold text-black">{getClassroomTypeName(classroom.classroom_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-bold text-black">{getSubjectName(classroom.subject)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <span className="mr-2">👥</span>
                  Students ({classroom.students.length})
                </h2>
                <Button className="bg-black text-white hover:bg-gray-800">Manage Students</Button>
              </div>

              {classroom.students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-bold text-black mb-2">No Students Enrolled</h3>
                  <p className="text-gray-600 mb-4">Add students to start your classroom.</p>
                  <Button className="bg-black text-white hover:bg-gray-800">Add First Student</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {classroom.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">
                          {(student.first_name?.[0] || student.username?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-black">{getFullName(student.first_name, student.last_name)}</h3>
                          <p className="text-gray-600">@{student.username}</p>
                          <p className="text-sm text-gray-500">Student ID: #{student.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-bold text-black mb-2">Assignments</h3>
                <p className="text-gray-600 text-sm mb-4">Create and manage assignments for this classroom.</p>
                <Button className="bg-black text-white hover:bg-gray-800 w-full">View Assignments</Button>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-bold text-black mb-2">Messages</h3>
                <p className="text-gray-600 text-sm mb-4">Communicate with students in this classroom.</p>
                <Button className="bg-black text-white hover:bg-gray-800 w-full">Open Chat</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(classroom, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
