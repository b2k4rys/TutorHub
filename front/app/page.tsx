import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TutorHubLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-black">TutorHub</div>
          <div className="flex gap-4">
            <Link href="/signin">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-black text-white hover:bg-gray-800">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-6">Hello, welcome to TutorHub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience a revolutionary learning platform that goes beyond traditional classroom management. Connect,
            learn, and excel with our innovative approach to education.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Personalized Study System</h3>
            <p className="text-gray-600">
              Tailored learning experiences that adapt to your unique learning style and pace. Get personalized
              recommendations and study plans designed just for you.
            </p>
          </div>

          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">👨‍🏫</span>
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Direct Tutor Connections</h3>
            <p className="text-gray-600">
              Connect directly with qualified tutors and educators. Get instant help, schedule one-on-one sessions, and
              receive personalized guidance when you need it most.
            </p>
          </div>

          <div className="text-center p-8 border border-gray-200 rounded-lg">
            <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Enhanced User Experience</h3>
            <p className="text-gray-600">
              Enjoy a cleaner, faster, and more intuitive interface compared to Google Classroom. Streamlined workflows
              and modern design make learning effortless.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 py-16 px-8 rounded-lg">
          <h2 className="text-3xl font-bold text-black mb-4">Ready to Transform Your Learning Experience?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who have already discovered the power of personalized learning with
            TutorHub.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">Get Started Free</Button>
            </Link>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white px-8 py-3 text-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Why Choose TutorHub */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-black mb-8">Why Choose TutorHub Over Google Classroom?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left p-6 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-black mb-2">✓ Intuitive Design</h4>
              <p className="text-gray-600">Clean, modern interface that's easy to navigate</p>
            </div>
            <div className="text-left p-6 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-black mb-2">✓ Personal Learning Paths</h4>
              <p className="text-gray-600">AI-powered recommendations for optimal learning</p>
            </div>
            <div className="text-left p-6 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-black mb-2">✓ Real-time Collaboration</h4>
              <p className="text-gray-600">Enhanced tools for student-teacher interaction</p>
            </div>
            <div className="text-left p-6 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-black mb-2">✓ Advanced Analytics</h4>
              <p className="text-gray-600">Detailed insights into learning progress and performance</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2024 TutorHub. All rights reserved. | Transforming education, one student at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}
