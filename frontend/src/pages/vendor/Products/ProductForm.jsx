import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../../../services/api";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Box, 
  DollarSign, 
  Info, 
  Image as ImageIcon, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Download,
  X,
  FileQuestion,
  Loader2
} from "lucide-react";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

const ProductForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showBrandInput, setShowBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showSubcategoryInput, setShowSubcategoryInput] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    description: "",
    full_description: "",
    price: "",
    discount_price: "",
    discount_type: "Percentage (%)",
    tax: "",
    shipping_charge: "",
    stock: "",
    quantity: "1",
    unit: "pcs",
    sku: "",
    status: "Active",
    images: [],
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState(null);
  
  // Bulk Upload State
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminService.getCategories().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    }).catch(err => console.error(err));
    adminService.getBrands().then((res) => {
      setBrands(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(c => c.id === parseInt(formData.category) || c.id === formData.category);
      if (selectedCategory && selectedCategory.children) {
        setSubcategories(selectedCategory.children);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [formData.category, categories]);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await adminService.createBrand({ name: newBrandName });
      setBrands([...brands, res.data]);
      setFormData({ ...formData, brand: res.data.id });
      setShowBrandInput(false);
      setNewBrandName("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create brand");
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim() || !formData.category) return;
    try {
      const res = await adminService.createCategory({ name: newSubcategoryName, parent: formData.category });
      setSubcategories([...subcategories, res.data]);
      setFormData({ ...formData, subcategory: res.data.id });
      setShowSubcategoryInput(false);
      setNewSubcategoryName("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create subcategory");
    }
  };

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        brand: initialData.brand || "",
        category: initialData.category?.id || initialData.category || "",
        subcategory: initialData.subcategory || "",
        description: initialData.description || "",
        full_description: initialData.full_description || "",
        price: initialData.price || "",
        discount_price: initialData.discount_price || "",
        discount_type: initialData.discount_type || "Percentage (%)",
        tax: initialData.tax || "",
        shipping_charge: initialData.shipping_charge || "",
        stock: initialData.stock || "",
        quantity: initialData.quantity || "1",
        unit: ["g", "kg", "ml", "l", "pcs"].includes(initialData.unit?.toLowerCase()) ? initialData.unit.toLowerCase() : "pcs",
        sku: initialData.sku || "",
        status: initialData.status || "Active",
        images: [],
      });
      if (initialData.images && initialData.images.length > 0) {
        setPreviewUrls(initialData.images.map(img => img.image));
      } else if (initialData.primary_image) {
        setPreviewUrls([initialData.primary_image]);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const maxAllowed = 5 - formData.images.length;
      const newFiles = files.slice(0, maxAllowed);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setFormData({ ...formData, images: [...formData.images, ...newFiles] });
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setPreviewUrls(newPreviewUrls);
  };

  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Product Title': "Premium Quality Product Name",
      'Description': "Full detailed description of the product.",
      'Quantity': "1",
      'Unit': "pcs",
      'Category': "Electronics",
      'Regular Price': "49.99",
      'Offer Price': "39.99",
      'Stock': "100",
      'Image': "https://example.com/image.png"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Vendor_Bulk_Template.xlsx");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processBulkFile(e.dataTransfer.files[0]);
    }
  };

  const handleExcelUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processBulkFile(e.target.files[0]);
    }
  };

  const processBulkFile = async (file) => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
       setUploadStatus('error');
       setError("Invalid file type. Please upload a .xlsx or .csv file.");
       return;
    }

    setUploadStatus('uploading');
    setUploadResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await adminService.bulkUploadProducts(formData);
      setUploadStatus('success');
      setUploadResult({
        created: response.data.created,
        updated: response.data.updated,
        message: response.data.message
      });
      setTimeout(() => {
        navigate('/vendor/products');
      }, 3000);
    } catch (err) {
      setUploadStatus('error');
      setError(err.response?.data?.error || "An error occurred during bulk upload.");
    }
  };

  const validate = () => {
    if (!formData.name) return "Product Name is required";
    if (parseFloat(formData.price) <= 0) return "Price must be greater than 0";
    if (parseInt(formData.stock) < 0) return "Stock cannot be negative";
    if (parseFloat(formData.quantity) <= 0) return "Quantity must be greater than 0";
    if (!formData.category) return "Please select a category";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        formData.images.forEach(file => {
          data.append('images', file);
        });
      } else if (key === 'shipping_charge') {
        data.append(key, formData[key] === "" ? "0" : formData[key]);
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  const getStockStatus = () => {
    const s = parseInt(formData.stock) || 0;
    if (s === 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-100" };
    if (s < 10) return { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "In Stock", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-5xl mx-auto mb-12 space-y-10">
      
      {/* BULK UPLOAD SECTION (Only visible when creating new) */}
      {!initialData.id && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
          <div className="p-8 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Bulk Bulk Excel Upload</h3>
                  <p className="text-sm text-slate-500 font-medium">Upload up to 500 products instantly via a spreadsheet.</p>
                </div>
             </div>
             <button 
               type="button" 
               onClick={downloadSampleTemplate}
               className="hidden md:flex items-center gap-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
             >
               <Download size={14} /> Download Final Template
             </button>
          </div>

          <div className="p-8">
             <div 
               onDragEnter={handleDrag}
               onDragLeave={handleDrag}
               onDragOver={handleDrag}
               onDrop={handleDrop}
               className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[250px]
                 ${dragActive ? 'border-primary-500 bg-primary-50/50 scale-[1.01]' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200'}
                 ${uploadStatus === 'uploading' ? 'opacity-80 pointer-events-none' : ''}
               `}
             >
               <input 
                 type="file" 
                 accept=".csv, .xlsx, .xls" 
                 onChange={handleExcelUpload} 
                 className="hidden" 
                 ref={fileInputRef} 
               />

               {uploadStatus === 'uploading' ? (
                 <div className="flex flex-col items-center space-y-4">
                   <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                   <h4 className="text-lg font-black text-slate-900">Processing Your Inventory...</h4>
                   <p className="text-slate-500 text-sm">Please do not close this window.</p>
                 </div>
               ) : uploadStatus === 'success' && uploadResult ? (
                 <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-500">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                     <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <h4 className="text-xl font-black text-slate-900">Successfully Uploaded!</h4>
                   <div className="flex items-center justify-center gap-6 text-sm font-bold mt-2">
                      <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
                         {uploadResult.created} Created
                      </div>
                      <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100">
                         {uploadResult.updated} Updated
                      </div>
                   </div>
                   <p className="text-slate-500 text-xs mt-4">Redirecting you to the catalog...</p>
                 </div>
               ) : (
                 <>
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors shadow-lg
                     ${dragActive ? 'bg-primary-600 text-white shadow-primary-500/30' : 'bg-white text-indigo-500 shadow-slate-200/50'}
                   `}>
                     <Upload size={36} />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-2">Drag & Drop your Excel file here</h4>
                   <p className="text-slate-500 text-sm max-w-sm mb-8">
                     Supported formats: .xlsx, .csv. First row must contain valid template headers.
                   </p>
                   <button 
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                   >
                     Select File from Device
                   </button>
                   <button 
                     type="button" 
                     onClick={downloadSampleTemplate}
                     className="md:hidden mt-4 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                   >
                     Download Sample Template
                   </button>
                 </>
               )}
             </div>

             {uploadStatus === 'error' && error && (
                <div className="mt-6 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
             )}
          </div>
        </div>
      )}

      {/* VISUAL SEPARATOR */}
      {!initialData.id && (
        <div className="flex items-center gap-4 py-4">
           <div className="h-px bg-slate-200 flex-1"></div>
           <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">OR ENTER MANUALLY</div>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>
      )}

      {/* SINGLE ENTRY FORM */}
      <div className="opacity-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialData.id ? 'Refine Single Product' : 'Create New Offering'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Capture the details of an individual stock item.</p>
          </div>
        </div>

        {error && uploadStatus !== 'error' && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Basic Info & Pricing */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Basic Information */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Basic Information</h3>
                    <p className="text-slate-500 text-xs">Add basic details about your product</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Product Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                      placeholder="e.g. Premium Organic Basmati Rice"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-slate-700">Brand</label>
                       <button type="button" onClick={() => setShowBrandInput(!showBrandInput)} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:text-indigo-700"><Plus size={14}/> {showBrandInput ? "Cancel" : "Add New Brand"}</button>
                    </div>
                    {showBrandInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                          placeholder="Enter new brand name"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                        />
                        <button type="button" onClick={handleCreateBrand} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Add</button>
                      </div>
                    ) : (
                      <select
                        name="brand"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm appearance-none"
                        value={formData.brand}
                        onChange={handleChange}
                      >
                        <option value="">Select Brand</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                      <select
                        name="category"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm appearance-none"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-700">Subcategory</label>
                        {formData.category && (
                           <button type="button" onClick={() => setShowSubcategoryInput(!showSubcategoryInput)} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:text-indigo-700"><Plus size={14}/> {showSubcategoryInput ? "Cancel" : "Add New Subcategory"}</button>
                        )}
                      </div>
                      {showSubcategoryInput ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                            placeholder="Enter new subcategory"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                          />
                          <button type="button" onClick={handleCreateSubcategory} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Add</button>
                        </div>
                      ) : (
                        <select
                          name="subcategory"
                          className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm appearance-none"
                          value={formData.subcategory}
                          onChange={handleChange}
                        >
                          <option value="">Select Subcategory</option>
                          {subcategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400 resize-none"
                          placeholder="Add a short description of your product"
                          value={formData.description}
                          onChange={handleChange}
                        />
                        <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">{formData.description.length}/150</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Full Description</label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex gap-3 text-slate-600">
                             <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm border border-slate-200 cursor-pointer">Normal</span>
                             <span className="font-serif font-bold cursor-pointer hover:text-indigo-600">B</span>
                             <span className="font-serif italic cursor-pointer hover:text-indigo-600">I</span>
                             <span className="underline cursor-pointer hover:text-indigo-600">U</span>
                        </div>
                        <div className="relative">
                            <textarea
                              name="full_description"
                              rows={5}
                              className="w-full bg-white px-4 py-3 border-none outline-none text-slate-900 text-sm placeholder:text-slate-400 resize-none"
                              placeholder="Tell your customers what makes this product special..."
                              value={formData.full_description}
                              onChange={handleChange}
                            />
                            <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">{formData.full_description.length}/2000</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Offers */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Pricing & Offers</h3>
                    <p className="text-slate-500 text-xs">Set pricing details for your product</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Regular Price (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        name="price"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Offer Price (₹)</label>
                      <input
                        type="number"
                        name="discount_price"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                        placeholder="Leave blank if no discount"
                        value={formData.discount_price}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Discount Type</label>
                      <select
                        name="discount_type"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm appearance-none"
                        value={formData.discount_type}
                        onChange={handleChange}
                      >
                        <option value="Percentage (%)">Percentage (%)</option>
                        <option value="Flat">Flat</option>
                      </select>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-700 mb-2">Discount Value</label>
                      <input
                        type="number"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none text-slate-900 text-sm pr-8 bg-slate-50 cursor-not-allowed"
                        placeholder="0"
                        readOnly
                        value={formData.price && formData.discount_price ? Math.round(((formData.price - formData.discount_price)/formData.price)*100) : 0}
                      />
                      <span className="absolute top-[2.3rem] right-4 text-slate-500 font-bold">%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Tax (%)</label>
                      <input
                        type="number"
                        name="tax"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm"
                        placeholder="Enter tax percentage"
                        value={formData.tax}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Shipping Charge (₹)</label>
                      <input
                        type="number"
                        name="shipping_charge"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                        placeholder="Leave 0 for free shipping"
                        value={formData.shipping_charge}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 flex flex-col justify-center border border-indigo-100">
                        <span className="text-[11px] font-bold text-indigo-600 mb-1">You Will Receive</span>
                        <span className="text-xl lg:text-2xl font-black text-indigo-700 break-all leading-tight">₹{(
                             (parseFloat(formData.discount_price || formData.price || 0)) +
                             parseFloat(formData.shipping_charge || 0) -
                             ((parseFloat(formData.discount_price || formData.price || 0)) * (parseFloat(formData.tax || 0)/100))
                        ).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-500 mt-1">After discount & tax</span>
                    </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Inventory & Media */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Inventory & Stock */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <Box size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Inventory & Stock</h3>
                    <p className="text-slate-500 text-xs">Manage your product stock and quantity</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Total Stock <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="stock"
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm"
                      placeholder="Enter total stock"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                    {!formData.stock || parseInt(formData.stock) === 0 ? (
                        <div className="absolute top-[2.1rem] right-3 bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold border border-red-100">Out of Stock</div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Quantity / Item <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        name="quantity"
                        step="0.01"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm"
                        value={formData.quantity}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Unit <span className="text-red-500">*</span></label>
                      <select
                        name="unit"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm appearance-none"
                        value={formData.unit}
                        onChange={handleChange}
                      >
                        <option value="g">Grams (g)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="l">Liter (l)</option>
                        <option value="pcs">Pieces (pcs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">SKU (Optional)</label>
                    <input
                      type="text"
                      name="sku"
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 text-sm placeholder:text-slate-400"
                      placeholder="Enter SKU code"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-3">Product Status</label>
                     <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, status: "Active"})}
                            className={clsx("flex-1 py-2.5 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all", formData.status === "Active" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                        >
                            <CheckCircle2 size={16} className={formData.status === "Active" ? "text-white" : "text-slate-400"} /> Active
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, status: "Inactive"})}
                            className={clsx("flex-1 py-2.5 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all", formData.status === "Inactive" ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                        >
                            <X size={16} className={formData.status === "Inactive" ? "text-slate-800" : "text-slate-400"} /> Inactive
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Product Images</h3>
                    <p className="text-slate-500 text-xs">Upload clear images of your product</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center py-10 px-4 rounded-[1.5rem] border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50 transition-all cursor-pointer group text-center">
                    <Upload size={32} className="text-indigo-600 mb-3" />
                    <span className="text-sm font-bold text-slate-900">Drag & drop images here</span>
                    <span className="text-sm text-slate-500 mb-2">or click to browse</span>
                    <span className="text-[10px] text-slate-400">Supports: JPG, PNG, WebP (Max 5MB) each</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>

                  <div className="grid grid-cols-5 gap-3">
                     {[...Array(5)].map((_, index) => (
                       <div key={index} className={`aspect-square rounded-xl border-2 ${index < previewUrls.length ? 'border-indigo-100 relative group overflow-hidden' : index === previewUrls.length ? 'border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors' : 'border-slate-100 flex items-center justify-center text-slate-300'}`}>
                         {index < previewUrls.length ? (
                           <>
                             <img src={previewUrls[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                             <button 
                                 type="button"
                                 onClick={() => removeImage(index)}
                                 className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                             >
                                 <X size={20} />
                             </button>
                           </>
                         ) : index === previewUrls.length ? (
                           <label className="w-full h-full flex items-center justify-center cursor-pointer">
                             <Plus size={24} />
                             <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                           </label>
                         ) : (
                           <ImageIcon size={24} />
                         )}
                       </div>
                     ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-40 bg-white border-t border-slate-200 px-8 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-all text-sm"
            >
                Cancel
            </button>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all text-sm"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading || uploadStatus === 'uploading'}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 min-w-[160px]"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {initialData.id ? 'Save & Publish' : 'Save & Publish'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
