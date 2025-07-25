"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../lib/api"

export default function HomeworkDetail() {
  const [homework, setHomework] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const homeworkId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) {
      router.push("/signin")
      return
    }

    const loadHomework = async () => {
      try {
        const homeworkData = await api.homeworks.get(homeworkId, token)
        console.log("Homework detail data:", homeworkData) // Debug log
        setHomework(homeworkData)
      } catch (error) {
        console.error("Failed to load homework:", error)
        setError("Failed to load homework details: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    if (homeworkId) {
      loadHomework()
    }
  }, [router, homeworkId])

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
    if (days === null) return { text: "", color: "text-gray-500", bgColor: "bg-gray-100" }
    if (days < 0)
      return {
        text: `${Math.abs(days)} days overdue`,
        color: "text-red-800",
        bgColor: "bg-red-100",
      }
    if (days === 0) return { text: "Due today", color: "text-red-800", bgColor: "bg-red-100" }
    if (days === 1) return { text: "Due tomorrow", color: "text-orange-800", bgColor: "bg-orange-100" }
    if (days <= 3) return { text: `Due in ${days} days`, color: "text-orange-800", bgColor: "bg-orange-100" }
    if (days <= 7) return { text: `Due in ${days} days`, color: "text-yellow-800", bgColor: "bg-yellow-100" }
    return { text: `Due in ${days} days`, color: "text-green-800", bgColor: "bg-green-100" }
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
          <p className="text-gray-600">Loading homework details...</p>
        </div>
      </div>
    )
  }

  if (error || !homework) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-black">
              TutorHub
            </Link>
            <Link href="/homeworks">
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
          <h1 className="text-2xl font-bold text-black mb-4">Homework Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The requested homework could not be found."}</p>
          <Link href="/homeworks">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Homeworks</Button>
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
            <Link href="/homeworks">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Homeworks
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

      {/* Homework Details */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-black">{homework.title}</h1>
                {homework.is_optional && (
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Optional Assignment
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">{homework.description}</p>
            </div>
          </div>

          {/* Due Date Status */}
          {dueDateStatus.text && (
            <div className={`inline-flex items-center px-4 py-2 rounded-lg ${dueDateStatus.bgColor} mb-6`}>
              <span className="mr-2">⏰</span>
              <span className={`font-medium ${dueDateStatus.color}`}>{dueDateStatus.text}</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Assignment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Title</p>
                  <p className="text-black">{homework.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-black leading-relaxed">{homework.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Assignment Type</p>
                  <p className="text-black">{homework.is_optional ? "Optional" : "Required"}</p>
                </div>
              </div>
            </div>

            {/* Attachment Section */}
            {attachmentName && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                  <span className="mr-2">📎</span>
                  Attachment
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        📄
                      </div>
                      <div>
                        <p className="font-medium text-black">{attachmentName}</p>
                        <p className="text-sm text-gray-600">Click to download or view</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Open File
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">📤</span>
                Submit Your Work
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">Ready to submit your assignment? Upload your completed work below.</p>
                <div className="flex gap-3">
                  <Button className="bg-black text-white hover:bg-gray-800">Upload Submission</Button>
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white bg-transparent"
                  >
                    Save as Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Due Date Info */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Due Date
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Due</p>
                  <p className="text-black">{formatDate(homework.due_date)}</p>
                </div>
                {dueDateStatus.text && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className={`font-medium ${dueDateStatus.color}`}>{dueDateStatus.text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button className="w-full bg-black text-white hover:bg-gray-800">Submit Work</Button>
                <Button
                  variant="outline"
                  className="w-full border-black text-black hover:bg-black hover:text-white bg-transparent"
                >
                  Ask Question
                </Button>
                {attachmentName && (
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    onClick={() => window.open(`http://localhost:8000${homework.attachment}`, "_blank")}
                  >
                    Download Attachment
                  </Button>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="mr-2">ℹ️</span>
                Assignment Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assignment ID</span>
                  <span className="font-medium text-black">#{homework.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-black">{homework.is_optional ? "Optional" : "Required"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Attachment</span>
                  <span className="font-medium text-black">{attachmentName ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(homework, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
