
import React from 'react'
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react'

interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: 'home' },
      { name: 'How to Use', href: 'how-to-use' },
      { name: 'Pricing', href: 'home' },
      { name: 'Updates', href: 'home' },
    ],
    company: [
      { name: 'About Us', href: 'about' },
      { name: 'Contact', href: 'contact' },
      { name: 'Careers', href: 'contact' },
      { name: 'Blog', href: 'home' },
    ],
    legal: [
      { name: 'Privacy Policy', href: 'privacy' },
      { name: 'Terms of Service', href: 'terms' },
      { name: 'Cookie Policy', href: 'privacy' },
      { name: 'Security', href: 'privacy' },
    ],
    support: [
      { name: 'Help Center', href: 'how-to-use' },
      { name: 'Community', href: 'contact' },
      { name: 'Documentation', href: 'how-to-use' },
      { name: 'API', href: 'contact' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Journie</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Empowering researchers worldwide with intelligent tools for collaboration, 
              discovery, and knowledge management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Journie. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => onNavigate('privacy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
