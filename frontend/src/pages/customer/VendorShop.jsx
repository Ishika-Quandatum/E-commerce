import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { Star, Users, Package, ShieldCheck, Filter, ChevronDown, LayoutGrid, List, Search, ChevronRight } from 'lucide-react';

const VendorShop = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'newest',
        search: ''
    });

    useEffect(() => {
        fetchVendorData();
    }, [id]);

    useEffect(() => {
        fetchVendorProducts();
    }, [id, filters]);

    const fetchVendorData = async () => {
        try {
            const res = await vendorService.getVendorDetail(id);
            setVendor(res.data);
            
            const followRes = await vendorService.isFollowing(id);
            setIsFollowing(followRes.data.is_following);
        } catch (err) {
            console.error("Error fetching vendor data", err);
        }
    };

    const fetchVendorProducts = async () => {
        setLoading(true);
        try {
            const res = await vendorService.getVendorProducts(id, {
                sort: filters.sort,
                search: filters.search
            });
            const productData = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setProducts(productData);
        } catch (err) {
            console.error("Error fetching vendor products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            const res = await vendorService.followVendor(id);
            setIsFollowing(res.data.status === 'followed');
            setVendor(prev => ({ ...prev, followers_count: res.data.followers_count }));
        } catch (err) {
            console.error("Error following vendor", err);
        }
    };

    if (!vendor) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Vendor Header (Meesho Style) */}
            <div className="bg-white border-b border-slate-200 shadow-sm pt-8 pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <span className="font-bold text-slate-800">{vendor.shop_name} Shop</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Profile Info */}
                        <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                                {vendor.avatar ? (
                                    <img src={vendor.avatar} alt={vendor.shop_name} className="w-full h-full object-cover" />
                                ) : (
                                    <ShieldCheck size={40} className="text-primary-600" />
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{vendor.shop_name}</h1>
                                    <ShieldCheck size={20} className="text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                                    <div className="text-center">
                                        <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md flex items-center gap-1 text-sm font-bold border border-emerald-100">
                                            {vendor.rating} <Star size={14} fill="currentColor" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{vendor.total_ratings.toLocaleString()} Ratings</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-900 leading-none">{vendor.followers_count.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Followers</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-900 leading-none">{vendor.products_count.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Products</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button 
                                onClick={handleFollow}
                                className={`px-8 h-12 rounded-lg font-bold text-sm transition-all shadow-sm ${isFollowing ? 'bg-slate-100 text-slate-600' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button className="px-6 h-12 border border-slate-200 bg-white rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                                Share Shop
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <aside className="w-full md:w-64 shrink-0 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4">Shop Search</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search in this shop" 
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4">Sort By</h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'newest', label: 'Newest First' },
                                    { id: 'popularity', label: 'Popularity' },
                                    { id: 'price_asc', label: 'Price: Low to High' },
                                    { id: 'price_desc', label: 'Price: High to Low' }
                                ].map(option => (
                                    <button 
                                        key={option.id}
                                        onClick={() => setFilters({ ...filters, sort: option.id })}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.sort === option.id ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">All Products</h2>
                            <p className="text-sm text-slate-500 font-medium">{products.length} products found</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-2xl border border-slate-100 shadow-sm"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {products.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {products.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Package size={40} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">No products found</h3>
                                        <p className="text-slate-500 mb-8">This vendor hasn't uploaded any products matching your search.</p>
                                        <button 
                                            onClick={() => setFilters({ sort: 'newest', search: '' })}
                                            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default VendorShop;
