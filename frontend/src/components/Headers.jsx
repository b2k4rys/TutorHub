// src/components/Header.jsx

import { BookOpen } from "lucide-react"
import SignInButton from "./buttons/SignInButton"
import SignUpButton from './buttons/SignUpButton'
import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="border-b border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-900">TutorHub</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-blue-700 hover:text-blue-900 font-medium">
              Features
            </a>
            <a href="#courses" className="text-blue-700 hover:text-blue-900 font-medium">
              Courses
            </a>
            <a href="#about" className="text-blue-700 hover:text-blue-900 font-medium">
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <Link to="/signin" className="text-blue-700 hover:text-blue-900 font-medium">
              Sign In
            </Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
              Sign Up
            </Link>
          </div>
          </div>
        </div>
      </div>
    </header>
  )
}
