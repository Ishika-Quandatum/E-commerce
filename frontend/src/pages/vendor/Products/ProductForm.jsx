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
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    stock: "",
    quantity: "1",
    unit: "pcs",
    category: "",
    description: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
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
  }, []);

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price || "",
        discount_price: initialData.discount_price || "",
        stock: initialData.stock || "",
        quantity: initialData.quantity || "1",
        unit: initialData.unit || "pcs",
        category: initialData.category?.id || initialData.category || "",
        description: initialData.description || "",
        image: null,
      });
      setPreviewUrl(initialData.primary_image || initialData.images?.[0]?.image || "");
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Product Title': "Premium Quality Product Name",
      'Description': "Full detailed description of the product.",
      'Quantity': "1",
      'Unit': "pcs",
      'Category': "Electronics",
      'Retail Price': "49.99",
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
      if (formData[key] !== null && formData[key] !== "") {
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Details Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Basic Info Section */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Basic Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Product Title *</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                      placeholder="e.g. Premium Organic Basmati Rice"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Rich Description</label>
                    <textarea
                      name="description"
                      rows={5}
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300 resize-none"
                      placeholder="Tell your customers what makes this product special..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Commercial Strategy</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  <div className="relative">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Retail Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {formData.price && formData.discount_price && parseFloat(formData.discount_price) < parseFloat(formData.price) && (
                    <div className="absolute top-[3.25rem] left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-emerald-500/20 border-2 border-white animate-bounce-subtle">
                      {Math.round(((parseFloat(formData.price) - parseFloat(formData.discount_price)) / parseFloat(formData.price)) * 100)}% SAVINGS
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Offer Price (₹)</label>
                    <input
                      type="number"
                      name="discount_price"
                      step="0.01"
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                      placeholder="Leave blank for no discount"
                      value={formData.discount_price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              
              {/* Inventory Section */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <Box size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Inventory & Logistics</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Stock Units *</label>
                      <span className={clsx("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", stockStatus.color)}>
                        {stockStatus.label}
                      </span>
                    </div>
                    <input
                      type="number"
                      name="stock"
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-50 transition-all outline-none text-slate-900 font-black"
                      placeholder="Quantity in warehouse"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1 text-center">Qty / Item</label>
                      <input
                        type="number"
                        name="quantity"
                        step="0.01"
                        className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-400 transition-all outline-none text-slate-900 font-bold text-center"
                        value={formData.quantity}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1 text-center">Metric Unit</label>
                      <select
                        name="unit"
                        className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-400 transition-all outline-none text-slate-900 font-bold text-center appearance-none cursor-pointer"
                        value={formData.unit}
                        onChange={handleChange}
                      >
                        <option value="g">Grams</option>
                        <option value="kg">Kilos</option>
                        <option value="ml">ML</option>
                        <option value="l">Liters</option>
                        <option value="pcs">Pieces</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Classification</label>
                    <select
                      name="category"
                      className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-slate-900 font-bold cursor-pointer"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Choose Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                    <ImageIcon size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Visual Media</h3>
                </div>

                <div className="relative group">
                  {previewUrl ? (
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden group border-4 border-slate-50">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                      <button 
                        type="button"
                        onClick={() => { setFormData({ ...formData, image: null }); setPreviewUrl(""); }}
                        className="absolute top-4 right-4 w-10 h-10 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        <Upload size={32} />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Select Asset</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Global Actions */}
          <div className="sticky bottom-8 left-0 right-0 z-40 px-8 py-6 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10 ring-8 ring-slate-900/10">
            <div className="hidden sm:flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/50">
                <Box size={24} />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm truncate max-w-[200px]">{formData.name || 'Untitled Draft'}</div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest italic leading-none">{stockStatus.label}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-3.5 rounded-2xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm grow sm:grow-0"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading || uploadStatus === 'uploading'}
                className="flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 min-w-[200px] grow sm:grow-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {initialData.id ? 'Commit Changes' : 'Finalize & Post'}
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
