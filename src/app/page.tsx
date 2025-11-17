
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-12 shadow-lg max-w-lg w-full text-center border border-gray-200">
        
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Chat App
        </h1>

        <p className="text-gray-600 mt-3 text-base">
          A simple and fast real-time chat application.
        </p>

        <div className="mt-8">
          <a
            href="/signup"
            className="bg-blue-600 text-white text-lg font-medium px-8 py-3 rounded-full shadow hover:bg-blue-700 transition-all duration-200"
          >
            Sign Up
          </a>
        </div>

        <p className="text-gray-600 mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}