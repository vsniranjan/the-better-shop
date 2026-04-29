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

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["seller-products"],
    queryFn: () => fetchSellerProducts(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["seller-products"] }),
  });

  if (isLoading) return <p className='p-8 text-center'>Loading...</p>;
  if (isError)
    return (
      <p className='p-8 text-center text-red-500'>Failed to load products.</p>
    );
  if (!products) return null;

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>My Products</h1>
        <Link
          href='/seller/products/new'
          className='bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm'
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className='text-gray-500'>No products yet.</p>
      ) : (
        <table className='w-full text-sm border-collapse'>
          <thead>
            <tr className='border-b text-left text-gray-500'>
              <th className='py-3 pr-4'>Title</th>
              <th className='py-3 pr-4'>Price</th>
              <th className='py-3 pr-4'>Stock</th>
              <th className='py-3 pr-4'>Categories</th>
              <th className='py-3'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className='border-b hover:bg-gray-50'>
                <td className='py-3 pr-4 font-medium'>{product.title}</td>
                <td className='py-3 pr-4'>${product.price.toFixed(2)}</td>
                <td className='py-3 pr-4'>{product.stock}</td>
                <td className='py-3 pr-4'>
                  <div className='flex flex-wrap gap-1'>
                    {product.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='py-3'>
                  <div className='flex gap-2'>
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className='text-blue-600 hover:underline'
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Delete this product?")) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className='text-red-500 hover:underline disabled:opacity-50'
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerProductPage;
