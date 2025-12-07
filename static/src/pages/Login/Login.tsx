import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../../components/Button/Button.tsx';
import { Input } from '../../components/Input/Input.tsx';
import { authAPI } from '../../services/api';
import styles from './Login.module.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                const response = await authAPI.login({
                    email: formData.email,
                    password: formData.password,
                });
                localStorage.setItem('accessToken', response.data.access_token);
                navigate('/editor');
            } else {
                await authAPI.register({
                    email: formData.email,
                    password: formData.password,
                });
                setError('Registration successful! Please login.');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>AI Document Editor</h1>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        type="email"
                        label="Email"
                        icon={Mail}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        icon={Lock}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    {error && (
                        <div className={`${styles.error} ${
                            error.includes('successful')
                                ? styles.success
                                : styles.danger
                        }`}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="xl"
                        isLoading={isLoading}
                        startIcon={<LogIn size={20} />}
                        className="w-full"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>
                </form>

                <div className={styles.switchMode}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className={styles.switchButton}
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};