import { Link, useLocation } from "wouter";
import norsecLogo from "@assets/norsec_cover.png";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full flex justify-between items-center px-8" style={{ height: '10vh' }}>
        <Link href="/">
          <img src={norsecLogo} alt="Norsec" className="h-12 cursor-pointer" />
        </Link>
        
        <div className="flex space-x-8">
          <Link href="/" className={`font-medium transition-colors ${
            location === "/" 
              ? "text-norsec-primary border-b-2 border-norsec-primary" 
              : "text-gray-700 hover:text-norsec-primary"
          }`}>
            Home
          </Link>
          
          <Link href="/calendar" className={`font-medium transition-colors ${
            location === "/calendar" 
              ? "text-norsec-primary border-b-2 border-norsec-primary" 
              : "text-gray-700 hover:text-norsec-primary"
          }`}>
            Calendar
          </Link>
          
          <Link href="/breach-tracker" className={`font-medium transition-colors ${
            location === "/breach-tracker" 
              ? "text-norsec-primary border-b-2 border-norsec-primary" 
              : "text-gray-700 hover:text-norsec-primary"
          }`}>
            Breach Tracker
          </Link>

          <Link href="/news" className={`font-medium transition-colors ${
            location === "/news" 
              ? "text-norsec-primary border-b-2 border-norsec-primary" 
              : "text-gray-700 hover:text-norsec-primary"
          }`}>
            News
          </Link>
        </div>
      </div>
    </nav>
  );
}
