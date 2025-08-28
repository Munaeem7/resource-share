import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Share Knowledge, <span className="text-blue-200">Empower Learning</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-lg">
            Join thousands of students sharing notes, assignments, and study materials to help each other succeed academically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 ">
            <button 
              onClick={handleGetStarted}
              className="bg-white cursor-pointer text-blue-700 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center justify-center"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} 
            </button>
            
            {!user && (
              <button 
                onClick={() => navigate('/signin')}
                className="border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:bg-opacity-10 transition duration-300"
              >
                Sign In
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-2">10+</div>
              <div className="text-blue-200">Study Resources</div>
            </div>
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-2">5+</div>
              <div className="text-blue-200">Active Students</div>
            </div>
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-2">10+</div>
              <div className="text-blue-200">Courses</div>
            </div>
          </div>
        </div>
        
        {/* Visual Content */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-800 transform rotate-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Computer Science Notes</div>
                  <div className="text-xs text-gray-500">Uploaded by Alex</div>
                </div>
              </div>
              <div className="text-blue-600 font-bold">PDF</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div className="h-full bg-blue-600 rounded-full w-3/4"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>12.5 MB</span>
              <span>Downloaded 342 times</span>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-blue-500 rounded-xl shadow-2xl p-4 text-white w-3/4 transform -rotate-6 z-10">
            <div className="flex items-center">
              <div className="bg-blue-400 rounded-full p-2 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <div className="font-semibold">Assignment Solutions</div>
                <div className="text-xs text-blue-200">Mathematics 101</div>
              </div>
            </div>
          </div>
          
          <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-2xl p-4 text-gray-800 w-2/3 transform rotate-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
              </div>
              <div>
                <div className="font-semibold">Lecture Notes</div>
                <div className="text-xs text-gray-500">Data Structures</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;