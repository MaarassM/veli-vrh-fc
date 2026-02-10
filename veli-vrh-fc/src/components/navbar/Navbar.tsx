import { useState } from "react";
import { Link } from "react-router";
import { Menu } from "lucide-react";
import { useStickyNavbar } from "@/hooks/useStickyNavbar";
import { navigationItems } from "@/data/navigation";
import NavLink from "./NavLink";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const { isScrolled } = useStickyNavbar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/90 backdrop-blur-md shadow-md"
          : "py-5 bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/logo.png"
            alt="NK Veli Vrh"
            className="h-15 w-15 object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <NavLink key={item.path} to={item.path} label={item.label} />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
          className="md:hidden rounded-full p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
