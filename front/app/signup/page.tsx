"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "../../lib/api"

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    userType: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
    setSuccess("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!formData.terms) {
      setError("Please accept the terms and conditions")
      setLoading(false)
      return
    }

    try {
      // Register using your role-based registration endpoint
      const response = await api.auth.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.fullName.split(" ")[0] || "",
        last_name: formData.fullName.split(" ").slice(1).join(" ") || "",
        role: formData.userType, // Adjust based on your serializer field name
      })

      setSuccess("Account created successfully! Please sign in.")

      // Auto-redirect after registration
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
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
            <Link href="/signin">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Sign Up Form */}
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Join TutorHub</h1>
          <p className="text-gray-600">Create your account to get started</p>
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
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-black mb-2">
              I am a
            </label>
            <select
              id="userType"
              name="userType"
              required
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="teacher">Teacher</option>
            </select>
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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              required
              checked={formData.terms}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-black hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-black hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800 py-3">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-black font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-black mb-4">Why join TutorHub?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Personalized learning experience
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Connect with qualified tutors
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Track your progress and achievements
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Access to premium learning resources
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
