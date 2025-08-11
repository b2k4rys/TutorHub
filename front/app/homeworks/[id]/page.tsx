"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../lib/api"

export default function HomeworkDetail() {
  const [homework, setHomework] = useState(null)
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
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

    const loadHomeworkDetails = async () => {
      try {
        // First, we need to find which classroom this homework belongs to
        // We'll get this from the homework data or we might need to modify the API
        // For now, let's try to get homework details and extract classroom info

        // Note: We might need to modify this based on your actual API structure
        // The current API structure suggests we need classroomId to get homework details
        // Let's try a different approach - get all classrooms and find the one with this homework

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
          } catch (err) {
            // Continue searching in other classrooms
            continue
          }
        }

        if (!foundHomework) {
          setError("Homework not found or you don't have permission to view it.")
          return
        }

        setHomework(foundHomework)
        setClassroom(foundClassroom)

        // Determine user role
        if (user && foundClassroom.tutor.username === user.username) {
          setUserRole("tutor")
        } else {
          setUserRole("student")
        }

        // Load comments
        await loadComments(foundClassroom.id, homeworkId, token)
      } catch (error) {
        console.error("Failed to load homework details:", error)
        setError("Failed to load homework details: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    if (homeworkId) {
      loadHomeworkDetails()
    }
  }, [router, homeworkId])

  const loadComments = async (classroomId, homeworkId, token) => {
    try {
      setCommentLoading(true)
      const commentsData = await api.homeworks.getComments(classroomId, homeworkId, token)
      setComments(Array.isArray(commentsData) ? commentsData : [])
    } catch (error) {
      console.error("Failed to load comments:", error)
      setComments([])
    } finally {
      setCommentLoading(false)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || !classroom) return

    try {
      setPostingComment(true)
      const token = storage.getAccessToken()

      await api.homeworks.postComment(classroom.id, homeworkId, { text: newComment.trim() }, token)

      // Reload comments
      await loadComments(classroom.id, homeworkId, token)
      setNewComment("")
    } catch (error) {
      console.error("Failed to post comment:", error)
      alert("Failed to post comment: " + error.message)
    } finally {
      setPostingComment(false)
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

  const getAttachmentName = (attachmentPath) => {
    if (!attachmentPath) return null
    return attachmentPath.split("/").pop()
  }

  const getSubjectName = (subject) => {
    const subjects = {
      MATH: "Mathematics",
      ENGLISH: "English",
      OTHER: "Other",
    }
    return subjects[subject] || subject
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework details...</p>
        </div>
      </div>
    )
  }

  if (error) {
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

  if (!homework || !classroom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-black mb-4">Homework Not Found</h2>
          <p className="text-gray-600 mb-8">
            The homework you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/dashboard">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const dueDateStatus = getDueDateStatus(homework.due_date)
  const attachmentName = getAttachmentName(homework.attachment)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href={`/classroom/${classroom.id}/homeworks`}>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Homeworks
              </Button>
            </Link>
            <Link href={`/classroom/${classroom.id}`}>
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
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-black">{homework.title}</h1>
            {homework.is_optional && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Optional</span>
            )}
          </div>
          <div className="flex items-center gap-6 text-gray-600">
            <span>
              {getSubjectName(classroom.subject)} • Classroom #{classroom.id}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                userRole === "tutor" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {userRole === "tutor" ? "👨‍🏫 Tutor View" : "👨‍🎓 Student View"}
            </span>
          </div>
        </div>

        {/* Homework Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          {/* Due Date Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">Due Date</h3>
                <p className="text-gray-800 font-medium">{formatDate(homework.due_date)}</p>
              </div>
              {dueDateStatus.text && (
                <div className="text-right">
                  <p className={`text-lg font-bold ${dueDateStatus.color}`}>{dueDateStatus.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{homework.description}</p>
            </div>
          </div>

          {/* Attachment Section */}
          {attachmentName && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">Attachment</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📎</span>
                    <div>
                      <p className="font-medium text-gray-800">{attachmentName}</p>
                      <p className="text-sm text-gray-600">Click to download</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                    onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {userRole === "student" && <Button className="bg-black text-white hover:bg-gray-800">Submit Work</Button>}
            {userRole === "tutor" && (
              <>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                >
                  Edit Homework
                </Button>
                <Link href={`/classroom/${classroom.id}/homeworks/${homework.id}/submissions`}>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white bg-transparent"
                  >
                    View Submissions
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-black mb-6">Discussion</h3>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {commentLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-500 text-lg">No comments yet. Start the discussion!</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">{comment.username}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          comment.user_type === "Tutor" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {comment.user_type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-black mb-3">Add a Comment</h4>
            <div className="flex gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide feedback..."
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={postingComment}
              />
              <Button
                onClick={handlePostComment}
                disabled={!newComment.trim() || postingComment}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed px-6"
              >
                {postingComment ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Homework ID: {homeworkId}</p>
            <p className="text-sm text-gray-600 mb-2">Classroom ID: {classroom.id}</p>
            <p className="text-sm text-gray-600 mb-2">User Role: {userRole}</p>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify({ homework, classroom }, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
