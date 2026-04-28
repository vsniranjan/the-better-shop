"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

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

const fetchProducts = async (page: number): Promise<ProductsResponse> => {
  const res = await fetch(`/api/products?page=${page}&limit=20`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const ProductsPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page),
  });

  if (isLoading) return <p className='p-8 text-center'>Loading...</p>;
  if (isError)
    return (
      <p className='p-8 text-center text-red-500'>Failed to load products.</p>
    );

  if (!data) return null;

  const { products, pagination } = data;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Products</h1>

      {products.length === 0 ? (
        <p className='text-gray-500'>No products yet.</p>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className='border rounded-lg p-3 hover:shadow-md transition'
            >
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  className='w-full h-40 object-cover rounded mb-2'
                />
              )}
              <p className='font-medium text-sm truncate'>{product.title}</p>
              <p className='text-gray-600 text-sm'>
                ${product.price.toFixed(2)}
              </p>
              <p className='text-gray-400 text-xs mt-1'>
                {product.seller.sellerProfile?.shopName ?? "Unknown Shop"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className='flex justify-center gap-2 mt-8'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-4 py-2 border rounded disabled:opacity-50'
          >
            Prev
          </button>
          <span className='px-4 py-2 text-sm text-gray-600'>
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className='px-4 py-2 border rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
