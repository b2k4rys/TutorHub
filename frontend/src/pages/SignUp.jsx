import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Eye, EyeOff, Mail, Lock, User, AlertCircle, GraduationCap } from "lucide-react"

export default function SignUp() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
    agreeToTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"

    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email"

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters"
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = "Password must contain uppercase, lowercase, and number"

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"

    if (!formData.role) newErrors.role = "Select your role"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must accept the terms"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      alert("Account created successfully!")
      navigate("/signin")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center space-x-2 mx-auto mb-6"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-900">TutorHub</span>
          </button>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Join TutorHub</h1>
          <p className="text-blue-600 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 border border-blue-100">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 text-sm mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full pl-10 py-2 rounded border ${
                    errors.firstName ? "border-red-500" : "border-blue-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                />
              </div>
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-blue-900 text-sm mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full py-2 px-3 rounded border ${
                  errors.lastName ? "border-red-500" : "border-blue-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-blue-900 text-sm mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-10 py-2 rounded border ${
                  errors.email ? "border-red-500" : "border-blue-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-blue-900 text-sm mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className={`w-full py-2 px-3 rounded border ${
                errors.role ? "border-red-500" : "border-blue-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
          </div>

          {/* Institution */}
          <div>
            <label className="block text-blue-900 text-sm mb-1">Institution (optional)</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
              className="w-full py-2 px-3 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-blue-900 text-sm mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-10 pr-10 py-2 rounded border ${
                  errors.password ? "border-red-500" : "border-blue-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-blue-900 text-sm mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`w-full pl-10 pr-10 py-2 rounded border ${
                  errors.confirmPassword ? "border-red-500" : "border-blue-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-blue-400 hover:text-blue-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Agree to Terms */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
              className="mt-1 accent-blue-600"
            />
            <label className="text-sm text-blue-700">
              I agree to the{" "}
              <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeToTerms}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          {/* Already have account */}
          <p className="text-center text-sm text-blue-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-700 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
