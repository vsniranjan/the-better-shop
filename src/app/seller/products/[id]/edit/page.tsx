"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categories: {
    category: { id: string; name: string };
  }[];
}

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export default function EditProductPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { router.push("/seller/products"); },
    onError: (err) => { if (err instanceof Error) { setError(err.message); } },
  });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    mutation.mutate(formData);
  }

  if (isLoading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-[16px] font-medium text-[#707072]'>Loading...</p>
    </div>
  );
  if (isError) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-[16px] font-medium text-[#D30005]'>Failed to load product.</p>
    </div>
  );
  if (!product) return null;

  return (
    <div className='max-w-[560px] mx-auto px-4 md:px-6 py-8 lg:py-12'>
      <h1 className='text-[24px] md:text-[32px] font-medium text-[#111111] mb-8'>Edit Product</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Title</label>
          <input name='title' defaultValue={product.title} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Description</label>
          <textarea name='description' defaultValue={product.description ?? ""} rows={4} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111] resize-y' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Price</label>
            <input name='price' type='number' step='0.01' min='0' defaultValue={product.price} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
          </div>
          <div>
            <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>Stock</label>
            <input name='stock' type='number' min='0' defaultValue={product.stock} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
          </div>
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>
            Categories <span className='text-[#707072] font-normal'>(comma separated)</span>
          </label>
          <input name='categories' defaultValue={product.categories.map((c) => c.category.name).join(", ")} className='w-full bg-[#F5F5F5] border border-[#CACACB] rounded-lg px-4 py-3 text-[16px] text-[#111111] placeholder-[#707072] outline-none transition-colors duration-200 focus:border-[#111111]' />
        </div>

        <div>
          <label className='block text-[14px] font-medium text-[#111111] mb-1.5'>
            Images <span className='text-[#707072] font-normal'>(leave empty to keep existing)</span>
          </label>
          {product.images.length > 0 && (
            <div className='flex gap-2 mb-3'>
              {product.images.map((url, i) => (
                <img key={i} src={url} alt={`image ${i + 1}`} className='w-16 h-16 object-cover bg-[#F5F5F5]' />
              ))}
            </div>
          )}
          <input name='images' type='file' accept='image/*' multiple className='w-full text-[14px] text-[#707072] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[14px] file:font-medium file:bg-[#F5F5F5] file:text-[#111111] hover:file:bg-[#E5E5E5] file:cursor-pointer file:transition-colors file:duration-200' />
        </div>

        {error && <p className='text-[#D30005] text-[12px] font-medium'>{error}</p>}

        <button type='submit' disabled={mutation.isPending} className='w-full bg-[#111111] text-white py-3 rounded-full text-[16px] font-medium hover:bg-[#707072] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:cursor-not-allowed mt-2'>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
