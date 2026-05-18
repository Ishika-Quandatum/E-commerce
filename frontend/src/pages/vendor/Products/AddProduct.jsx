import React, { useState } from "react";
import ProductForm from "./ProductForm";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Plus } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("manual"); // "manual" or "excel"

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
    <div className="max-w-5xl mx-auto space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Add Product</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium italic">Create a new product for your store.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeView === "manual" ? (
            <button 
              onClick={() => setActiveView("excel")}
              className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Import Excel Sheet
            </button>
          ) : (
            <button 
              onClick={() => setActiveView("manual")}
              className="inline-flex items-center gap-2 justify-center rounded-xl border-2 border-indigo-600 bg-indigo-50 text-indigo-700 px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              Manual Entry
            </button>
          )}
        </div>
      </div>
      <ProductForm onSubmit={handleSubmit} loading={loading} activeView={activeView} />
    </div>
  );
};

export default AddProduct;
