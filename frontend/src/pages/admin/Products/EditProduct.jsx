import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import { adminService } from "../../../services/api";

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setFetchLoading(true);
    // Ideally use a getProductById endpoint, falling back to full list and find
    adminService.getProducts().then((res) => {
      const pList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const found = pList.find((p) => String(p.id) === String(id));
      setProduct(found);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setFetchLoading(false);
    });
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await adminService.updateProduct(id, data);
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to update product", err);
      // Wait to see if error provides more info
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : "Failed to update product";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-1 text-sm text-gray-500">Update product information and stock.</p>
      </div>
      <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default EditProduct;