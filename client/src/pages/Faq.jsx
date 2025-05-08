import React, { useState, useMemo, useCallback } from 'react';

function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const faqs = useMemo(
    () => [
      {
        category: 'Ordering',
        questions: [
          {
            question: 'How do I place an order with ShipEasy?',
            answer:
              'Log in to your account and go to the "Place Order" page. Enter pickup and delivery addresses, package details (dimensions, weight, contents), and select a pickup date. Choose Surface or Express delivery, then proceed to payment. You’ll receive a tracking ID via email and in your dashboard.',
          },
          {
            question: 'Can I modify or cancel my order after placing it?',
            answer:
              'Yes, before pickup, visit the "Track Order" page, enter your tracking ID, and select "Modify" or "Cancel" if available. For help, use the "Support" page or live chat with your tracking ID.',
          },
        ],
      },
      {
        category: 'Tracking & Delivery',
        questions: [
          {
            question: 'How can I track my package?',
            answer:
              'Visit the "Track Order" page and enter your tracking ID for real-time status updates. Alternatively, log in to view all orders in your account dashboard.',
          },
          {
            question: 'What are the delivery time options?',
            answer:
              'We offer Surface (5 days, ₹1000) and Express (3 days, ₹1300) delivery. Select a pickup date and preferred time slot (e.g., 9:00 AM - 12:00 PM) during ordering.',
          },
          {
            question: 'What is secure packaging, and why should I choose it?',
            answer:
              'Secure packaging (₹100) provides reinforced materials and insurance up to ₹5000 for loss or damage. It’s ideal for valuable or fragile items.',
          },
        ],
      },
      {
        category: 'Payments',
        questions: [
          {
            question: 'What payment methods are accepted?',
            answer:
              'We accept Visa, Mastercard, Amex, UPI, and net banking via our secure payment gateway. Payments are processed during order confirmation, with a receipt sent via email.',
          },
          {
            question: 'Can I get a refund if my delivery fails?',
            answer:
              'If delivery fails due to our error (e.g., lost package), we offer a full refund or rescheduled delivery. Contact support within 7 days with your tracking ID.',
          },
        ],
      },
      {
        category: 'Support',
        questions: [
          {
            question: 'How do I contact customer support?',
            answer:
              'Use the "Support" page for tickets or live chat, email support@shipeasy.com, or call our toll-free number (listed on the "Support" page). Include your tracking ID for faster help.',
          },
          {
            question: 'What should I do if I encounter an issue with my order?',
            answer:
              'Submit a support ticket on the "Support" page with your tracking ID and issue details (e.g., delay, damage). Our team responds within 24-48 hours.',
          },
        ],
      },
      {
        category: 'Account & Admin',
        questions: [
          {
            question: 'How do I reset my password?',
            answer:
              'Click "Forgot Password" on the login page to receive a reset link via email. If issues persist, contact support with your account email.',
          },
          {
            question: 'Who can access the admin dashboard?',
            answer:
              'Only users with admin privileges, assigned by ShipEasy, can access the admin dashboard to manage orders, statuses, tickets, and chats. Contact us if you need access.',
          },
        ],
      },
    ],
    []
  );

  const filteredFaqs = useMemo(() => {
    if (!searchTerm && !activeCategory) return faqs;
    const lowerSearch = searchTerm.toLowerCase();
    return faqs
      .filter((category) => (!activeCategory || category.category === activeCategory))
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(lowerSearch) ||
            faq.answer.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [faqs, searchTerm, activeCategory]);

  const toggleFaq = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search FAQs..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Search FAQs"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                !activeCategory ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {faqs.map((category) => (
              <button
                key={category.category}
                onClick={() => setActiveCategory(category.category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.category
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>
        </div>
        {filteredFaqs.length === 0 ? (
          <div className="text-center text-gray-300">
            <p>No FAQs found matching your search.</p>
            <p>
              Still have questions?{' '}
              <a href="/support" className="text-yellow-400 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        ) : (
          filteredFaqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-yellow-400">{category.category}</h3>
              <div className="space-y-4">
                {category.questions.map((faq, qIndex) => {
                  const globalIndex = `${catIndex}-${qIndex}`;
                  return (
                    <div
                      key={globalIndex}
                      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-sm transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleFaq(globalIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleFaq(globalIndex);
                          }
                        }}
                        className="w-full flex justify-between items-center p-4 text-left text-base sm:text-lg font-medium text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-expanded={openIndex === globalIndex}
                        aria-controls={`faq-answer-${globalIndex}`}
                      >
                        <span>{faq.question}</span>
                        <span className={`text-yellow-400 transition-transform duration-300 ${openIndex === globalIndex ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      <div
                        id={`faq-answer-${globalIndex}`}
                        className={`p-4 text-gray-300 text-sm sm:text-base border-t border-gray-700 transition-all duration-300 ${
                          openIndex === globalIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div className="mt-8 text-center text-gray-300">
          <p>Can’t find your answer?</p>
          <a href="/support" className="text-yellow-400 hover:underline">
            Contact our support team
          </a>
        </div>
      </div>
    </div>
  );
}

export default Faq;