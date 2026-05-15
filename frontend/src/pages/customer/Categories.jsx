import React, { useState, useEffect } from 'react';
import { LayoutGrid, ChevronRight, Search, ArrowRight } from 'lucide-react';
import { productService } from '../../services/api';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Hero Banner */}
      <div className="bg-brand-navy pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
             <LayoutGrid size={14} /> Global Taxonomy
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
            Shop by <span className="text-indigo-400">Category</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Navigate through our curated collections across all departments. Everything you need, organized perfectly for your convenience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6 mb-12">
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search departments or collections..."
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map(cat => (
              <Link 
                to={`/products?category=${cat.id}`} 
                key={cat.id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all overflow-hidden relative"
              >
                <div className="p-8 pb-32">
                   <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <LayoutGrid size={32} />
                      )}
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">
                      {cat.description || `Explore our premium selection of ${cat.name.toLowerCase()} products.`}
                   </p>
                </div>

                <div className="absolute bottom-8 right-8 flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all">
                   Explore Collection <ArrowRight size={14} />
                </div>

                {/* Subcategories preview if any */}
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute bottom-8 left-8 flex flex-wrap gap-2 max-w-[70%]">
                    {cat.children.slice(0, 3).map(sub => (
                      <span key={sub.id} className="px-3 py-1 bg-slate-50 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:text-indigo-400 transition-colors">
                        {sub.name}
                      </span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-300 mt-1">+{cat.children.length - 3} more</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <LayoutGrid size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Categories Found</h3>
            <p className="text-slate-500 text-sm mb-8">We couldn't find any departments matching your search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="px-8 py-3 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
