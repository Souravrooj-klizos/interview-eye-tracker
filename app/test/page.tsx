import { connectDB } from '@/lib/db';
import Interview from '@/models/Interview';

export default async function TestPage() {
  let dbStatus = 'Unknown';
  let testInterview = null;

  try {
    await connectDB();
    dbStatus = 'Connected';
    
    // Create a test interview
    const interview = new Interview({
      userId: 'test_user',
      startedAt: new Date(),
      warnings: [
        { time: 1000, reason: 'Test warning' }
      ],
      status: 'active'
    });
    
    testInterview = interview.toObject();
  } catch (error) {
    dbStatus = `Error: ${error}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">System Test</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-700">Database Connection</h2>
              <p className={`mt-1 ${dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {dbStatus}
              </p>
            </div>
            
            {testInterview && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold text-gray-700">Test Interview Model</h2>
                <pre className="mt-2 text-sm text-gray-600 overflow-x-auto">
                  {JSON.stringify(testInterview, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-700">Next Steps</h2>
              <ul className="mt-2 text-sm text-blue-600 space-y-1">
                <li>• Make sure MongoDB is running</li>
                <li>• Go back to <a href="/" className="underline">home page</a></li>
                <li>• Test the interview recorder</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
