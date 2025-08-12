"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../../lib/api"

export default function SubmitHomework() {
  const [homework, setHomework] = useState(null)
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()
  const params = useParams()
  const homeworkId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    const user = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    // if (user && user.user_type !== "student") {
    //   setError("Only students can submit homework.")
    //   setLoading(false)
    //   return
    // }

    setUserRole(user?.user_type)

    const loadHomework = async () => {
      try {
        // Try to get homework details directly first
        try {
          const homeworkData = await api.homeworks.getById(homeworkId, token)
          setHomework(homeworkData)
        } catch (directError) {
          console.log("Direct homework fetch failed, searching through classrooms...")

          // Fallback: search through classrooms
          const classrooms = await api.classroom.list(token)
          let foundHomework = null
          let foundClassroom = null

          for (const classroom of classrooms) {
            try {
              const homeworks = await api.homeworks.getByClassroom(classroom.id, token)
              const homework = homeworks.find((hw) => hw.id.toString() === homeworkId)
              if (homework) {
                foundHomework = homework
                foundClassroom = classroom
                break
              }
            } catch (error) {
              console.log(`Failed to load homeworks for classroom ${classroom.id}:`, error)
            }
          }

          if (foundHomework) {
            setHomework(foundHomework)
            setClassroom(foundClassroom)
          } else {
            throw new Error("Homework not found")
          }
        }
      } catch (error) {
        console.error("Failed to load homework:", error)
        setError("Failed to load homework: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    loadHomework()
  }, [router, homeworkId])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setError("Please select a file to submit.")
      return
    }

    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      await api.homeworks.submit(homeworkId, formData, token)
      setSubmitSuccess(true)
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById("homework-file")
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (error) {
      console.error("Submission failed:", error)
      if (error.message.includes("already submitted")) {
        setError("You have already submitted this homework.")
      } else {
        setError("Failed to submit homework: " + error.message)
      }
    } finally {
      setSubmitting(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework...</p>
        </div>
      </div>
    )
  }

  if (error && !homework) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-black mb-4">Error</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const dueDateStatus = homework ? getDueDateStatus(homework.due_date) : null

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href={`/homeworks/${homeworkId}`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Homework
              </Button>
            </Link>
            {classroom && (
              <Link href={`/classroom/${classroom.id}/homeworks`}>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                >
                  Back to Classroom
                </Button>
              </Link>
            )}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {homework && (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-black mb-4">Submit Homework</h1>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">{homework.title}</h2>
                <p className="text-gray-600 mb-4">{homework.description}</p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-medium">{formatDate(homework.due_date)}</span>
                  </div>
                  {dueDateStatus?.text && (
                    <div className={`font-medium ${dueDateStatus.color}`}>{dueDateStatus.text}</div>
                  )}
                  {homework.is_optional && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Homework Submitted Successfully!</h3>
                    <p className="text-green-600">Your homework has been submitted and your tutor will review it.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submission Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-black mb-6">Upload Your Work</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="homework-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Select File to Submit
                  </label>
                  <input
                    type="file"
                    id="homework-file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800 border border-gray-300 rounded-lg p-3"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max size: 10MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📎</div>
                      <div>
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={!selectedFile || submitting}
                    className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-3"
                  >
                    {submitting ? "Submitting..." : "Submit Homework"}
                  </Button>

                  <Link href={`/homeworks/${homeworkId}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>

            {/* Homework Attachment */}
            {homework.attachment && (
              <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-bold text-black mb-4">Homework Materials</h3>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">📎 Attachment:</span>
                  <a
                    href={`http://localhost:8000${homework.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline font-medium"
                  >
                    {homework.attachment.split("/").pop()}
                  </a>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-3 py-1 bg-transparent"
                    onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
