import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, Search, ChevronUp, ChevronRight } from 'lucide-react';
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
  const initialSubCategory = queryParams.get('subcategory') ? queryParams.get('subcategory').split(',') : [];

  const [filters, setFilters] = useState({
    category: initialCategory,
    subcategory: initialSubCategory,
    priceRange: [0, 100000],
    rating: 0,
    search: '',
    sort: 'relevance'
  });

  // Re-sync filters when URL changes (e.g. clicking from navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') ? params.get('category').split(',') : [];
    const sub = params.get('subcategory') ? params.get('subcategory').split(',') : [];
    
    setFilters(prev => ({
      ...prev,
      category: cat,
      subcategory: sub
    }));
  }, [location.search]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, location.search]);

  const fetchInitialData = async () => {
    try {
      const catRes = await productService.getCategories({ top_level: 'true' });
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
        subcategory: filters.subcategory.join(','),
        search: filters.search,
        max_price: filters.priceRange[1],
        rating: filters.rating > 0 ? filters.rating : undefined,
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

  const handleCategoryToggle = (catId, catSlug) => {
    setFilters(prev => {
      let currentCategories = [...prev.category];
      const hasId = currentCategories.includes(catId.toString());
      const hasSlug = catSlug && currentCategories.includes(catSlug);
      
      if (hasId || hasSlug) {
        currentCategories = currentCategories.filter(c => c !== catId.toString() && c !== catSlug);
      } else {
        currentCategories.push(catId.toString());
      }
      // Clear subcategories when switching/adding main categories from sidebar to avoid impossible filter combinations
      return { ...prev, category: currentCategories, subcategory: [] };
    });
  };

  const handleSubCategoryToggle = (subId, subSlug) => {
    setFilters(prev => {
      let currentSubCategories = [...prev.subcategory];
      const hasId = currentSubCategories.includes(subId.toString());
      const hasSlug = subSlug && currentSubCategories.includes(subSlug);
      
      if (hasId || hasSlug) {
        currentSubCategories = currentSubCategories.filter(s => s !== subId.toString() && s !== subSlug);
      } else {
        currentSubCategories.push(subId.toString());
      }
      return { ...prev, subcategory: currentSubCategories };
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
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-white p-3 rounded-lg border border-slate-100">
        <Link to="/" className="hover:text-primary-600 transition-colors cursor-pointer">Home</Link> <ChevronRight size={12} />
        {filters.category.length > 0 || filters.subcategory.length > 0 ? (
          <>
            <Link to="/products" className="hover:text-primary-600 transition-colors cursor-pointer" onClick={() => setFilters({...filters, category: [], subcategory: []})}>Products</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-800">
              {[
                ...categories.filter(c => filters.category.includes(c.id.toString()) || filters.category.includes(c.slug)),
                ...categories.flatMap(c => c.children || []).filter(s => filters.subcategory.includes(s.id.toString()) || filters.subcategory.includes(s.slug))
              ].map(c => c.name).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
            </span>
          </>
        ) : (
          <span className="font-bold text-slate-800">Products</span>
        )}
      </div>

      {/* Top Heading */}
      <h1 className="text-3xl text-slate-800 font-semibold mb-6">Products For You</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar area */}
        <div className="w-full md:w-[280px] shrink-0 space-y-4">
          
          {/* Top Sort Bar - Mobile/Desktop */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm relative group z-20">
            <button className="flex items-center justify-between w-full text-sm text-slate-700 font-medium cursor-pointer">
              <span>Sort by : <span className="font-bold text-slate-900">{sortOptions.find(o => o.value === filters.sort)?.label}</span></span>
              <ChevronDown size={18} className="text-slate-500" />
            </button>
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
              <div className="py-2">
                {sortOptions.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => setFilters({ ...filters, sort: option.value })} 
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${filters.sort === option.value ? 'bg-slate-50 text-primary-600 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
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
                    
                    <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {filteredCategories.map(cat => (
                        <div key={cat.id} className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={filters.category.includes(cat.id.toString()) || (cat.slug && filters.category.includes(cat.slug))}
                              onChange={() => handleCategoryToggle(cat.id, cat.slug)}
                              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{cat.name}</span>
                          </label>

                          {/* Nested Subcategories */}
                          {(filters.category.includes(cat.id.toString()) || (cat.slug && filters.category.includes(cat.slug))) && cat.children && cat.children.length > 0 && (
                            <div className="ml-7 space-y-2 pb-1 border-l-2 border-slate-50 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                              {cat.children.map(sub => (
                                <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={filters.subcategory.includes(sub.id.toString()) || (sub.slug && filters.subcategory.includes(sub.slug))}
                                    onChange={() => handleSubCategoryToggle(sub.id, sub.slug)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-primary-500 focus:ring-primary-400 cursor-pointer"
                                  />
                                  <span className="text-xs text-slate-500 group-hover:text-slate-800 transition-colors">{sub.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
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
                onClick={() => setFilters({ category: [], subcategory: [], priceRange: [0, 100000], rating: 0, search: '', sort: 'relevance' })}
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
