'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful');
        // Redirect to dashboard or home page
        window.location.href = '/dashboard'; // Update this path as needed
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <>
      <main className="md:max-w-[90vw] w-full min-h-screen mx-auto flex justify-center items-center">
        <form onSubmit={handleSubmit} className="card-sm space-y-4">
          <h1 className="text-3xl text-center">Login</h1>
          <div className="flex-col flex">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </div>
          <div>
            <p className="text-sm text-center">
              Don't have an account?{' '}
              <a className="link" href="/register">
                Register
              </a>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}