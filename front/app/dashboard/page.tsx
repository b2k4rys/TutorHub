"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage, refreshAccessToken, api } from "../../lib/api"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const accessToken = storage.getAccessToken()
    const userData = storage.getUser()

    if (!accessToken) {
      router.push("/signin")
      return
    }

    // Try to fetch fresh user data
    const fetchUserData = async () => {
      try {
        const userResponse = await api.auth.me(accessToken)
        setUser(userResponse)
        storage.setUser(userResponse)
      } catch (error) {
        // If token is expired, try to refresh
        try {
          const newToken = await refreshAccessToken()
          const userResponse = await api.auth.me(newToken)
          setUser(userResponse)
          storage.setUser(userResponse)
        } catch (refreshError) {
          // If refresh fails, redirect to login
          storage.clearAll()
          router.push("/signin")
          return
        }
      }
      setLoading(false)
    }

    if (userData) {
      setUser(userData)
      setLoading(false)
      // Optionally fetch fresh data in background
      fetchUserData()
    } else {
      fetchUserData()
    }
  }, [router])

  const handleLogout = () => {
    storage.clearAll()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.full_name || user?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">
            Welcome to your Dashboard, {user?.full_name || user?.name}!
          </h1>
          <p className="text-xl text-gray-600">You're logged in as a {user?.user_type || "user"}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-black mb-4">My Courses</h3>
            <p className="text-gray-600 mb-4">View and manage your enrolled courses</p>
            <Button className="bg-black text-white hover:bg-gray-800">View Courses</Button>
          </div>

          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-black mb-4">Messages</h3>
            <p className="text-gray-600 mb-4">Connect with tutors and classmates</p>
            <Button className="bg-black text-white hover:bg-gray-800">Open Messages</Button>
          </div>

          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-black mb-4">Profile</h3>
            <p className="text-gray-600 mb-4">Update your account settings</p>
            <Button className="bg-black text-white hover:bg-gray-800">Edit Profile</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
