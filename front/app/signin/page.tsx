"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../lib/api"

export default function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Login and get JWT tokens
      const response = await api.auth.login({
        username: formData.username,
        password: formData.password,
      })

      // Store JWT tokens
      storage.setTokens(response.access, response.refresh)

      // Get user information using the access token
      try {
        const userResponse = await api.auth.me(response.access)
        storage.setUser(userResponse)
      } catch (userError) {
        console.warn("Could not fetch user data:", userError)
        // Store basic user info from login if available
        storage.setUser({
          username: formData.username,
        })
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href="/signup">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Sign In Form */}
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your TutorHub account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-black hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800 py-3">
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-black font-medium hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-8 mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        {/* Social Sign In */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 bg-transparent"
          >
            <span className="mr-2">📧</span>
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 bg-transparent"
          >
            <span className="mr-2">📘</span>
            Continue with Microsoft
          </Button>
        </div>
      </main>
    </div>
  )
}
