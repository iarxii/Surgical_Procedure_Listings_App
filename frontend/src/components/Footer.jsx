import { Link } from 'react-router-dom';
import { Github, FileText, Shield, Link2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="backdrop-blur-md shadow-sm border-t py-3 mt-auto sticky bottom-0 z-10 w-full"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 85%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs font-medium">
        <div className="mb-2 sm:mb-0 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} Thabang Mposula | Adaptivconcept FL. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/iarxii/Surgical_Procedure_Listings_App"
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
            title="GitHub"
          >
            <Github className="h-3 w-3" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          
          <Link 
            to="/license" 
            className="flex items-center gap-1 transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">License</span>
          </Link>
          
          <Link 
            to="/privacy" 
            className="flex items-center gap-1 transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Privacy Policy</span>
          </Link>

          <Link 
            to="/terms" 
            className="flex items-center gap-1 transition-colors hover:opacity-80" 
            style={{ color: 'var(--text-secondary)' }}
          >
            <Link2 className="h-3 w-3" />
            <span className="hidden sm:inline">Terms</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
