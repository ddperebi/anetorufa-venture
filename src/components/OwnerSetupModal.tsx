import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Mail,
  Key,
  Database,
  RefreshCw,
  Phone,
  Shield,
  FileText,
  Package,
  Store,
  Truck,
  MessageCircle,
  Clock,
  Check,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';

interface OwnerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfigStatus {
  emailConfigured: boolean;
  formspreeActive?: boolean;
  formspreeEndpoint?: string;
  ownerEmailProvided: boolean;
  maskedEmail: string | null;
  provider: string;
  notice: string;
}

interface InboxMessage {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  enquiryType: string;
  subject: string;
  message: string;
  consent: boolean;
  createdAt: string;
  deliveryStatus: string;
}

interface BookedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface BookedGoodsOrder {
  id: string;
  bookingReference: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  fulfillmentType: 'pickup' | 'delivery';
  preferredDate: string;
  preferredTimeSlot: string;
  deliveryAddress?: string;
  nearestLandmark?: string;
  paymentPreference: string;
  items: BookedItem[];
  customGroceryList?: string;
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryStatus: string;
}

export const OwnerSetupModal: React.FC<OwnerSetupModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [bookings, setBookings] = useState<BookedGoodsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'inbox' | 'status' | 'guide'>('bookings');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [configRes, inboxRes, bookingsRes] = await Promise.all([
        fetch('/api/config-status'),
        fetch('/api/inbox'),
        fetch('/api/bookings'),
      ]);
      if (configRes.ok) {
        const cData = await configRes.json();
        setConfig(cData);
      }
      if (inboxRes.ok) {
        const iData = await inboxRes.json();
        setInbox(iData.messages || []);
      }
      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setBookings(bData.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (id: string, newStatus: BookedGoodsOrder['status']) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id || b.bookingReference === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-[#650A80] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#07852D] flex items-center justify-center text-white shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#72E52E]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold font-heading leading-tight">
                Store Management & Bookings Hub
              </h3>
              <p className="text-[10px] sm:text-xs text-purple-200">Anetorufa Ventures Orders & Customer Records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStatus}
              disabled={isLoading}
              title="Refresh Data"
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-[11px] sm:text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Booked Goods Orders ({bookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Customer Enquiries ({inbox.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors ${
              activeTab === 'status'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Email Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors ${
              activeTab === 'guide'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 text-xs sm:text-sm text-gray-700">
          {/* 1. Booked Goods Orders Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  Real-time list of goods and provisions pre-ordered by customers on this website.
                </p>
                <span className="text-[11px] font-bold text-[#650A80] bg-purple-50 px-2 py-0.5 rounded-full">
                  Total: {bookings.length}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-bold">No goods pre-orders placed yet.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    When customers reserve food items using the "Book Goods" form, they will appear here instantly!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#650A80]/40 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#650A80] bg-purple-50 px-2.5 py-1 rounded-md">
                            {b.bookingReference}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              b.fulfillmentType === 'delivery'
                                ? 'bg-emerald-100 text-[#07852D]'
                                : 'bg-purple-100 text-[#650A80]'
                            }`}
                          >
                            {b.fulfillmentType === 'delivery' ? (
                              <>
                                <Truck className="w-3 h-3" /> Delivery
                              </>
                            ) : (
                              <>
                                <Store className="w-3 h-3" /> Pickup
                              </>
                            )}
                          </span>
                          {b.deliveryStatus === 'delivered_formspree' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#07852D] border border-emerald-200">
                              ✉ Sent to Formspree
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400">Status:</span>
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                            className="text-xs font-bold py-1 px-2 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">👍 Confirmed</option>
                            <option value="ready">📦 Packed / Ready</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details & Schedule */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer</span>
                          <strong className="text-gray-900 font-bold">{b.customerName}</strong>
                          <span className="block text-gray-600 mt-0.5">{b.phoneNumber}</span>
                          {b.email && <span className="block text-gray-500 text-[11px]">{b.email}</span>}
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Preferred Timing</span>
                          <span className="text-gray-800 font-semibold">
                            {b.preferredDate} ({b.preferredTimeSlot})
                          </span>
                          <span className="block text-[11px] text-gray-500 mt-0.5">
                            Payment: {b.paymentPreference?.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        {b.fulfillmentType === 'delivery' && b.deliveryAddress && (
                          <div className="sm:col-span-2 bg-emerald-50/60 p-2 rounded-lg text-emerald-950 border border-emerald-100 text-xs">
                            <strong>Delivery Address:</strong> {b.deliveryAddress}{' '}
                            {b.nearestLandmark ? `(Near: ${b.nearestLandmark})` : ''}
                          </div>
                        )}
                      </div>

                      {/* Items Booked */}
                      {b.items && b.items.length > 0 && (
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                            Reserved Items ({b.items.length}):
                          </span>
                          <ul className="text-xs space-y-1">
                            {b.items.map((it, idx) => (
                              <li key={idx} className="flex justify-between items-center text-gray-800">
                                <span>• {it.name}</span>
                                <strong className="text-[#650A80]">
                                  {it.quantity} {it.unit}
                                </strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Custom List or Notes */}
                      {b.customGroceryList && (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs text-amber-950">
                          <strong>Custom List:</strong> {b.customGroceryList}
                        </div>
                      )}

                      {b.specialInstructions && (
                        <p className="text-[11px] text-gray-500 italic">Notes: {b.specialInstructions}</p>
                      )}

                      {/* Fast Reply Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                        <a
                          href={`https://wa.me/${b.phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
                            `Hello ${b.customerName}, this is Anetorufa Ventures regarding your goods reservation ${b.bookingReference}. We have received your order!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07852D] text-white text-xs font-bold hover:bg-[#055C1F] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white text-[#07852D]" />
                          <span>WhatsApp Customer</span>
                        </a>

                        <a
                          href={`tel:${b.phoneNumber}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#650A80] text-white text-xs font-bold hover:bg-[#49065D] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 fill-white" />
                          <span>Call {b.phoneNumber}</span>
                        </a>

                        <span className="ml-auto text-[10px] text-gray-400 self-center">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Enquiries Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  Messages received via the contact form on this website:
                </p>
                <span className="text-[11px] font-bold text-[#650A80] bg-purple-50 px-2 py-0.5 rounded-full">
                  Total: {inbox.length}
                </span>
              </div>

              {inbox.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6">
                  <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No contact messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inbox.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#650A80]/40 transition-colors shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-gray-900 block font-bold text-sm">{msg.fullName}</strong>
                          <span className="text-[11px] text-gray-500">
                            {msg.phoneNumber} {msg.email ? `• ${msg.email}` : ''}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#650A80] border border-purple-100 whitespace-nowrap">
                            {msg.enquiryType}
                          </span>
                          {msg.deliveryStatus === 'delivered_formspree' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#07852D] border border-emerald-200">
                              ✉ Sent to Formspree
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <strong className="text-xs text-[#650A80] block mb-0.5">{msg.subject}</strong>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/${msg.phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#07852D] hover:underline"
                          >
                            <MessageCircle className="w-3 h-3 fill-[#07852D] text-white" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${msg.phoneNumber}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#650A80] hover:underline"
                          >
                            <Phone className="w-3 h-3 fill-current" />
                            <span>Call</span>
                          </a>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border flex items-start gap-3 bg-emerald-50 border-emerald-200 text-emerald-900">
                <CheckCircle className="w-5 h-5 text-[#07852D] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Formspree Email Forwarding is Active</h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    Whenever any customer submits an enquiry or pre-orders goods on this website, all their information is instantly forwarded to your Formspree email.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Formspree Endpoint:</span>
                  <span className="font-mono font-bold text-xs text-[#650A80] bg-purple-50 px-2.5 py-1 rounded-md">
                    https://formspree.io/f/xrpejnno
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Forwarded Forms:</span>
                  <span className="font-semibold text-xs text-gray-800">
                    Contact Enquiries & Book Goods Pre-Orders
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Notification Recipient:</span>
                  <span className="font-mono font-bold text-gray-800">
                    Formspree Account Email
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Local Backup Storage:</span>
                  <span className="font-semibold text-xs text-[#07852D]">Enabled (/data/bookings.json & /data/messages.json)</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Store WhatsApp & Phone:</span>
                  <span className="font-bold text-[#07852D]">{BUSINESS_INFO.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Formspree Email Notifications:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your website is configured to forward every form submission to your Formspree endpoint:
                <code className="ml-1 bg-gray-100 text-[#650A80] px-1.5 py-0.5 rounded font-mono font-bold">
                  https://formspree.io/f/xrpejnno
                </code>
              </p>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
                <p className="font-bold text-[#07852D] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#07852D]" />
                  <span>How Formspree delivers your incoming data:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-emerald-900">
                  <li><strong>Contact Inquiries:</strong> Sends customer full name, phone number, email, inquiry type, subject, message, and direct WhatsApp reply link.</li>
                  <li><strong>Book Goods Pre-Orders:</strong> Sends unique booking reference (e.g. AV-BK-XXXXX), customer name, phone, fulfillment method (pickup/delivery), preferred date & time, delivery address, full list of reserved food items and quantities, and custom grocery notepad notes.</li>
                  <li><strong>Local Dashboard:</strong> Every submission is also logged on-site right here in your Store Management Hub under the "Booked Goods Orders" and "Customer Enquiries" tabs.</li>
                </ul>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#650A80] shrink-0 mt-0.5" />
                <span>
                  <strong>Dual Delivery Resilience:</strong> If a customer's browser ever has temporary network instability, the site features automatic fallback delivery ensuring no customer order or inquiry is lost.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#650A80] text-white font-bold text-xs rounded-xl hover:bg-[#49065D] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
