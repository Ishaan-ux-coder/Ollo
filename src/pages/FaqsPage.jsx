import React from 'react';
import Navbar from '../components/Navbar';

const FaqsPage = () => {
  const faqs = [
    { q: "What is this platform about?", a: "This is a random video chat platform that connects you with new people worldwide for live, face-to-face conversations." },
    { q: "Do I need to create an account?", a: "Depending on the setup, some features may require an account (for reporting, filters, or preferences), while basic random chat may be available without signup." },
    { q: "Is it free to use?", a: "Yes, the core video chat service is free. However, some premium features (like country filters, interest matching, or ad-free experience) may require a subscription." },
    { q: "How do I start a chat?", a: "Simply allow camera and microphone access, press Start, and you’ll be paired with a random user." },
    { q: "Can I choose who I chat with?", a: "You can filter by country, interests, or hobbies (if enabled), but the actual match is random." },
    { q: "What if I meet someone inappropriate?", a: "Use the Report or Next button immediately. Our team reviews reports and takes action against violators." },
    { q: "Is the chat anonymous?", a: "Yes. Unless you choose to share personal details, you remain anonymous. Please never share sensitive information." },
    { q: "Can I record or screenshot chats?", a: "Recording or screenshotting without consent is strictly prohibited and may lead to suspension." },
    { q: "Is there an age limit?", a: "Yes, the platform is strictly 18+ (or as per your country’s law). Underage use is not allowed." },
    { q: "How do I stay safe?", a: "Do not share personal info (address, phone number, financial details). End the chat if you feel uncomfortable. Report any suspicious behavior." }
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-warm-card rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-warm-text mb-8 text-center">Frequently Asked Questions (FAQ)</h1>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-warm-primary mb-2">{index + 1}. {faq.q}</h2>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqsPage;