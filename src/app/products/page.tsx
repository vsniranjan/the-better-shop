"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  seller: {
    id: string;
    sellerProfile: { shopName: string } | null;
  };
  categories: {
    category: { id: string; name: string };
  }[];
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function fetchProducts(page: number): Promise<ProductsResponse> {
  const res = await fetch(`/api/products?page=${page}&limit=20`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page),
  });

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-[16px] font-medium text-[#707072]'>Loading...</p>
      </div>
    );

  if (isError)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-[16px] font-medium text-[#D30005]'>
          Failed to load products.
        </p>
      </div>
    );

  const { products, pagination } = data!;

  return (
    <div className='max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-8 lg:py-12'>
      {/* Page Header */}
      <h1 className='text-[24px] md:text-[32px] font-medium text-[#111111] mb-8'>
        All Products
      </h1>

      {products.length === 0 ? (
        <div className='py-20 text-center'>
          <p className='text-[16px] text-[#707072]'>No products available.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-10'>
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className='cursor-pointer group bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl overflow-hidden hover:border-[#CACACB] transition-colors duration-200'
            >
              {/* Product Image — no border radius, full bleed within card */}
              <div className='aspect-square bg-[#F5F5F5] overflow-hidden'>
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    loading='lazy'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <span className='text-[#9E9EA0] text-[14px]'>
                      No Image
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className='px-4 py-3'>
                <div className='flex justify-between items-start gap-2'>
                  <p className='text-[15px] font-medium text-[#111111] leading-snug'>
                    {product.title}
                  </p>
                  <p className='text-[15px] font-medium text-[#111111] whitespace-nowrap'>
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <p className='text-[14px] text-[#707072] mt-0.5'>
                  {product.seller.sellerProfile?.shopName ?? "Unknown Shop"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-4 mt-12'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-6 py-2.5 rounded-full text-[14px] font-medium border border-[#CACACB] text-[#111111] hover:border-[#707072] hover:bg-[#E5E5E5] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:border-[#E5E5E5] disabled:cursor-not-allowed'
          >
            Prev
          </button>
          <span className='text-[14px] font-medium text-[#707072]'>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className='px-6 py-2.5 rounded-full text-[14px] font-medium border border-[#CACACB] text-[#111111] hover:border-[#707072] hover:bg-[#E5E5E5] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:border-[#E5E5E5] disabled:cursor-not-allowed'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
