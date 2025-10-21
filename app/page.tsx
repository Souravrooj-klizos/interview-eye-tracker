import InterviewRecorder from './components/InterviewRecorder'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Interview Eye Tracker</h1>
          <Link 
            href="/test" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Eye Tracking
          </Link>
        </div>
      </div>
      <InterviewRecorder />
    </div>
  )
}
