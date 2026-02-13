import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import PageTransition from './PageTransition';

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
