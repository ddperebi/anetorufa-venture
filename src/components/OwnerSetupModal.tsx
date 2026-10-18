import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Mail, Key, Database, RefreshCw, Phone, Shield, FileText } from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';

interface OwnerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfigStatus {
  emailConfigured: boolean;
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

export const OwnerSetupModal: React.FC<OwnerSetupModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'inbox' | 'guide'>('status');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [configRes, inboxRes] = await Promise.all([
        fetch('/api/config-status'),
        fetch('/api/inbox'),
      ]);
      if (configRes.ok) {
        const cData = await configRes.json();
        setConfig(cData);
      }
      if (inboxRes.ok) {
        const iData = await inboxRes.json();
        setInbox(iData.messages || []);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-[#650A80] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#07852D] flex items-center justify-center text-white shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#72E52E]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold font-heading leading-tight">Business Owner Setup & Inbox</h3>
              <p className="text-[10px] sm:text-xs text-purple-200">Anetorufa Ventures Management Configuration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-[11px] sm:text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors ${
              activeTab === 'status'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 text-center whitespace-nowrap transition-colors ${
              activeTab === 'inbox'
                ? 'border-[#650A80] text-[#650A80] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Inbox ({inbox.length})
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
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  config?.emailConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {config?.emailConfigured ? (
                  <CheckCircle className="w-5 h-5 text-[#07852D] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">
                    {config?.emailConfigured
                      ? 'Automated Email Forwarding Active'
                      : 'Pending Owner Notification Setup'}
                  </p>
                  <p className="mt-1 text-xs opacity-90">{config?.notice}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Current Settings Summary
                </h4>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Business Phone / WhatsApp:</span>
                  <span className="font-bold text-[#650A80]">08137590538</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Owner Notification Email:</span>
                  <span className="font-mono text-gray-800">
                    {config?.maskedEmail || '(Not yet set in environment)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Email Dispatch Service:</span>
                  <span className="font-semibold text-gray-800">{config?.provider || 'None'}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-gray-600 font-medium">Server Persistent Inbox:</span>
                  <span className="font-bold text-[#07852D]">Enabled (data/messages.json)</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Even without an email service configured, all customer enquiries sent through the website are
                immediately validated, sanitized, and stored securely in the server inbox, so no customer inquiry is ever
                lost. Customers can also reach you instantly via WhatsApp or direct phone call.
              </p>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Recent Enquiries</span>
                <button
                  type="button"
                  onClick={fetchStatus}
                  className="inline-flex items-center gap-1 text-xs text-[#650A80] font-semibold hover:underline"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {inbox.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 p-6 text-xs text-gray-500">
                  <Database className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  No messages submitted yet. Send a test message from the contact form to see it appear here!
                </div>
              ) : (
                <div className="space-y-3">
                  {inbox.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-gray-900 text-sm">{msg.fullName}</span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-600">
                        <span>
                          <strong>Phone:</strong>{' '}
                          <a href={`tel:${msg.phoneNumber}`} className="text-[#650A80] font-bold">
                            {msg.phoneNumber}
                          </a>
                        </span>
                        {msg.email && (
                          <span>
                            <strong>Email:</strong> {msg.email}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-[#650A80] font-semibold">
                          {msg.enquiryType}
                        </span>
                      </div>

                      <p className="font-semibold text-gray-800">Subject: {msg.subject}</p>
                      <p className="text-gray-700 bg-white p-2.5 rounded border border-gray-200 leading-relaxed">
                        {msg.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-emerald-700 font-medium">Status: {msg.deliveryStatus}</span>
                        <a
                          href={`https://wa.me/${msg.phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#07852D] font-bold hover:underline"
                        >
                          Reply on WhatsApp →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-base font-heading">
                  How to Configure Your Owner Email Notifications
                </h4>
                <p>
                  To receive real-time email notifications whenever a customer submits an enquiry through the website:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <li>
                  <strong>Obtain a Free Resend API Key:</strong> Visit{' '}
                  <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#650A80] font-bold underline">
                    resend.com
                  </a>{' '}
                  and sign up for free (supports 3,000 free emails per month). Copy your API key.
                </li>
                <li>
                  <strong>Add Environment Variables in your hosting environment:</strong>
                  <pre className="mt-2 bg-gray-900 text-purple-200 p-3 rounded-lg overflow-x-auto font-mono text-[11px]">
{`OWNER_NOTIFICATION_EMAIL="your-real-email@gmail.com"
RESEND_API_KEY="re_1234567890abcdef..."
NOTIFICATION_FROM_EMAIL="onboarding@resend.dev"`}
                  </pre>
                </li>
                <li>
                  <strong>Deploy or Restart:</strong> The server will immediately start delivering all submitted form enquiries directly to your inbox with one-click reply links!
                </li>
              </ol>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#650A80] shrink-0 mt-0.5" />
                <span>
                  <strong>Security Guarantee:</strong> Your email and API keys are stored only on the secure backend
                  server and are never exposed in client-side JavaScript.
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
