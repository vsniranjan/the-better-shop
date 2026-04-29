"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  const [imgIndex, setImgIndex] = useState(0);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
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
          Failed to load product.
        </p>
      </div>
    );

  if (!product) return null;

  return (
    <div className='max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-8 lg:py-12'>
      <Link href='/products' className='inline-flex items-center gap-1.5 text-[14px] font-medium text-[#707072] hover:text-[#111111] transition-colors duration-200 mb-6'>
        <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M10 3L5 8L10 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
        Back to Products
      </Link>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
        {/* Image Carousel */}
        <div className='relative bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl overflow-hidden'>
          <div className='aspect-square'>
            <img
              src={product.images[imgIndex]}
              alt={`${product.title} image ${imgIndex + 1}`}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Prev / Next Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i === 0 ? product.images.length - 1 : i - 1))}
                className='absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#111111] transition-colors duration-200 cursor-pointer'
                aria-label='Previous image'
              >
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M10 3L5 8L10 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
              </button>
              <button
                onClick={() => setImgIndex((i) => (i === product.images.length - 1 ? 0 : i + 1))}
                className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#111111] transition-colors duration-200 cursor-pointer'
                aria-label='Next image'
              >
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M6 3L11 8L6 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {product.images.length > 1 && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 cursor-pointer ${
                    i === imgIndex ? 'bg-[#111111]' : 'bg-[#111111]/30'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className='lg:sticky lg:top-8 lg:self-start'>
          <h1 className='text-[24px] md:text-[28px] font-medium text-[#111111] leading-tight'>
            {product.title}
          </h1>

          <p className='text-[20px] font-medium text-[#111111] mt-2'>
            ${product.price.toFixed(2)}
          </p>

          {/* Category Tags */}
          {product.categories.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {product.categories.map(({ category }) => (
                <span
                  key={category.id}
                  className='text-[12px] font-medium bg-[#F5F5F5] text-[#707072] px-3 py-1 rounded-full'
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className='text-[16px] text-[#111111] leading-relaxed mt-6'>
              {product.description}
            </p>
          )}

          {/* Stock */}
          <p className='text-[14px] font-medium mt-6'>
            {product.stock > 0 ? (
              <span className='text-[#007D48]'>In Stock — {product.stock} available</span>
            ) : (
              <span className='text-[#D30005]'>Out of Stock</span>
            )}
          </p>

          {/* Sold By */}
          <p className='text-[14px] text-[#707072] mt-2'>
            Sold by{" "}
            <span className='text-[#111111] font-medium'>
              {product.seller.sellerProfile?.shopName ?? "Unknown Shop"}
            </span>
          </p>

          {/* Add to Cart */}
          <button
            disabled={product.stock === 0}
            className='w-full mt-8 bg-[#111111] text-white py-4 rounded-full text-[16px] font-medium hover:bg-[#707072] transition-colors duration-200 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#9E9EA0] disabled:cursor-not-allowed'
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
