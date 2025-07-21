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
    student_usernames: [],
  })
  const [currentUsername, setCurrentUsername] = useState("")
  const [validatedStudents, setValidatedStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUsernameChange = (e) => {
    setCurrentUsername(e.target.value)
    setUsernameError("")
  }

  const checkAndAddStudent = async () => {
    if (!currentUsername.trim()) {
      setUsernameError("Please enter a username")
      return
    }

    if (formData.student_usernames.includes(currentUsername.trim())) {
      setUsernameError("Student already added")
      return
    }

    setCheckingUsername(true)
    setUsernameError("")

    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    try {
      const response = await api.classroom.checkStudent(currentUsername.trim(), token)

      // Add student to the list
      const newUsername = currentUsername.trim()
      setFormData((prev) => ({
        ...prev,
        student_usernames: [...prev.student_usernames, newUsername],
      }))

      // Store validated student info
      setValidatedStudents((prev) => [
        ...prev,
        {
          username: newUsername,
          student_id: response.student_id,
        },
      ])

      // Clear input
      setCurrentUsername("")
    } catch (err) {
      setUsernameError(err.message || "Student not found")
    } finally {
      setCheckingUsername(false)
    }
  }

  const removeStudent = (username) => {
    setFormData((prev) => ({
      ...prev,
      student_usernames: prev.student_usernames.filter((u) => u !== username),
    }))
    setValidatedStudents((prev) => prev.filter((s) => s.username !== username))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (formData.student_usernames.length === 0) {
      setError("Please add at least one student")
      setLoading(false)
      return
    }

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
        student_usernames: [],
      })
      setValidatedStudents([])

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      checkAndAddStudent()
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
            <label className="block text-sm font-medium text-black mb-2">Add Students by Username</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentUsername}
                onChange={handleUsernameChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter student username"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <Button
                type="button"
                onClick={checkAndAddStudent}
                disabled={checkingUsername || !currentUsername.trim()}
                className="bg-black text-white hover:bg-gray-800 px-6"
              >
                {checkingUsername ? "Checking..." : "Add"}
              </Button>
            </div>

            {usernameError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{usernameError}</p>
              </div>
            )}

            {/* Added Students List */}
            {formData.student_usernames.length > 0 && (
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-black mb-3">Added Students ({formData.student_usernames.length})</h4>
                <div className="space-y-2">
                  {formData.student_usernames.map((username) => (
                    <div key={username} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">@{username}</span>
                      <button
                        type="button"
                        onClick={() => removeStudent(username)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || formData.student_usernames.length === 0}
            className="w-full bg-black text-white hover:bg-gray-800 py-3"
          >
            {loading ? "Creating Classroom..." : "Create Classroom"}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-black mb-2">How to add students:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enter the student's username and click "Add"</li>
            <li>• The system will verify the student exists</li>
            <li>• You can add multiple students for group classes</li>
            <li>• Individual classes should have only one student</li>
            <li>• You must be registered as a tutor to create classrooms</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
