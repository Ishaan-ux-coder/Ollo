import React from 'react';
import Navbar from '../components/Navbar';

const RulesPage = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-warm-card rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-warm-text mb-8 text-center">📜 Rules to Follow</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Do's Section */}
            <div className="bg-green-100 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-green-800 mb-4">✅ Do’s</h2>
              <ul className="space-y-3 text-green-700 list-disc list-inside">
                <li>Respect other users at all times.</li>
                <li>Use the platform for friendly and meaningful conversations.</li>
                <li>Follow community guidelines and local laws.</li>
                <li>Report inappropriate behavior immediately.</li>
                <li>Keep your camera and microphone working for an authentic experience.</li>
              </ul>
            </div>

            {/* Don'ts Section */}
            <div className="bg-red-100 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-red-800 mb-4">❌ Don’ts</h2>
              <ul className="space-y-3 text-red-700 list-disc list-inside">
                <li>No nudity, sexual content, or explicit behavior.</li>
                <li>No hate speech, harassment, or abusive language.</li>
                <li>No spamming, advertising, or scamming.</li>
                <li>No recording or sharing private chats without consent.</li>
                <li>No impersonation or fake profiles.</li>
              </ul>
            </div>
          </div>

          {/* Violations Section */}
          <div className="mt-8 text-center bg-yellow-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">⚠️ Violations may result in:</h2>
            <ul className="text-yellow-700">
              <li>Temporary ban</li>
              <li>Permanent suspension</li>
              <li>Legal action (if required)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;