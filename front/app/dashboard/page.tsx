"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "../../lib/api"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    const userData = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    setUser(userData)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              onClick={() => {
                storage.clearAll()
                router.push("/signin")
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">Welcome to your Dashboard, {user?.username || "User"}!</h1>
          <p className="text-xl text-gray-600">Manage your teaching and learning activities</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* My Classrooms */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-black mb-2">My Classrooms</h3>
            <p className="text-gray-600 mb-6">View and manage your classrooms</p>
            <Link href="/classroom">
              <Button className="bg-black text-white hover:bg-gray-800">View Classrooms</Button>
            </Link>
          </div>

          {/* My Homeworks */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-black mb-2">My Homeworks</h3>
            <p className="text-gray-600 mb-6">View and submit your assignments</p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              onClick={() => {
                // Navigate to first classroom's homeworks or show all homeworks
                router.push("/classroom")
              }}
            >
              View Homeworks
            </Button>
          </div>

          {/* Create Classroom */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">➕</div>
            <h3 className="text-xl font-bold text-black mb-2">Create Classroom</h3>
            <p className="text-gray-600 mb-6">Start a new teaching session</p>
            <Link href="/create">
              <Button className="bg-black text-white hover:bg-gray-800">Create Classroom</Button>
            </Link>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Messages */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-black mb-2">Messages</h3>
            <p className="text-gray-600 mb-6">Connect with tutors and students</p>
            <Link href="/messages">
              <Button className="bg-black text-white hover:bg-gray-800">Open Messages</Button>
            </Link>
          </div>

          {/* My Students */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-black mb-2">My Students</h3>
            <p className="text-gray-600 mb-6">View and manage all your students</p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              View Students
            </Button>
          </div>

          {/* Students */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-black mb-2">Students</h3>
            <p className="text-gray-600 mb-6">Manage your student roster</p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              View Students
            </Button>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Analytics */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-black mb-2">Analytics</h3>
            <p className="text-gray-600 mb-6">Track progress and performance</p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              View Analytics
            </Button>
          </div>

          {/* Profile */}
          <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-black mb-2">Profile</h3>
            <p className="text-gray-600 mb-6">Update your account settings</p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
