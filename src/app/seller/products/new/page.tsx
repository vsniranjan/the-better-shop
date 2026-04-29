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
    <div className='max-w-[560px] mx-auto px-4 md:px-6 py-8 lg:py-12'>
      <h1 className='text-[24px] md:text-[32px] font-medium text-[#111111] mb-8'>Add Product</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Title</label>
          <input name='title' required className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Description</label>
          <textarea name='description' rows={4} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111] resize-y' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Price</label>
            <input name='price' type='number' step='0.01' min='0' required className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
          </div>
          <div>
            <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Stock</label>
            <input name='stock' type='number' min='0' required className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
          </div>
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>
            Categories <span className='text-[#707072] font-normal'>(comma separated)</span>
          </label>
          <input name='categories' placeholder='e.g. lighting, decor, study' required className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Images</label>
          <input name='images' type='file' accept='image/*' multiple required className='w-full text-[14px] text-[#707072] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[14px] file:font-medium file:bg-[#F5F5F5] file:text-[#111111] hover:file:bg-[#E5E5E5] file:cursor-pointer file:transition-colors file:duration-200' />
        </div>

        {error && <p className='text-[#D30005] text-[12px] font-medium'>{error}</p>}

        <button type='submit' disabled={loading} className='w-full bg-[#111111] text-white py-3 rounded-full text-[16px] font-medium hover:bg-[#707072] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:cursor-not-allowed mt-2'>
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
