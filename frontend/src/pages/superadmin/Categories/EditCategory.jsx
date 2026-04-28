import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../../services/api";
import { Image as ImageIcon } from "lucide-react";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    adminService.getCategories().then((res) => {
      const pList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const found = pList.find((c) => String(c.id) === String(id));
      if (found) {
        setFormData({ name: found.name || "" });
        if (found.image) setImagePreview(found.image);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setFetchLoading(false);
    });
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const uploadData = new FormData();
    uploadData.append("name", formData.name);
    uploadData.append("slug", slug);
    if (imageFile) {
      uploadData.append("image", imageFile);
    }

    try {
      await adminService.updateCategory(id, uploadData);
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to update category", err);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : "Failed to update category";
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-normal text-gray-900">Edit Category</h1>
        <p className="mt-1 text-sm text-gray-500">Update category details including featured images.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Electronics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative mx-auto w-40 h-40 rounded-xl overflow-hidden shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center mt-4">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none py-1 px-3 border border-gray-200 hover:bg-gray-50">
                    <span>{imagePreview ? "Change Image" : "Upload a file"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                {!imagePreview && <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-gray-100 gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
