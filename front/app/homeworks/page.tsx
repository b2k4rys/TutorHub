"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../lib/api"

export default function HomeworksList() {
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadHomeworks = async () => {
      try {
        const homeworksData = await api.homeworks.list(token)
        console.log("Homeworks data:", homeworksData) // Debug log
        setHomeworks(Array.isArray(homeworksData) ? homeworksData : [])
      } catch (error) {
        console.error("Failed to load homeworks:", error)
        setError("Failed to load homeworks: " + error.message)
        setHomeworks([])
      } finally {
        setLoading(false)
      }
    }

    loadHomeworks()
  }, [router])

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
          <p className="text-gray-600">Loading homeworks...</p>
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

      {/* Homeworks List */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">My Homeworks</h1>
          <p className="text-xl text-gray-600">View and manage your assignments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {homeworks.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Homeworks Yet</h2>
            <p className="text-gray-600 mb-8">You don't have any assignments at the moment.</p>
            <Link href="/classroom">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">View Your Classrooms</Button>
            </Link>
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
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                    >
                      Submit Work
                    </Button>
                    {attachmentName && (
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                        onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                      >
                        Download Attachment
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Stats */}
        {homeworks.length > 0 && (
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
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(homeworks[0], null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
