import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/api";

const ProductForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    stock: "",
    category: "",
    description: "",
    image: null,
    image_url: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getCategories().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price || "",
        discount_price: initialData.discount_price || "",
        stock: initialData.stock || "",
        category: initialData.category?.id || initialData.category || "",
        description: initialData.description || "",
        image: null,
        image_url: initialData.primary_image || initialData.images?.[0]?.image || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      setError("Please fill all required fields");
      return;
    }
    setError(null);
    
    // Process form data for multipart/form-data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    if (formData.discount_price) data.append("discount_price", formData.discount_price);
    data.append("stock", formData.stock);
    if (formData.category) data.append("category", formData.category);
    if (formData.description) data.append("description", formData.description);
    if (formData.image) data.append("image", formData.image);

    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{initialData.id ? 'Edit Product' : 'Add New Product'}</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="e.g. Wireless Headphones"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Detailed product description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input
              type="number"
              name="price"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
            <input
              type="number"
              name="discount_price"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="0.00"
              value={formData.discount_price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="100"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            {formData.image_url && !formData.image && (
              <div className="mb-3">
                <img src={formData.image_url} alt="Current" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end border-t border-gray-100 gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {initialData.id ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
