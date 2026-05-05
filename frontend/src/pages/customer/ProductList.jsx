import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, Search, ChevronUp } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') ? queryParams.get('category').split(',') : [];

  const [filters, setFilters] = useState({
    category: initialCategory,
    priceRange: [0, 100000],
    rating: 0,
    search: '',
    sort: 'relevance'
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
      const categoryData = Array.isArray(catRes.data) ? catRes.data : (catRes.data.results || []);
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: filters.category.join(','),
        search: filters.search,
        max_price: filters.priceRange[1],
        min_rating: filters.rating > 0 ? filters.rating : undefined,
        sort: filters.sort
      };
      const res = await productService.getProducts(params);
      const productData = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setProducts(productData);
    } catch (err) {
      console.error("Error fetching products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setFilters(prev => {
      const currentCategories = [...prev.category];
      const index = currentCategories.indexOf(categoryId.toString());
      if (index > -1) {
        currentCategories.splice(index, 1);
      } else {
        currentCategories.push(categoryId.toString());
      }
      return { ...prev, category: currentCategories };
    });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price Low to High' },
    { value: 'price_desc', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'popularity', label: 'Popularity' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Heading */}
      <h1 className="text-3xl text-slate-800 font-semibold mb-6">Products For You</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar area */}
        <div className="w-full md:w-[280px] shrink-0 space-y-4">
          
          {/* Top Sort Bar - Mobile/Desktop */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm relative group z-20">
            <button className="flex items-center justify-between w-full text-sm text-slate-700 font-medium">
              <span>Sort by : <span className="font-bold text-slate-900">{sortOptions.find(o => o.value === filters.sort)?.label}</span></span>
              <ChevronDown size={18} className="text-slate-500" />
            </button>
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
              <div className="py-2">
                {sortOptions.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => setFilters({ ...filters, sort: option.value })} 
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${filters.sort === option.value ? 'bg-slate-50 text-primary-600 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Filters */}
          <aside className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">FILTERS</h2>
              <p className="text-xs text-slate-500 mt-1">1000+ Products</p>
            </div>

            <div className="p-4 space-y-6">
              {/* Category Filter Section */}
              <div className="border-b border-slate-100 pb-6">
                <div 
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <h4 className="font-semibold text-[15px] text-slate-800 uppercase">Category</h4>
                  {isCategoryOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </div>
                
                {isCategoryOpen && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search" 
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {filteredCategories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters.category.includes(cat.id.toString()) || filters.category.includes(cat.slug)}
                            onChange={() => handleCategoryToggle(cat.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                        </label>
                      ))}
                      {filteredCategories.length === 0 && (
                        <p className="text-sm text-slate-500 italic text-center py-2">No categories found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="border-b border-slate-100 pb-6">
                <h4 className="font-semibold text-[15px] text-slate-800 uppercase mb-4">Price Range</h4>
                <div className="space-y-4 px-1">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="500"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>₹0</span>
                    <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-[15px] text-slate-800 uppercase mb-4">Min Rating</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilters({ ...filters, rating: filters.rating === star ? 0 : star })}
                      className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium transition-all ${filters.rating === star ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6"}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters to find what you're looking for.</p>
              <button
                onClick={() => setFilters({ category: [], priceRange: [0, 100000], rating: 0, search: '', sort: 'relevance' })}
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
