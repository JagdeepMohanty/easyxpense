import { useEffect } from 'react';

export const usePageTransition = () => {
  useEffect(() => {
    document.body.classList.add('animate-fade-in');
    return () => {
      document.body.classList.remove('animate-fade-in');
    };
  }, []);
};
