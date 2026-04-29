"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  images: string[];
  categories: {
    category: { id: string; name: string };
  }[];
}

const fetchSellerProducts = async (): Promise<Product[]> => {
  const res = await fetch("/api/seller/products");
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

const deleteProduct = async (id: string) => {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
};

const SellerProductPage = () => {
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["seller-products"],
    queryFn: () => fetchSellerProducts(),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-products"] }),
  });

  if (isLoading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-[16px] font-medium text-[#707072]'>Loading...</p>
    </div>
  );
  if (isError) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-[16px] font-medium text-[#D30005]'>Failed to load products.</p>
    </div>
  );
  if (!products) return null;

  return (
    <div className='max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-8 lg:py-12'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-[24px] md:text-[32px] font-medium text-[#111111]'>My Products</h1>
        <Link href='/seller/products/new' className='inline-flex items-center bg-[#111111] text-white px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-[#707072] transition-colors duration-200 no-underline'>
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className='py-20 text-center'>
          <p className='text-[16px] text-[#707072] mb-6'>You haven&apos;t added any products yet.</p>
          <Link href='/seller/products/new' className='inline-flex items-center bg-[#111111] text-white px-8 py-3 rounded-full text-[16px] font-medium hover:bg-[#707072] transition-colors duration-200 no-underline'>
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b border-[#E5E5E5]'>
                <th className='py-3 pr-6 text-[12px] font-medium text-[#707072] uppercase tracking-wide'>Title</th>
                <th className='py-3 pr-6 text-[12px] font-medium text-[#707072] uppercase tracking-wide'>Price</th>
                <th className='py-3 pr-6 text-[12px] font-medium text-[#707072] uppercase tracking-wide'>Stock</th>
                <th className='py-3 pr-6 text-[12px] font-medium text-[#707072] uppercase tracking-wide'>Categories</th>
                <th className='py-3 text-[12px] font-medium text-[#707072] uppercase tracking-wide'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className='border-b border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors duration-150'>
                  <td className='py-4 pr-6 text-[14px] font-medium text-[#111111]'>{product.title}</td>
                  <td className='py-4 pr-6 text-[14px] text-[#111111]'>${product.price.toFixed(2)}</td>
                  <td className='py-4 pr-6 text-[14px] text-[#111111]'>{product.stock}</td>
                  <td className='py-4 pr-6'>
                    <div className='flex flex-wrap gap-1'>
                      {product.categories.map(({ category }) => (
                        <span key={category.id} className='text-[12px] font-medium bg-[#F5F5F5] text-[#707072] px-2.5 py-0.5 rounded-full'>
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='py-4'>
                    <div className='flex items-center gap-3'>
                      <Link href={`/seller/products/${product.id}/edit`} className='text-[14px] font-medium text-[#111111] underline hover:text-[#707072] transition-colors duration-200'>
                        Edit
                      </Link>
                      <button
                        onClick={() => { if (confirm("Delete this product?")) { deleteMutation.mutate(product.id); } }}
                        disabled={deleteMutation.isPending}
                        className='text-[14px] font-medium text-[#D30005] underline hover:text-[#707072] transition-colors duration-200 cursor-pointer disabled:text-[#9E9EA0] disabled:cursor-not-allowed'
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProductPage;
