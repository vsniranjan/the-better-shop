"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white px-4'>
      <div className='w-full max-w-[380px]'>
        {/* Logo / Brand */}
        <div className='text-center mb-8'>
          <h1 className='text-[24px] font-medium text-[#111111] tracking-tight'>
            THE BETTER SHOP
          </h1>
          <p className='text-[14px] text-[#707072] mt-2 leading-relaxed'>
            Sign in to your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            name='email'
            type='email'
            placeholder='Email address'
            required
            className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]'
          />
          <input
            name='password'
            type='password'
            placeholder='Password'
            required
            className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]'
          />

          {error && (
            <p className='text-[#D30005] text-[12px] font-medium'>{error}</p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#111111] text-white py-3 rounded-full text-[16px] font-medium hover:bg-[#707072] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:cursor-not-allowed'
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className='text-center text-[14px] text-[#707072] mt-8'>
          Not a Member?{" "}
          <Link
            href='/register'
            className='text-[#111111] font-medium underline hover:text-[#707072] transition-colors duration-200'
          >
            Join Us
          </Link>
        </p>
      </div>
    </div>
  );
}
