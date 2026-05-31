import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSearch, LuShoppingCart, LuPlus } from 'react-icons/lu';
import { marketplaceAPI } from '../../API/axiosInstance';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';

const CropMarket = () => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart(user?.id);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await marketplaceAPI.getCropMarketProducts();
        setProducts(data.products || data);
      } catch (error) {
        console.error('Failed to load crop market products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((product) =>
    product.title?.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">Crop Market</p>
          <h1 className="text-4xl font-bold">Fresh Produce & Farm Goods</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crops..."
              className="w-full rounded-3xl border border-border-default bg-surface-card py-3 pl-11 pr-4 text-sm text-text-main shadow-sm outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => navigate('/track-orders')}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LuShoppingCart /> View Cart ({cart.length})
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-border-default bg-surface-card p-8 text-center">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-border-default bg-surface-card p-8 text-center">No crop products found.</div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="rounded-3xl border border-border-default bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-text-main">{product.title}</h2>
                  <p className="text-sm text-text-muted mt-1">{product.category || 'Crop'}</p>
                </div>
                <span className="rounded-2xl bg-primary-light px-3 py-1 text-sm font-semibold text-emerald-700">Crop</span>
              </div>

              <p className="text-sm text-text-subtle mb-4 line-clamp-3">{product.description || 'No description available.'}</p>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-2xl font-bold text-text-main">EGP {Number(product.price).toLocaleString()}</p>
                <p className="text-sm text-text-muted">{product.unit || 'unit'}</p>
              </div>

              <button
                onClick={() => addToCart(product, 'crop')}
                className="inline-flex items-center justify-center gap-2 w-full rounded-3xl bg-primary-base px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <LuPlus /> Add to Cart
              </button>

              {user?.role === 'FARMER' && (
                <button
                  onClick={() => navigate('/marketplace')}
                  className="mt-3 w-full rounded-3xl border border-border-default px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-surface-secondary"
                >
                  Create Crop Product
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CropMarket;
