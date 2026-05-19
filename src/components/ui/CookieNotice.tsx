import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie-notice-dismissed';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
      <p className="text-sm text-gray-300 max-w-3xl">
        Ova stranica koristi neophodne tehničke kolačiće za ispravno funkcioniranje.
        Nastavkom korištenja stranice prihvaćate njihovu upotrebu.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        Razumijem
      </button>
    </div>
  );
}
