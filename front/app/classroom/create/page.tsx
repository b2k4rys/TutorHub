"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../../lib/api"

export default function CreateClassroom() {
  const [formData, setFormData] = useState({
    subject: "",
    classroom_type: "",
    students: [],
  })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingStudents, setLoadingStudents] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    // Load available students
    const loadStudents = async () => {
      try {
        const studentsData = await api.students.list(token)
        setStudents(studentsData)
      } catch (error) {
        console.error("Failed to load students:", error)
        setStudents([]) // Set empty array if API fails
      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudents()
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name === "students") {
      const studentId = Number.parseInt(value)
      setFormData((prev) => ({
        ...prev,
        students: checked ? [...prev.students, studentId] : prev.students.filter((id) => id !== studentId),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    try {
      const response = await api.classroom.create(formData, token)
      setSuccess("Classroom created successfully!")

      // Reset form
      setFormData({
        subject: "",
        classroom_type: "",
        students: [],
      })

      // Redirect to classrooms list after 2 seconds
      setTimeout(() => {
        router.push("/classroom")
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to create classroom. Please try again.")
    } finally {
      setLoading(false)
    }
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
                My Classrooms
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

      {/* Create Classroom Form */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create New Classroom</h1>
          <p className="text-gray-600">Set up a new classroom for your students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select a subject</option>
              <option value="MATH">Mathematics</option>
              <option value="ENGLISH">English</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="classroom_type" className="block text-sm font-medium text-black mb-2">
              Classroom Type
            </label>
            <select
              id="classroom_type"
              name="classroom_type"
              required
              value={formData.classroom_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select classroom type</option>
              <option value="individual">Individual (1-on-1)</option>
              <option value="group">Group Class</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Select Students</label>
            {loadingStudents ? (
              <div className="p-4 text-center text-gray-500">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No students available. Students need to register first.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      name="students"
                      value={student.id}
                      checked={formData.students.includes(student.id)}
                      onChange={handleChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-700">
                      {student.user?.first_name} {student.user?.last_name} ({student.user?.username})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || formData.students.length === 0}
            className="w-full bg-black text-white hover:bg-gray-800 py-3"
          >
            {loading ? "Creating Classroom..." : "Create Classroom"}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-black mb-2">Note:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You must be registered as a tutor to create classrooms</li>
            <li>• Select at least one student for the classroom</li>
            <li>• Individual classrooms are for 1-on-1 tutoring</li>
            <li>• Group classrooms can have multiple students</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
