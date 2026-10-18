import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { ProductsSection } from './components/ProductsSection';
import { PosBankingSection } from './components/PosBankingSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { ContactSection } from './components/ContactSection';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { OwnerSetupModal } from './components/OwnerSetupModal';
import { ProductCategory } from './data/categories';

export default function App() {
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  const handleSelectCategoryForEnquiry = (category: ProductCategory) => {
    // Smooth scroll down to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Fire event to prefill the contact form
    window.dispatchEvent(
      new CustomEvent('anetorufa:enquire_category', {
        detail: {
          categoryTitle: category.title,
          enquiryType: 'Product Availability and Prices',
        },
      })
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-[#650A80] selection:text-white">
      {/* Navigation Header */}
      <Navbar onOpenOwnerModal={() => setIsOwnerModalOpen(true)} />

      {/* Main Content Sections */}
      <main>
        {/* A. Hero Section */}
        <Hero />

        {/* B. About Us */}
        <AboutUs />

        {/* C. Products and Provisions (8 Categories) */}
        <ProductsSection onSelectCategoryForEnquiry={handleSelectCategoryForEnquiry} />

        {/* D. POS and Banking Services (7 Services, 3 Benefits) */}
        <PosBankingSection />

        {/* E. Why Choose Us (5 Core Benefits) */}
        <WhyChooseUs />

        {/* F. Contact Us (Direct channels & functional contact form) */}
        <ContactSection />
      </main>

      {/* Floating WhatsApp and Phone quick contact buttons */}
      <FloatingActions />

      {/* Footer */}
      <Footer onOpenOwnerSetup={() => setIsOwnerModalOpen(true)} />

      {/* Business Owner Configuration & Messages Audit Modal */}
      <OwnerSetupModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
      />
    </div>
  );
}
