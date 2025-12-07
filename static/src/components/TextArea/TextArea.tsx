import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
                                                      label,
                                                      error,
                                                      className = '',
                                                      ...props
                                                  }) => {
    const textareaClasses = [
        styles.textarea,
        error ? styles.error : '',
        className
    ].join(' ');

    return (
        <div className={styles.textareaContainer}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}
            <textarea
                className={textareaClasses}
                {...props}
            />
            {error && (
                <p className={styles.errorMessage}>{error}</p>
            )}
        </div>
    );
};