"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("BUYER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const shopName = (form.elements.namedItem("shopName") as HTMLInputElement)
      ?.value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          ...(role === "SELLER" && { shopName }),
        }),
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
    <div className='max-w-sm mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold mb-6'>Register</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          name='email'
          type='email'
          placeholder='Email'
          required
          className='border rounded-lg px-3 py-2 text-sm'
        />
        <input
          name='password'
          type='password'
          placeholder='Password'
          required
          className='border rounded-lg px-3 py-2 text-sm'
        />
        <select
          name='role'
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className='border rounded-lg px-3 py-2 text-sm'
        >
          <option value='BUYER'>Buyer</option>
          <option value='SELLER'>Seller</option>
        </select>

        {role === "SELLER" && (
          <input
            name='shopName'
            type='text'
            placeholder='Shop name'
            required
            className='border rounded-lg px-3 py-2 text-sm'
          />
        )}

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-sm disabled:opacity-50'
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p className='text-sm text-gray-500 mt-4'>
        Already have an account?{" "}
        <Link href='/login' className='underline'>
          Login
        </Link>
      </p>
    </div>
  );
}
