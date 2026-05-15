import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Lock, CreditCard, Package, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  specs?: string[];
}

export function ShoppingCartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Delt Terminal Pro',
      category: 'Hardware',
      price: 299,
      quantity: 1,
      image: '📟',
      specs: ['Contactless', 'Chip & PIN', 'Mobile Ready']
    },
    {
      id: '2',
      name: 'Card Reader Mobile',
      category: 'Hardware',
      price: 49,
      quantity: 2,
      image: '💳',
      specs: ['Bluetooth', 'iOS & Android']
    },
    {
      id: '3',
      name: 'Growth Plan',
      category: 'Software',
      price: 89,
      quantity: 1,
      image: '📊',
      specs: ['Monthly subscription', 'Advanced analytics', 'Priority support']
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.1; // Introductory discount (10%)
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#F6F7FB] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#4945FF] rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#041E42]">Cart</h1>
            </div>
            <p className="text-lg text-[#475569]">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-[#EBF3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-10 w-10 text-[#4945FF]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#041E42] mb-2">Your cart is empty</h3>
                  <p className="text-[#475569] mb-6">Add products to get started</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#4945FF] text-white rounded-lg font-semibold hover:bg-[#3730FF] transition-all"
                  >
                    Browse Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-6">
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-[#4945FF] mb-1">{item.category}</p>
                            <h3 className="text-xl font-bold text-[#041E42] mb-2">{item.name}</h3>
                            {item.specs && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.specs.map((spec, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-[#EBF3FF] text-[#4945FF] text-xs font-medium rounded-full"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#94A3B8] hover:text-[#EF4444] transition-colors p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors text-[#475569] hover:text-[#4945FF]"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-[#041E42] font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors text-[#475569] hover:text-[#4945FF]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#041E42]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-[#94A3B8]">${item.price} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Promo Code */}
              {cartItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-[#4945FF]" />
                    <h3 className="font-bold text-[#041E42]">Promo Code</h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4945FF] transition-colors text-[#041E42]"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-6 py-3 bg-[#080A28] text-white rounded-lg font-semibold hover:bg-[#062A5C] transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-3 px-4 py-2 bg-[#EBF3FF] rounded-lg flex items-center justify-between">
                      <span className="text-sm font-medium text-[#4945FF]">
                        Code "{appliedPromo}" applied - 10% off!
                      </span>
                      <button
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode('');
                        }}
                        className="text-[#475569] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
                  <h2 className="text-2xl font-bold text-[#041E42] mb-6">Order Summary</h2>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-[#E2E8F0]">
                    <div className="flex justify-between text-[#475569]">
                      <span>Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#4945FF]">
                      <span title="Limited-time introductory offer. See terms for details.">Introductory discount (10%) ℹ</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#475569]">
                      <span>Estimated Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#475569]">
                      <span>Shipping</span>
                      <span className="font-semibold text-[#4945FF]">FREE</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#E2E8F0]">
                    <span className="text-xl font-bold text-[#041E42]">Total</span>
                    <span className="text-3xl font-bold text-[#041E42]">${total.toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    className="w-full bg-[#4945FF] text-white py-4 rounded-lg font-bold hover:bg-[#3730FF] transition-all flex items-center justify-center gap-2 group mb-2"
                    onClick={() => navigate('/apply')}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-xs text-[#475569] mt-2">See our <Link to="/terms" className="underline">return and cancellation policy</Link>.</p>

                  {/* Security Badges */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#475569]">
                      <div className="w-8 h-8 bg-[#EBF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="h-4 w-4 text-[#4945FF]" />
                      </div>
                      <span>Secure SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#475569]">
                      <div className="w-8 h-8 bg-[#EBF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-[#4945FF]" />
                      </div>
                      <span>Multiple payment options</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#475569]">
                      <div className="w-8 h-8 bg-[#EBF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-[#4945FF]" />
                      </div>
                      <span>Free shipping on all orders</span>
                    </div>
                  </div>

                  {/* Continue Shopping */}
                  <Link
                    to="/products"
                    className="block w-full text-center py-3 mt-4 text-[#4945FF] font-semibold hover:text-[#3730FF] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
