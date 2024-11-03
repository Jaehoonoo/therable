// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock authentication
    const isAuthenticated = true; // Replace this with actual authentication logic
    
    if (isAuthenticated) {
      router.push("/diary"); // Redirect to the /diary page
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-green-400 items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-4xl font-bold text-white">Mock</h1>
          <p className="mt-4 text-lg text-white">
            Mock
          </p>
        </div>
      </div>

      {/* Right Side Form Section */}
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-green-600 font-semibold hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          {!isSignUp && (
            <p className="mt-4 text-sm text-center text-gray-500">
              <a href="#" className="hover:underline">
                Forgot password?
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
