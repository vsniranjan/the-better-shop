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

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
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
    onSuccess: () => {
      router.push("/seller/products");
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message);
      }
    },
  });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    mutation.mutate(formData);
  }

  if (isLoading) return <p className='p-8 text-center'>Loading...</p>;
  if (isError)
    return (
      <p className='p-8 text-center text-red-500'>Failed to load product.</p>
    );

  if (!product) return null;
  return (
    <div className='max-w-xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Edit Product</h1>

      {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Title</label>
          <input
            name='title'
            defaultValue={product.title}
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Description</label>
          <textarea
            name='description'
            defaultValue={product.description ?? ""}
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
            defaultValue={product.price}
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Stock</label>
          <input
            name='stock'
            type='number'
            min='0'
            defaultValue={product.stock}
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
            defaultValue={product.categories
              .map((c) => c.category.name)
              .join(", ")}
            className='w-full border rounded-lg px-3 py-2 text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>
            Images{" "}
            <span className='text-gray-400 font-normal'>
              (leave empty to keep existing)
            </span>
          </label>
          <div className='flex gap-2 mb-2'>
            {product.images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`image ${i + 1}`}
                className='w-16 h-16 object-cover rounded'
              />
            ))}
          </div>
          <input
            name='images'
            type='file'
            accept='image/*'
            multiple
            className='w-full text-sm'
          />
        </div>

        <button
          type='submit'
          disabled={mutation.isPending}
          className='bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-sm disabled:opacity-50'
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
