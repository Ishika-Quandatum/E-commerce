import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const [filters, setFilters] = useState({
    category: initialCategory,
    priceRange: [0, 5000],
    rating: 0,
    search: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, location.search]);

  const fetchInitialData = async () => {
    try {
      const catRes = await productService.getCategories();
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: filters.category,
        search: filters.search,
        // Backend filtering logic will handle these
      };
      const res = await productService.getProducts(params);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <div className="flex items-center gap-2 font-bold mb-4 text-slate-800">
              <Filter size={20} />
              <span>Filters</span>
            </div>

            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilters({ ...filters, category: '' })}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === '' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters({ ...filters, category: cat.id })}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category == cat.id ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [0, e.target.value] })}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>$0</span>
                    <span>Up to ${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">Min Rating</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilters({ ...filters, rating: star })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${filters.rating === star ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {products.length} Products Found
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  <List size={20} />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
                Sort by: Featured <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters to find what you're looking for.</p>
              <button
                onClick={() => setFilters({ category: '', priceRange: [0, 5000], rating: 0, search: '' })}
                className="text-primary-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;
