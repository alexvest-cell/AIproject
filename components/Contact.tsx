'use client';
import React from 'react';
import { Section } from '../types';
import { Layers, ShieldCheck, Mail, FileText } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface ContactProps {
  onShowAbout: () => void;
  onSubscribeClick: () => void;
  onCategorySelect?: (category: string) => void;
}

const Contact: React.FC<ContactProps> = ({ onShowAbout, onSubscribeClick, onCategorySelect }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id={Section.CONTACT} className="bg-black border-t border-white/10 pt-20 pb-8 rounded-t-[3rem] mt-12">
      <div className="container mx-auto px-6 md:px-12">

        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Column 1: Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Layers size={18} className="text-blue-500" />
              Categories
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                    className="text-zinc-400 hover:text-white transition-colors text-sm text-left hover:translate-x-1 duration-300 block"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Popular Guides */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Popular Guides</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Building Autonomous Agents
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  LLM Fine-tuning 101
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  RAG Architecture Patterns
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Prompt Engineering Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  AI Ethics Checklist
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={onShowAbout} className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 flex items-center gap-2">
                  About Us
                </button>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Editorial Policy
                </a>
              </li>
              <li>
                <a href="mailto:contact@thetoolcurrent.com" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm hover:translate-x-1 duration-300 block">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            © {currentYear} ToolCurrent | Independent AI Tools Media
          </p>
          <div className="flex items-center gap-6">
            {/* Socials minimal */}
            <a href="#" className="text-zinc-600 hover:text-white transition-colors"><span className="sr-only">X</span><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
            <a href="#" className="text-zinc-600 hover:text-white transition-colors"><span className="sr-only">LinkedIn</span><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Contact;