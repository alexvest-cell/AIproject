import React from 'react';
import { Section } from '../types';
import { Bell, ShieldCheck, Instagram, Facebook, Twitter } from 'lucide-react';

interface ContactProps {
  onShowAbout: () => void;
  onSubscribeClick: () => void;
}

const Contact: React.FC<ContactProps> = ({ onShowAbout, onSubscribeClick }) => {
  return (
    <footer id={Section.CONTACT} className="py-12 bg-black border-t border-white/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand & Rights */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-serif font-bold text-white mb-2">Planetary Brief</h2>
            <p className="text-xs text-news-muted">© {new Date().getFullYear()} Global Environmental Intelligence.</p>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/planetarybrief"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110"
              title="Instagram"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587322058668"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110"
              title="Facebook"
            >
              <Facebook size={14} />
            </a>
            <a
              href="https://x.com/planetarybrief"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110"
              title="X (Twitter)"
            >
              <Twitter size={14} />
            </a>
            <a
              href="https://tiktok.com/@planetarybrief"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 font-bold text-[10px]"
              title="TikTok"
            >
              TT
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onShowAbout}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              <ShieldCheck size={14} />
              About
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Contact;