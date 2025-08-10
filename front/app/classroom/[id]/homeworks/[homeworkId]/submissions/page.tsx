"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../../../../lib/api"

export default function HomeworkSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [homework, setHomework] = useState(null)
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    graded: 0,
    pending: 0,
  })

  const router = useRouter()
  const params = useParams()
  const classroomId = params.id
  const homeworkId = params.homeworkId

  useEffect(() => {
    const token = storage.getAccessToken()
    const user = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    const loadData = async () => {
      try {
        // Load classroom details
        const classroomData = await api.classroom.get(classroomId, token)
        setClassroom(classroomData)

        // Check if user is tutor of this classroom
        if (!user || classroomData.tutor.username !== user.username) {
          setError("You don't have permission to view submissions for this classroom.")
          return
        }

        // Load homework details using the updated API
        const homeworkData = await api.homeworks.get(classroomId, homeworkId, token)
        setHomework(homeworkData)

        // Load submissions
        const submissionsData = await api.homeworks.getSubmissions(classroomId, homeworkId, token)
        console.log("Submissions data:", submissionsData)

        const submissionsArray = Array.isArray(submissionsData) ? submissionsData : []
        setSubmissions(submissionsArray)

        // Calculate stats
        const totalStudents = classroomData.students?.length || 0
        const submittedCount = submissionsArray.length
        const gradedCount = submissionsArray.filter((sub) => sub.grade !== null && sub.grade !== undefined).length
        const pendingCount = submittedCount - gradedCount

        setStats({
          total: totalStudents,
          submitted: submittedCount,
          graded: gradedCount,
          pending: pendingCount,
        })
      } catch (error) {
        console.error("Failed to load homework submissions:", error)
        setError("Failed to load submissions: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    if (classroomId && homeworkId) {
      loadData()
    }
  }, [router, classroomId, homeworkId])

  const formatDate = (dateString) => {
    if (!dateString) return "Not submitted"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const getSubmissionStatus = (submission) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return { text: "Graded", color: "bg-green-100 text-green-800" }
    }
    return { text: "Pending Review", color: "bg-yellow-100 text-yellow-800" }
  }

  const getGradeDisplay = (grade) => {
    if (grade === null || grade === undefined) return "Not graded"
    return `${grade}/100`
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
          <p className="text-gray-600">Loading homework submissions...</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Homework Submissions</h1>
            {homework && (
              <p className="text-xl text-gray-600 mb-4">
                {homework.title} • Classroom #{classroomId}
              </p>
            )}
            <div className="mt-4">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                👨‍🏫 Tutor View
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Homework Details */}
        {homework && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Homework Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Title</h3>
                  <p className="text-gray-600 mb-4">{homework.title}</p>

                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">{homework.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Due Date</h3>
                  <p className="text-gray-600 mb-4">{formatDate(homework.due_date)}</p>

                  <h3 className="font-semibold text-gray-800 mb-2">Type</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      homework.is_optional ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {homework.is_optional ? "Optional" : "Required"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-black">{stats.total}</div>
              <div className="text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
              <div className="text-gray-600">Graded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
              <div className="text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Submissions Yet</h2>
            <p className="text-gray-600">Students haven't submitted their work for this homework yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Student Submissions</h2>

            {submissions.map((submission) => {
              const status = getSubmissionStatus(submission)
              const attachmentName = getAttachmentName(submission.file_submission)

              return (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-black">
                            {submission.student?.first_name} {submission.student?.last_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">Username: {submission.student?.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Submitted</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(submission.submitted_at)}</p>
                      </div>
                    </div>

                    {/* Text Submission */}
                    {submission.text_submission && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Text Submission:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{submission.text_submission}</p>
                      </div>
                    )}

                    {/* File Submission */}
                    {attachmentName && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 text-sm">📎 File Submission:</span>
                          <a
                            href={`http://localhost:8000${submission.file_submission}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium text-sm"
                          >
                            {attachmentName}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Grade and Feedback */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Grade:</h4>
                        <p
                          className={`text-sm ${
                            submission.grade !== null ? "text-green-600 font-medium" : "text-gray-500"
                          }`}
                        >
                          {getGradeDisplay(submission.grade)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Feedback:</h4>
                        <p className="text-sm text-gray-600">{submission.feedback || "No feedback provided"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white bg-transparent"
                      >
                        Grade Submission
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      >
                        Provide Feedback
                      </Button>
                      {attachmentName && (
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                          onClick={() => window.open(`http://localhost:8000${submission.file_submission}`, "_blank")}
                        >
                          Download File
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Classroom ID: {classroomId}</p>
            <p className="text-sm text-gray-600 mb-2">Homework ID: {homeworkId}</p>
            <p className="text-sm text-gray-600 mb-2">Submissions Count: {submissions.length}</p>
            {submissions.length > 0 && (
              <pre className="text-xs text-gray-600 overflow-auto mt-2">{JSON.stringify(submissions[0], null, 2)}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
