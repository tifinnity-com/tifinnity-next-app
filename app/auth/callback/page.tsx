'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AuthCallback() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleConfirmation = async () => {
      const token = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token && type === 'email') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });
          
          if (error) {
            console.error('Confirmation error:', error.message);
            setIsError(true);
            setMessage('Invalid or expired confirmation link');
            // Optional: redirect after showing error
            // router.push('/error?message=Invalid or expired confirmation link');
          } else {
            setMessage('Email verified successfully! Redirecting...');
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } catch (error: any) {
          console.error('Unexpected error:', error);
          setIsError(true);
          setMessage('An unexpected error occurred');
        }
      } else {
        setIsError(true);
        setMessage('Invalid confirmation link');
        // Optional: redirect after showing error
        // router.push('/error?message=Invalid confirmation link');
      }
    };
    
    handleConfirmation();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isError ? 'bg-red-100' : 'bg-tifinnity-green/20'
        }`}>
          {isError ? (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-tifinnity-green animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path>
            </svg>
          )}
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${isError ? 'text-red-600' : 'text-tifinnity-green'}`}>
          {isError ? 'Authentication Failed' : 'Processing...'}
        </h2>
        
        <p className="text-tifinnity-gray mb-6">
          {message}
        </p>

        {isError && (
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-tifinnity-green hover:bg-tifinnity-green/90 text-white px-6 py-2 rounded-md"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}