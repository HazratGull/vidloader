import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  path: '/',
  navigate: () => {},
});

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    if (!to) return;
    if (to.startsWith('http://') || to.startsWith('https://')) {
      window.location.href = to;
      return;
    }

    if (to !== path) {
      window.history.pushState({}, '', to);
      setPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({ to, children, className = '', activeClassName = '', onClick, ...props }) {
  const { path, navigate } = useRouter();
  const isActive = path === to;

  const handleClick = (e) => {
    // allow cmd/ctrl click to open in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  const combinedClass = [className, isActive ? activeClassName : ''].filter(Boolean).join(' ');

  return (
    <a href={to} onClick={handleClick} className={combinedClass} {...props}>
      {children}
    </a>
  );
}
