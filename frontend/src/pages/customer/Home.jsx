import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Globe, RefreshCcw, Banknote, Tag, Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, Search, ChevronUp } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import HomeBanner from '../../components/Home/HomeBanner';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  const [filters, setFilters] = useState({
    category: [],
    priceRange: [0, 100000],
    rating: 0,
    search: '',
    sort: 'relevance'
  });

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const catRes = await productService.getCategories();
        // Handle both paginated and non-paginated responses
        const categoryData = Array.isArray(catRes.data) ? catRes.data : (catRes.data.results || []);
        setCategories(categoryData);
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const params = {
          is_featured: true,
          category: filters.category.join(','),
          search: filters.search,
          max_price: filters.priceRange[1],
          sort: filters.sort
        };
        const res = await productService.getProducts(params);
        // Handle both paginated and non-paginated responses
        const productData = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setFeaturedProducts(productData);
      } catch (err) {
        console.error("Error fetching home products", err);
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [filters]);

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

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-primary-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Promotional Banner System */}
      <div className='pt-0'><HomeBanner /></div>
      
      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 mt-2">
        <div className="border border-pink-200 rounded-lg py-4 px-6 bg-white shadow-sm flex flex-wrap justify-between items-center text-sm font-medium text-brand-navy">
          <div className="flex items-center gap-2 flex-1 justify-center border-r border-pink-100 last:border-0">
            <RefreshCcw size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">7 Days Easy Return</span>
            <span className="sm:hidden text-xs">Easy Return</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-center border-r border-pink-100 last:border-0">
            <Banknote size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">Cash on Delivery</span>
            <span className="sm:hidden text-xs">COD</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Tag size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">Lowest Prices</span>
            <span className="sm:hidden text-xs">Lowest Price</span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl text-slate-800 font-semibold mb-4">Featured Categories</h2>
          </div>
          <Link to="/categories" className="text-brand-purple font-semibold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            See All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-8 sm:gap-12 lg:gap-16">
          {categories.slice(0, 8).map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug || cat.id}`} className="group flex flex-col items-center w-[80px] sm:w-[100px] transition-all hover:-translate-y-1">
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden shadow-sm border border-slate-100 group-hover:border-brand-purple group-hover:shadow-lg transition-all duration-300 bg-white mb-3">
                <img
                  src={cat.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=60&w=400`}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-center text-xs sm:text-sm font-semibold text-brand-navy group-hover:text-brand-purple transition-colors leading-tight line-clamp-2">{cat.name}</h3>
            </Link>
          ))}
          {categories.length === 0 && Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center w-[80px] sm:w-[100px]">
               <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-slate-100 rounded-full animate-pulse mb-3"></div>
               <div className="h-3 w-16 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Products For You */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl text-slate-800 font-semibold mb-6">Products For You</h2>

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
            {loadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {!loadingProducts && featuredProducts.length === 0 && (
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
      </section>
    </div>
  );
};

export default Home;
