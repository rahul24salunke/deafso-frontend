// src/pages/NotFoundPage.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Frown } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 text-center">
      {/* Icon */}
      <div className="mb-6 animate-bounce">
        <Frown size={80} className="text-purple-400" />
      </div>

      {/* Heading */}
      <h1 className="text-6xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg">
        404
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-lg sm:text-xl text-purple-300 max-w-lg">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      {/* Button */}
      <Link to="/" className="mt-8">
        <Button className="px-6 py-3 text-lg bg-purple-600 hover:bg-purple-800 active:bg-purple-900 rounded-lg shadow-xl transition-all duration-300">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
