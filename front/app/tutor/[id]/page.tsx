"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, storage } from "../../../lib/api"
import { StartChatButton } from "@/components/chat/StartChatButton"

export default function TutorDetail() {
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewerType, setViewerType] = useState(null) // 'self' or 'student'
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()
  const params = useParams()
  const tutorId = params.id

  useEffect(() => {
    const token = storage.getAccessToken()
    const userData = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    setCurrentUser(userData)

    const loadTutorDetail = async () => {
      try {
        const tutorData = await api.tutors.getDetail(tutorId, token)
        console.log("Tutor detail data:", tutorData) // Debug log
        setTutor(tutorData)

        // Determine if this is the tutor viewing their own profile
        if (userData && tutorData.username === userData.username) {
          setViewerType("self")
        } else {
          setViewerType("student") // Student viewing their tutor
        }
      } catch (error) {
        console.error("Failed to load tutor details:", error)
        if (error.message.includes("Must be a student of this classroom")) {
          setError("You don't have permission to view this tutor's details. You must be enrolled in their classroom.")
        } else if (error.message.includes("such tutor does not exist")) {
          setError("Tutor not found.")
        } else if (error.message.includes("Must be a student")) {
          setError("Access denied. Only students can view tutor profiles.")
        } else {
          setError("Failed to load tutor details: " + error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    if (tutorId) {
      loadTutorDetail()
    }
  }, [router, tutorId])

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "N/A"
  }

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return (username?.[0] || "?").toUpperCase()
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
          <p className="text-gray-600">Loading tutor details...</p>
        </div>
      </div>
    )
  }

  if (error || !tutor) {
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
          <h1 className="text-2xl font-bold text-black mb-4">Tutor Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The requested tutor could not be found."}</p>
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

      {/* Tutor Details */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-black rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
            {getInitials(tutor.first_name, tutor.last_name, tutor.username)}
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">{getFullName(tutor.first_name, tutor.last_name)}</h1>
          <p className="text-xl text-gray-600">@{tutor.username}</p>
          {tutor.subject && (
            <p className="text-lg text-gray-700 mt-2">
              <span className="font-medium">Specializes in:</span> {getSubjectName(tutor.subject)}
            </p>
          )}
          {viewerType && (
            <div className="mt-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  viewerType === "self" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {viewerType === "self" ? "Your Profile" : "Your Tutor"}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">👨‍🏫</span>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Full Name</p>
                <p className="text-black">{getFullName(tutor.first_name, tutor.last_name)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Username</p>
                <p className="text-black">@{tutor.username}</p>
              </div>
              {tutor.subject && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject Specialization</p>
                  <p className="text-black">{getSubjectName(tutor.subject)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">📞</span>
              Contact Information
            </h2>
            <div className="space-y-4">
              {tutor.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <p className="text-black">{tutor.phone}</p>
                </div>
              )}
              {tutor.telegram_username && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Telegram</p>
                  <p className="text-black">@{tutor.telegram_username}</p>
                </div>
              )}
              {!tutor.phone && !tutor.telegram_username && (
                <p className="text-gray-500 italic">No contact information available</p>
              )}
            </div>
          </div>

          {/* Description/Bio */}
          <div className="md:col-span-2 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">📝</span>
              About {viewerType === "self" ? "You" : tutor.first_name || "This Tutor"}
            </h2>
            {tutor.description ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{tutor.description}</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 italic">
                  {viewerType === "self"
                    ? "You haven't added a description yet. Consider adding one to help students learn more about you!"
                    : "This tutor hasn't added a description yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {viewerType === "self" ? (
            <>
              <Button className="bg-black text-white hover:bg-gray-800">Edit Profile</Button>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                View My Classrooms
              </Button>
            </>
          ) : (
            <>
              <StartChatButton
                userType="tutor"
                userId={tutor.id}
                userName={getFullName(tutor.first_name, tutor.last_name)}
                className="bg-black text-white hover:bg-gray-800"
              />
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                View Shared Classrooms
              </Button>
            </>
          )}
        </div>

        {/* Additional Info for Self View */}
        {viewerType === "self" && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Profile Tips:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Keep your contact information up to date so students can reach you</li>
              <li>• Add a detailed description to help students understand your teaching style</li>
              <li>• Specify your subject specialization to attract the right students</li>
              <li>• Consider adding your Telegram username for quick communication</li>
            </ul>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Viewer Type: {viewerType}</p>
            <p className="text-sm text-gray-600 mb-2">Current User: {currentUser?.username}</p>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(tutor, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
