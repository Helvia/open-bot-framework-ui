import React from 'react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  brand: string;
  items: NavItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
  userMenu?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  brand,
  items,
  currentPath,
  onNavigate,
  userMenu,
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-primary-600">{brand}</div>
            <div className="hidden md:flex gap-1">
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    currentPath === item.href
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {userMenu}
        </div>
      </div>
    </nav>
  );
};
