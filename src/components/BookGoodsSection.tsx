import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
  CreditCard,
  MessageCircle,
  Truck,
  Store,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Printer,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { BOOKABLE_ITEMS, BookableItem } from '../data/bookableGoods';
import { PRODUCT_CATEGORIES, BUSINESS_INFO } from '../data/categories';

export interface SelectedGoodsItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface BookingResponse {
  success: boolean;
  bookingReference: string;
  order?: any;
  formspreeDelivered?: boolean;
  deliveryStatus?: string;
  message: string;
}

export const BookGoodsSection: React.FC = () => {
  // Category filtering & search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingMode, setBookingMode] = useState<'catalog' | 'custom_list'>('catalog');

  // Selected basket items
  const [basket, setBasket] = useState<SelectedGoodsItem[]>([]);

  // Custom Item inputs
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemUnit, setCustomItemUnit] = useState('Unit / Pack');

  // Form inputs
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [preferredDate, setPreferredDate] = useState('Today');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (9:00 AM - 12:00 PM)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'counter_pickup' | 'bank_transfer' | 'pos_card' | 'cash_on_delivery'>('counter_pickup');
  const [customGroceryList, setCustomGroceryList] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedBooking, setSubmittedBooking] = useState<BookingResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Listen to category pre-selection from other components
  useEffect(() => {
    const handleCategoryBook = (e: CustomEvent) => {
      if (e.detail?.categoryId) {
        setSelectedCategory(e.detail.categoryId);
        setBookingMode('catalog');
        const section = document.getElementById('book-goods');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('anetorufa:book_category' as any, handleCategoryBook as EventListener);
    return () => {
      window.removeEventListener('anetorufa:book_category' as any, handleCategoryBook as EventListener);
    };
  }, []);

  // Filter items
  const filteredItems = BOOKABLE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  // Basket Management
  const handleAddItem = (item: BookableItem, unit: string) => {
    setBasket((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === item.id && b.unit === unit);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          category: item.categoryName,
          quantity: 1,
          unit: unit || item.defaultUnit,
        },
      ];
    });
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const newItem: SelectedGoodsItem = {
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      category: 'Special Request',
      quantity: Math.max(1, customItemQty),
      unit: customItemUnit.trim() || 'Unit',
    };

    setBasket((prev) => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemQty(1);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setBasket((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Please enter your full name.';
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      errs.phoneNumber = 'Please enter a valid phone number (minimum 8 digits).';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please provide a valid email address or leave it blank.';
      }
    }

    const hasBasketItems = basket.length > 0;
    const hasListText = customGroceryList.trim().length > 3;

    if (!hasBasketItems && !hasListText) {
      errs.items = 'Please select at least 1 item from the catalog or write your goods list below.';
    }

    if (fulfillmentType === 'delivery') {
      if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
        errs.deliveryAddress = 'Please provide your full delivery address and town/area.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/book-goods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          phoneNumber,
          email: email || undefined,
          fulfillmentType,
          preferredDate,
          preferredTimeSlot,
          deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : undefined,
          nearestLandmark: fulfillmentType === 'delivery' ? nearestLandmark : undefined,
          paymentPreference,
          items: basket,
          customGroceryList: customGroceryList || undefined,
          specialInstructions: specialInstructions || undefined,
          honeypot,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedBooking(data);
        // Scroll to confirmation box
        const confirmEl = document.getElementById('booking-confirmation-view');
        if (confirmEl) {
          confirmEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setErrors(data.errors || { general: data.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      console.warn('Backend book-goods route issue, attempting direct Formspree delivery:', err);
      try {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const ref = `AV-BK-${randomSuffix}`;
        const itemsSummary = basket.map((it, i) => `${i + 1}. ${it.name} - ${it.quantity} ${it.unit} (${it.category})`).join('\n');

        const directFsRes = await fetch('https://formspree.io/f/xrpejnno', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _subject: `[Goods Pre-Order ${ref}] ${customerName} - ${fulfillmentType === 'delivery' ? 'DELIVERY' : 'STORE PICKUP'}`,
            bookingReference: ref,
            customerName,
            phoneNumber,
            email: email || undefined,
            _replyto: email || undefined,
            fulfillmentType: fulfillmentType === 'delivery' ? '🚚 Local Delivery Requested' : '🏬 Store Counter Pick-Up',
            preferredDate,
            preferredTimeSlot,
            deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : 'N/A (Store Counter Pickup)',
            nearestLandmark: fulfillmentType === 'delivery' ? nearestLandmark : 'N/A',
            paymentPreference: paymentPreference.replace(/_/g, ' ').toUpperCase(),
            orderedItems: itemsSummary || 'Custom list below',
            customGroceryList: customGroceryList || 'None',
            specialInstructions: specialInstructions || 'None',
            formSource: 'Anetorufa Ventures Book Goods Form (Direct Formspree)',
          }),
        });

        if (directFsRes.ok) {
          const fallbackData = {
            success: true,
            bookingReference: ref,
            formspreeDelivered: true,
            message: `Your booking (${ref}) has been received and forwarded directly to management via Formspree!`,
          };
          setSubmittedBooking(fallbackData);
          const confirmEl = document.getElementById('booking-confirmation-view');
          if (confirmEl) {
            confirmEl.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      } catch (fsErr) {
        console.error('Direct Formspree booking dispatch error:', fsErr);
      }

      setErrors({ general: 'Network connection issue. Please try again or call us at 08137590538.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedBooking(null);
    setBasket([]);
    setCustomGroceryList('');
    setSpecialInstructions('');
    setErrors({});
  };

  // Generate WhatsApp message for instant booking dispatch
  const getWhatsAppBookingText = (): string => {
    if (!submittedBooking) return '';
    const ref = submittedBooking.bookingReference;
    const itemsText =
      basket.length > 0
        ? basket.map((it, idx) => `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit}`).join('\n')
        : 'Custom List Provided';

    let text = `*GOODS RESERVATION - ANETORUFA VENTURES*\n`;
    text += `*Booking Ref:* ${ref}\n`;
    text += `*Customer:* ${customerName}\n`;
    text += `*Phone:* ${phoneNumber}\n`;
    text += `*Fulfillment:* ${fulfillmentType === 'delivery' ? 'Local Delivery' : 'Store Pickup'}\n`;
    text += `*Preferred Time:* ${preferredDate} (${preferredTimeSlot})\n`;
    if (fulfillmentType === 'delivery' && deliveryAddress) {
      text += `*Address:* ${deliveryAddress} ${nearestLandmark ? `(Near: ${nearestLandmark})` : ''}\n`;
    }
    text += `*Payment:* ${paymentPreference.replace(/_/g, ' ').toUpperCase()}\n\n`;
    if (basket.length > 0) {
      text += `*ITEMS RESERVED:*\n${itemsText}\n\n`;
    }
    if (customGroceryList) {
      text += `*ADDITIONAL LIST:*\n${customGroceryList}\n\n`;
    }
    if (specialInstructions) {
      text += `*NOTES:* ${specialInstructions}\n\n`;
    }
    text += `Please confirm my order and let me know when it is ready. Thank you!`;
    return text;
  };

  const handleCopySummary = () => {
    const text = getWhatsAppBookingText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="book-goods" className="py-12 sm:py-20 bg-white border-t border-gray-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#650A80] uppercase tracking-wider mb-3 shadow-xs">
            <Package className="w-3.5 h-3.5 text-[#07852D]" />
            <span>Store Pre-Order & Goods Reservation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#650A80] font-heading tracking-tight leading-tight">
            Book Your Goods & Provisions in Advance
          </h2>
          <div className="w-16 sm:w-20 h-1.5 bg-[#07852D] mx-auto my-3 sm:my-4 rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            Avoid market crowds and out-of-stock delays. Reserve your rice, beans, garri, yam tubers, cooking oils,
            canned goods, and groceries below. Our store staff will pack and reserve your order for quick counter pickup
            or arranged local delivery!
          </p>
        </div>

        {/* If Booking is already successfully submitted, show Rich Confirmation Card */}
        {submittedBooking ? (
          <div id="booking-confirmation-view" className="max-w-3xl mx-auto animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-emerald-50 via-white to-purple-50 rounded-3xl p-5 sm:p-8 border-2 border-[#07852D] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#72E52E]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#07852D] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-[#72E52E]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#07852D] bg-emerald-100 px-3 py-1 rounded-full">
                  Booking Confirmed & Recorded
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#650A80] font-heading mt-2">
                  Goods Order Successfully Placed!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Keep your booking reference code safe for store pickup or status tracking.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Booking Reference:</span>
                    <span className="text-base sm:text-lg font-black text-[#650A80] font-mono tracking-wider">
                      {submittedBooking.bookingReference}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs font-bold text-[#07852D]">
                    <CheckCircle2 className="w-4 h-4 text-[#07852D]" />
                    <span>Sent to Owner Email (Formspree)</span>
                  </div>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xs mb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-gray-500 block">Customer Name:</span>
                    <strong className="text-gray-900 font-bold">{customerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Phone Number:</span>
                    <strong className="text-[#650A80] font-bold">{phoneNumber}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Fulfillment Method:</span>
                    <strong className="text-[#07852D] font-bold flex items-center gap-1 mt-0.5">
                      {fulfillmentType === 'delivery' ? (
                        <>
                          <Truck className="w-4 h-4" /> Local Delivery
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4" /> Store Counter Pick-Up
                        </>
                      )}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Preferred Schedule:</span>
                    <strong className="text-gray-800">
                      {preferredDate} ({preferredTimeSlot})
                    </strong>
                  </div>
                  {fulfillmentType === 'delivery' && deliveryAddress && (
                    <div className="sm:col-span-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      <span className="text-gray-500 block text-[11px] font-semibold">Delivery Address:</span>
                      <strong className="text-gray-900 font-medium">
                        {deliveryAddress} {nearestLandmark ? `(Landmark: ${nearestLandmark})` : ''}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Booked Items List */}
                {basket.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Reserved Goods ({basket.length} {basket.length === 1 ? 'item' : 'items'}):
                    </h4>
                    <ul className="divide-y divide-gray-100 text-xs sm:text-sm">
                      {basket.map((item, idx) => (
                        <li key={idx} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-900">{item.name}</span>
                            <span className="text-gray-500 text-xs block">{item.category}</span>
                          </div>
                          <div className="font-bold text-[#650A80] bg-purple-50 px-2.5 py-1 rounded-md">
                            {item.quantity} x {item.unit}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Custom List if any */}
                {customGroceryList && (
                  <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs sm:text-sm">
                    <span className="font-bold text-amber-900 block mb-1">Additional Custom Grocery List:</span>
                    <p className="text-amber-950 whitespace-pre-wrap">{customGroceryList}</p>
                  </div>
                )}

                {specialInstructions && (
                  <div className="text-xs text-gray-600 italic">
                    <strong>Special Instructions:</strong> {specialInstructions}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                    getWhatsAppBookingText()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#07852D] hover:bg-[#055C1F] text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-all active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-[#07852D]" />
                  <span>Send Order to Store on WhatsApp ({BUSINESS_INFO.phone})</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    href={BUSINESS_INFO.phoneTel}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#650A80] hover:bg-[#49065D] text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>Call Store Now</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold rounded-xl border border-gray-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#07852D]" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#650A80]" />
                    <span>Book More Goods</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Interactive Booking Interface */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Product Catalog & Item Selector */}
            <div className="lg:col-span-7 space-y-5">
              {/* Mode Switcher */}
              <div className="bg-gray-100 p-1 rounded-2xl flex text-xs sm:text-sm font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setBookingMode('catalog')}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    bookingMode === 'catalog'
                      ? 'bg-white text-[#650A80] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-[#07852D]" />
                  <span>Store Catalog Picker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('custom_list')}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    bookingMode === 'custom_list'
                      ? 'bg-white text-[#650A80] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#650A80]" />
                  <span>Custom Grocery Notepad</span>
                </button>
              </div>

              {bookingMode === 'catalog' ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
                  {/* Search and Category Filter */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rice, beans, garri, yam, oils, Milo, detergents..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#650A80] text-sm text-gray-900"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills (Scrollable on mobile) */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-[#650A80] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Categories ({BOOKABLE_ITEMS.length})
                      </button>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-[#650A80] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.title.split(' ')[0]}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items Catalog List */}
                  <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-gray-100">
                    {filteredItems.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <Package className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm">No items found matching "{searchQuery}".</p>
                        <p className="text-xs mt-1 text-gray-400">
                          You can still add it directly using the "Custom Item" box below.
                        </p>
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const inBasket = basket.find((b) => b.id === item.id);
                        return (
                          <ItemCatalogCard
                            key={item.id}
                            item={item}
                            inBasketCount={inBasket ? inBasket.quantity : 0}
                            onAdd={(unit) => handleAddItem(item, unit)}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Quick Custom Item Add */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#07852D]" />
                      <span>Need an unlisted item or special grocery brand? Add it here:</span>
                    </p>
                    <form onSubmit={handleAddCustomItem} className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        placeholder="Item name (e.g. 5 tubers of sweet yam)"
                        className="flex-1 min-w-[160px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#650A80]"
                      />
                      <input
                        type="number"
                        min="1"
                        value={customItemQty}
                        onChange={(e) => setCustomItemQty(Number(e.target.value) || 1)}
                        className="w-16 px-2 py-2 text-xs sm:text-sm text-center rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#650A80]"
                        title="Quantity"
                      />
                      <input
                        type="text"
                        value={customItemUnit}
                        onChange={(e) => setCustomItemUnit(e.target.value)}
                        placeholder="Unit (Bag, Tin, etc)"
                        className="w-24 px-2 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#650A80]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#07852D] hover:bg-[#055C1F] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Custom Grocery Notepad Mode */
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3.5 text-xs text-[#650A80] leading-relaxed">
                    <strong>Have a custom grocery list ready?</strong> Write or paste your full list of foodstuffs and
                    provisions below. Our store staff will calculate the total and get everything ready for you!
                  </div>

                  <div>
                    <label htmlFor="custom-grocery-list" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Your Goods List & Quantities <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="custom-grocery-list"
                      rows={8}
                      value={customGroceryList}
                      onChange={(e) => setCustomGroceryList(e.target.value)}
                      placeholder={`Write your items line-by-line, for example:
- 2 bags of 50kg Foreign Parboiled Rice
- 1 paint rubber of Yellow Garri
- 1 carton of Indomie Onion Chicken Noodles
- 5 tubers of fresh Yam
- 1 gallon (5 Litres) of Kings Vegetable Oil
- 1 roll of Sunlight washing powder`}
                      className="w-full p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#650A80] text-sm text-gray-900 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Booking Basket & Checkout Form */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-md p-4 sm:p-6 space-y-5">
                {/* Basket Summary Box */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-extrabold text-[#650A80] font-heading flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#07852D]" />
                      <span>Your Reservation Basket</span>
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#650A80]">
                      {basket.length} {basket.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {basket.length === 0 ? (
                    <div className="py-5 text-center text-gray-400 bg-gray-50/70 rounded-xl mt-3 border border-dashed border-gray-200">
                      <Package className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                      <p className="text-xs font-medium text-gray-500">Your basket is currently empty.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {bookingMode === 'custom_list'
                          ? 'Using custom notepad mode to write items directly.'
                          : 'Click items from the catalog on the left to add them.'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 mt-3 pr-1 divide-y divide-gray-100">
                      {basket.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="pt-2 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex-1 pr-2">
                            <span className="font-bold text-gray-900 line-clamp-1">{item.name}</span>
                            <span className="text-[11px] text-gray-500 font-medium">Unit: {item.unit}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, -1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-l-lg transition-colors"
                                title="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-bold text-xs text-gray-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-r-lg transition-colors"
                                title="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.items && <p className="text-xs font-semibold text-red-600 mt-2">{errors.items}</p>}
                </div>

                {/* Booking Form Details */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
                  {/* Anti-spam trap */}
                  <input
                    type="text"
                    name="website_security_token"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden pointer-events-none opacity-0 h-0 w-0"
                  />

                  {/* Full Name */}
                  <div>
                    <label htmlFor="customer-name" className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Mrs. Maryam / Chief Johnson"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#650A80] ${
                          errors.customerName ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.customerName && (
                      <p className="text-xs font-semibold text-red-600 mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone-number" className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number (WhatsApp or Call) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="080... or 081..."
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#650A80] ${
                          errors.phoneNumber ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs font-semibold text-red-600 mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label htmlFor="email-optional" className="block text-xs font-bold text-gray-700 mb-1">
                      Email Address <span className="text-gray-400 font-normal">(Optional for receipt)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="email-optional"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#650A80] ${
                          errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs font-semibold text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  {/* Fulfillment Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Fulfillment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('pickup')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                          fulfillmentType === 'pickup'
                            ? 'border-[#650A80] bg-purple-50 text-[#650A80] font-bold shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Store className="w-5 h-5 text-[#07852D]" />
                        <span className="text-xs">Store Counter Pickup</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfillmentType('delivery')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                          fulfillmentType === 'delivery'
                            ? 'border-[#07852D] bg-emerald-50 text-[#07852D] font-bold shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Truck className="w-5 h-5 text-[#07852D]" />
                        <span className="text-xs">Local Delivery</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address fields if local delivery chosen */}
                  {fulfillmentType === 'delivery' && (
                    <div className="space-y-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 animate-in fade-in">
                      <div>
                        <label htmlFor="delivery-address" className="block text-xs font-bold text-gray-700 mb-1">
                          Delivery Address & Area <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="delivery-address"
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Street name, house/flat number, area name..."
                          className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#07852D] ${
                            errors.deliveryAddress ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                          }`}
                        />
                        {errors.deliveryAddress && (
                          <p className="text-xs font-semibold text-red-600 mt-1">{errors.deliveryAddress}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="nearest-landmark" className="block text-xs font-bold text-gray-700 mb-1">
                          Nearest Landmark <span className="text-gray-400 font-normal">(e.g. Opposite Central Mosque)</span>
                        </label>
                        <input
                          id="nearest-landmark"
                          type="text"
                          value={nearestLandmark}
                          onChange={(e) => setNearestLandmark(e.target.value)}
                          placeholder="Notable building, junction, school, church..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#07852D]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preferred Timing */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="pref-date" className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                      <select
                        id="pref-date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white"
                      >
                        <option value="Today">Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="In 2 Days">In 2 Days</option>
                        <option value="This Weekend">This Weekend</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="pref-timeslot" className="block text-xs font-bold text-gray-700 mb-1">Time Slot</label>
                      <select
                        id="pref-timeslot"
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white"
                      >
                        <option value="Morning (9am - 12pm)">Morning (9am - 12pm)</option>
                        <option value="Afternoon (12pm - 3pm)">Afternoon (12pm - 3pm)</option>
                        <option value="Evening (3pm - 6pm)">Evening (3pm - 6pm)</option>
                        <option value="Immediate / As soon as possible">Immediate (ASAP)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Method Preference */}
                  <div>
                    <label htmlFor="payment-pref" className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Preference
                    </label>
                    <select
                      id="payment-pref"
                      value={paymentPreference}
                      onChange={(e) => setPaymentPreference(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white"
                    >
                      <option value="counter_pickup">Pay at Store Counter (Cash or Debit Card POS)</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                      <option value="pos_card">Debit Card Payment via POS Terminal</option>
                      {fulfillmentType === 'delivery' && (
                        <option value="cash_on_delivery">Cash on Delivery</option>
                      )}
                    </select>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label htmlFor="special-notes" className="block text-xs font-bold text-gray-700 mb-1">
                      Special Notes <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="special-notes"
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Please select clean, large yam tubers"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#650A80]"
                    />
                  </div>

                  {/* General error banner */}
                  {errors.general && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#650A80] hover:bg-[#49065D] text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#72E52E]" />
                        <span>Reserving Goods...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#72E52E]" />
                        <span>Reserve & Book Goods Now</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-500 text-center leading-tight">
                    🔒 No upfront online payment required to submit. You will receive an immediate confirmation and can
                    finalize or chat on WhatsApp!
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Sub-component for individual item cards in catalog
interface ItemCatalogCardProps {
  item: BookableItem;
  inBasketCount: number;
  onAdd: (unit: string) => void;
}

const ItemCatalogCard: React.FC<ItemCatalogCardProps> = ({ item, inBasketCount, onAdd }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(item.defaultUnit);

  return (
    <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors hover:bg-purple-50/30 p-2 rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">{item.name}</h4>
          {item.popular && (
            <span className="text-[10px] bg-emerald-100 text-[#07852D] font-bold px-1.5 py-0.5 rounded-full shrink-0">
              Popular
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500">{item.categoryName}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="text-xs py-1.5 px-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#650A80]"
          title="Select measurement unit"
        >
          {item.commonUnits.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onAdd(selectedUnit)}
          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
            inBasketCount > 0
              ? 'bg-[#07852D] hover:bg-[#055C1F] text-white shadow-xs'
              : 'bg-purple-100 hover:bg-purple-200 text-[#650A80]'
          }`}
          title="Add to booking basket"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{inBasketCount > 0 ? `Added (${inBasketCount})` : 'Add'}</span>
        </button>
      </div>
    </div>
  );
};
