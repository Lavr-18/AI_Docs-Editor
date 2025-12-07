import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'md',
                                                  isLoading = false,
                                                  startIcon,
                                                  endIcon,
                                                  children,
                                                  className = '',
                                                  disabled,
                                                  ...props
                                              }) => {
    const variantClass = styles[variant];
    const sizeClass = styles[size];
    const loadingClass = isLoading ? styles.loading : '';

    return (
        <button
            className={`${styles.button} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <Loader2 className={`${styles.icon} ${styles.iconStart} spin-animation`} />
            )}
            {!isLoading && startIcon && (
                <span className={`${styles.icon} ${styles.iconStart}`}>
          {startIcon}
        </span>
            )}
            {children}
            {endIcon && (
                <span className={`${styles.icon} ${styles.iconEnd}`}>
          {endIcon}
        </span>
            )}
        </button>
    );
};

// Add spin animation to global styles via JS
// @ts-ignore
const style = document.createElement('style');
style.textContent = `
  .spin-animation {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);