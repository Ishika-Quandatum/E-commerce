import React, { useState } from "react";
import ProductForm from "./ProductForm";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await adminService.createProduct(data);
      navigate("/vendor/products");
    } catch (err) {
      console.error("Failed to add product", err);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new product for your store.</p>
      </div>
      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddProduct;
