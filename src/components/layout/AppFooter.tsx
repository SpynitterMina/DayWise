'use client';

import { useState, useEffect } from 'react';

export default function AppFooter() {
  const [currentYear, setCurrentYear] = useState<number | string>(''); // Initialize with empty string or placeholder

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-center py-6 border-t border-border">
      <p className="text-muted-foreground">
        &copy; {currentYear} DayWise. Stay organized, focused, and reflective!
      </p>
    </footer>
  );
}
