"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }

    router.push("/seller/products");
  }

  return (
    <div className='max-w-xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Add Product</h1>

      {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Title</label>
          <input
            name='title'
            required
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Description</label>
          <textarea
            name='description'
            rows={3}
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Price</label>
          <input
            name='price'
            type='number'
            step='0.01'
            min='0'
            required
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Stock</label>
          <input
            name='stock'
            type='number'
            min='0'
            required
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>
            Categories{" "}
            <span className='text-gray-400 font-normal'>(comma separated)</span>
          </label>
          <input
            name='categories'
            placeholder='lighting, decor, study'
            required
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Images</label>
          <input
            name='images'
            type='file'
            accept='image/*'
            multiple
            required
            className='w-full text-sm'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-sm disabled:opacity-50'
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
