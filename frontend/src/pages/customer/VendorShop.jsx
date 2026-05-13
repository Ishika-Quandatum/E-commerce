import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { Star, Users, Package, ShieldCheck, Filter, ChevronDown, LayoutGrid, List, Search, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VendorShop = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'newest',
        search: ''
    });

    const [isFollowLoading, setIsFollowLoading] = useState(false);

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
        if (isFollowLoading) return;
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast.error('Please login to follow shops', {
                style: {
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }
            });
            navigate('/login');
            return;
        }

        setIsFollowLoading(true);
        try {
            const res = await vendorService.followVendor(id);
            const isNowFollowing = res.data.following;
            setIsFollowing(isNowFollowing);
            setVendor(prev => ({ ...prev, followers_count: res.data.followers_count }));
            
            if (isNowFollowing) {
                toast.success('Vendor followed successfully', {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                });
            } else {
                toast.success('Vendor unfollowed successfully', {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                });
            }
        } catch (err) {
            console.error("Error following vendor", err);
            if (err.response && err.response.status === 401) {
                toast.error('Session expired. Please login again.', {
                    style: {
                        borderRadius: '10px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                });
                navigate('/login');
            } else {
                toast.error('Failed to update follow status');
            }
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (!vendor) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section / Branding */}
            <div className="relative">
                <div className="h-48 md:h-64 w-full bg-slate-200 overflow-hidden shadow-inner border-b border-white">
                    {vendor.shop_banner ? (
                        <img src={vendor.shop_banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center opacity-10">
                            <ShieldCheck size={100} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 relative">
                    <div className="absolute -top-12 left-4 md:left-8 flex flex-col md:flex-row items-end gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1.5 shadow-2xl border border-slate-100 overflow-hidden shrink-0">
                            {vendor.shop_logo ? (
                                <img src={vendor.shop_logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl">
                                    <ShieldCheck size={40} className="text-primary-600" />
                                </div>
                            )}
                        </div>
                        
                        <div className="mb-2 md:mb-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">{vendor.shop_name}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100">
                                    <ShieldCheck size={10} /> Verified
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px] font-black border border-emerald-100">
                                        {vendor.rating} <Star size={10} fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{vendor.total_ratings} Reviews</span>
                                </div>
                                <div className="w-px h-3 bg-slate-200" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{vendor.followers_count} Followers</span>
                                <div className="w-px h-3 bg-slate-200" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{vendor.products_count} Products</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-4">
                        <button 
                            onClick={handleFollow}
                            disabled={isFollowLoading}
                            className={`px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all shadow-lg flex items-center justify-center min-w-[120px] ${
                                isFollowLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                                isFollowing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30'
                            }`}
                        >
                            {isFollowLoading ? (
                                <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
                            ) : isFollowing ? 'Following' : 'Follow Shop'}
                        </button>
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
