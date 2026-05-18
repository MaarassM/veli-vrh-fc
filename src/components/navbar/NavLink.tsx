import { NavLink as RouterNavLink } from 'react-router';
import { motion } from 'motion/react';

interface NavLinkProps {
  to: string;
  label: string;
  onClick?: () => void;
  isDark?: boolean;
}

export default function NavLink({ to, label, onClick, isDark = false }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className="relative pb-1"
    >
      {({ isActive }) => (
        <>
          <span
            className={`font-medium text-sm transition-colors ${
              isActive
                ? 'text-orange-400'
                : isDark
                ? 'text-white hover:text-orange-400'
                : 'text-gray-700 hover:text-orange-500'
            }`}
          >
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="navbar-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </RouterNavLink>
  );
}
