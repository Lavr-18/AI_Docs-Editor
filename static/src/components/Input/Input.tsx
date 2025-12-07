import React from 'react';
import type {LucideIcon} from 'lucide-react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                icon: Icon,
                                                className = '',
                                                ...props
                                            }) => {
    const inputClasses = [
        styles.input,
        error ? styles.error : '',
        Icon ? styles.withIcon : '',
        className
    ].join(' ');

    return (
        <div className={styles.inputContainer}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.inputWrapper}>
                {Icon && (
                    <Icon className={styles.icon} size={20} />
                )}
                <input
                    className={inputClasses}
                    {...props}
                />
            </div>
            {error && (
                <p className={styles.errorMessage}>{error}</p>
            )}
        </div>
    );
};