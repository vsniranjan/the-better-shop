"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  seller: {
    id: string;
    sellerProfile: { shopName: string } | null;
  };
  categories: {
    category: { id: string; name: string };
  }[];
}

const fetchProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");

  return res.json();
};

const ProductPage = () => {
  const { id } = useParams() as { id: string };

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) return <p className='p-8 text-center'>Loading...</p>;
  if (isError)
    return (
      <p className='p-8 text-center text-red-500'>Failed to load product.</p>
    );

  if (!product) return null;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='grid md:grid-cols-2 gap-8'>
        <div className='flex flex-col gap-2'>
          {product.images.map((url, i) => (
            <Image
              key={i}
              src={url}
              alt={`${product.title} image ${i + 1}`}
              className='w-full rounded-lg object-cover'
            />
          ))}
        </div>

        <div>
          <h1 className='text-2xl font-bold mb-2'>{product.title}</h1>
          <p className='text-xl text-gray-700 mb-4'>
            ${product.price.toFixed(2)}
          </p>

          {product.description && (
            <p className='text-gray-600 mb-4'>{product.description}</p>
          )}

          <p className='text-sm text-gray-500 mb-2'>
            Stock: {product.stock > 0 ? product.stock : "Out of stock"}
          </p>

          <p className='text-sm text-gray-500 mb-4'>
            Sold by: {product.seller.sellerProfile?.shopName ?? "Unknown Shop"}
          </p>

          <div className='flex flex-wrap gap-2 mb-6'>
            {product.categories.map(({ category }) => (
              <span
                key={category.id}
                className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'
              >
                {category.name}
              </span>
            ))}
          </div>

          <button
            disabled={product.stock === 0}
            className='w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition'
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
