import React, { useState } from "react"
import { BookOpen, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email"

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      alert(`Signed in as: ${formData.email}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-900">TutorHub</span>
          </div>
          <h1 className="text-xl font-semibold text-blue-900 mb-1">Welcome back</h1>
          <p className="text-blue-600 text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 border border-blue-100">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-blue-900 text-sm font-medium block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 pr-3 py-2 border w-full rounded-md focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500 focus:ring-red-300" : "border-blue-200 focus:ring-blue-300"
                }`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-blue-900 text-sm font-medium block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 pr-10 py-2 border w-full rounded-md focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500 focus:ring-red-300" : "border-blue-200 focus:ring-blue-300"
                }`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo info */}
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 text-center">
          <AlertCircle className="inline w-4 h-4 mr-1" />
          Demo: demo@tutorhub.com / demo123
        </div>
      </div>
    </div>
  )
}
