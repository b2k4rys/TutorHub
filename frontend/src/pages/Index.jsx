import React from "react"
import Header from "../components/Headers" 

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to TutorHub</h1>
        <p className="text-blue-600 text-lg">
          The all-in-one learning platform for educators and students.
        </p>
      </main>
    </div>
  )
}
