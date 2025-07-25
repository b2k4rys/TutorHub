"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../../../lib/api"

export default function CreateHomework() {
  const [classroom, setClassroom] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    attachment: null,
    is_optional: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userRole, setUserRole] = useState(null)
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

    const loadClassroom = async () => {
      try {
        const classroomData = await api.classroom.get(classroomId, token)
        setClassroom(classroomData)

        // Check if user is tutor of this classroom
        if (user && classroomData.tutor.username === user.username) {
          setUserRole("tutor")
        } else {
          setError("Only tutors can create homework assignments.")
          setTimeout(() => {
            router.push(`/classroom/${classroomId}/homeworks`)
          }, 3000)
        }
      } catch (error) {
        console.error("Failed to load classroom:", error)
        setError("Failed to load classroom details: " + error.message)
      }
    }

    if (classroomId) {
      loadClassroom()
    }
  }, [router, classroomId])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required")
      setLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      setLoading(false)
      return
    }

    if (!formData.due_date) {
      setError("Due date is required")
      setLoading(false)
      return
    }

    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    try {
      // Prepare form data for submission
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date,
        is_optional: formData.is_optional,
      }

      // Add attachment if provided
      if (formData.attachment) {
        submissionData.attachment = formData.attachment
      }

      // Use the new classroom-specific endpoint
      const response = await api.homeworks.create(classroomId, submissionData, token)
      setSuccess("Homework created and assigned to classroom successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        due_date: "",
        attachment: null,
        is_optional: false,
      })

      // Clear file input
      const fileInput = document.getElementById("attachment")
      if (fileInput) {
        fileInput.value = ""
      }

      // Redirect after success
      setTimeout(() => {
        router.push(`/classroom/${classroomId}/homeworks`)
      }, 2000)
    } catch (err) {
      if (err.message.includes("not found tutor")) {
        setError("You must be registered as a tutor to create homework assignments.")
      } else if (err.message.includes("not found such classroom")) {
        setError("Classroom not found or you don't have permission to assign homework to it.")
      } else {
        setError(err.message || "Failed to create homework. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const getSubjectName = (subject) => {
    const subjects = {
      MATH: "Mathematics",
      ENGLISH: "English",
      OTHER: "Other",
    }
    return subjects[subject] || subject
  }

  // Show loading or error states
  if (!classroom && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !classroom) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-black">
              TutorHub
            </Link>
            <Link href={`/classroom/${classroomId}/homeworks`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Homeworks
              </Button>
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href={`/classroom/${classroomId}/homeworks`}>
            <Button className="bg-black text-white hover:bg-gray-800">Back to Homeworks</Button>
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
            <Link href={`/classroom/${classroomId}/homeworks`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Homeworks
              </Button>
            </Link>
            <Link href={`/classroom/${classroomId}`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Classroom
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

      {/* Create Homework Form */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-2">Create New Homework</h1>
          {classroom && (
            <p className="text-xl text-gray-600">
              {getSubjectName(classroom.subject)} - Classroom #{classroom.id}
            </p>
          )}
          <div className="mt-4">
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              👨‍🏫 Tutor Mode
            </span>
          </div>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                  <span className="mr-2">📝</span>
                  Homework Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter homework title (e.g., Quadratic Equations Practice)"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-vertical"
                      placeholder="Provide detailed instructions for the homework assignment..."
                    />
                  </div>

                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-black mb-2">
                      Due Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="due_date"
                      name="due_date"
                      required
                      value={formData.due_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-black mb-2">
                      Attachment (Optional)
                    </label>
                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB)
                    </p>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="is_optional"
                      name="is_optional"
                      checked={formData.is_optional}
                      onChange={handleChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="is_optional" className="ml-3 text-sm text-black">
                      <span className="font-medium">Mark as Optional</span>
                      <p className="text-gray-600">
                        Optional assignments won't affect student grades but provide extra practice opportunities.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-black text-white hover:bg-gray-800 py-3">
                  {loading ? "Creating Homework..." : "Create Homework"}
                </Button>
                <Link href={`/classroom/${classroomId}/homeworks`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Classroom Info */}
            {classroom && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                  <span className="mr-2">🏫</span>
                  Classroom Info
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject</span>
                    <span className="font-medium text-black">{getSubjectName(classroom.subject)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classroom ID</span>
                    <span className="font-medium text-black">#{classroom.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium text-black">{classroom.students?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-black">
                      {classroom.classroom_type === "individual" ? "Individual" : "Group"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Tips
              </h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Write clear, specific instructions</li>
                <li>• Set realistic due dates</li>
                <li>• Include helpful attachments when needed</li>
                <li>• Use optional assignments for extra practice</li>
                <li>• Consider your students' skill levels</li>
              </ul>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">👀</span>
                Preview
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-black mb-2">
                  {formData.title || "Homework Title"}
                  {formData.is_optional && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Optional</span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {formData.description || "Homework description will appear here..."}
                </p>
                {formData.due_date && (
                  <p className="text-xs text-gray-500">
                    Due:{" "}
                    {new Date(formData.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {formData.attachment && <p className="text-xs text-gray-500 mt-1">📎 {formData.attachment.name}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
