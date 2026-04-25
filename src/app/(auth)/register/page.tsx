"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
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
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name='email' type='email' placeholder='Email' required />
        <input
          name='password'
          type='password'
          placeholder='Password'
          required
        />
        <select name='role'>
          <option value='BUYER'>Buyer</option>
          <option value='SELLER'>Seller</option>
        </select>
        {error && <p>{error}</p>}
        <button type='submit' disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <Link href='/login'>Already have an account? Login</Link>
    </div>
  );
}
