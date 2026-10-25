import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Products Store
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updatedProduct) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
  })),
  removeProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  // Cart / Billing Store
  cart: [],
  addToCart: (item) => set((state) => {
    // Check if item already exists
    const existing = state.cart.find(c => c.productId === item.productId);
    if (existing) {
      return {
        cart: state.cart.map(c => 
          c.productId === item.productId 
            ? { ...c, qty: c.qty + item.qty, total: (c.qty + item.qty) * c.price }
            : c
        )
      };
    }
    return { cart: [...state.cart, { ...item, total: item.qty * item.price }] };
  }),
  updateCartItemQty: (productId, qty) => set((state) => ({
    cart: state.cart.map(c => 
      c.productId === productId 
        ? { ...c, qty, total: qty * c.price } 
        : c
    )
  })),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(c => c.productId !== productId)
  })),
  clearCart: () => set({ cart: [] }),
  
  // Totals Calculation
  getTotals: () => {
    const { cart } = get();
    const netAmount = cart.reduce((sum, item) => sum + item.total, 0);
    // Assuming 5% GST for example, or it can be 0 based on settings
    const gstRate = 0.05; 
    const gstAmount = netAmount * gstRate;
    const totalAmount = netAmount + gstAmount;
    
    return { netAmount, gstAmount, totalAmount };
  },

  // Settings
  isVoiceActive: false,
  setVoiceActive: (active) => set({ isVoiceActive: active }),
  transcript: '',
  setTranscript: (text) => set({ transcript: text }),
  
  // Offline Sync State
  isOffline: !navigator.onLine,
  setOfflineStatus: (status) => set({ isOffline: status })
}));

export default useStore;
