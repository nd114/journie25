import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 mt-12 sm:mt-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold">Mars' Hill</span>
            </div>
            <p className="text-gray-400 text-sm">
              Where curiosity meets discovery. Transforming academic papers into engaging research stories.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/library" className="text-gray-400 hover:text-white transition-colors">Browse Papers</Link></li>
              <li><Link to="/trending" className="text-gray-400 hover:text-white transition-colors">Trending Research</Link></li>
              <li><Link to="/communities" className="text-gray-400 hover:text-white transition-colors">Communities</Link></li>
              <li><Link to="/learning-paths" className="text-gray-400 hover:text-white transition-colors">Learning Paths</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/tools" className="text-gray-400 hover:text-white transition-colors">Research Tools</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Mars' Hill. All rights reserved.
          </p>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors text-sm">Twitter</a>
            <a href="#" className="hover:text-white transition-colors text-sm">GitHub</a>
            <a href="#" className="hover:text-white transition-colors text-sm">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
