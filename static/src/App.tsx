import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { Editor } from './pages/Editor/Editor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/global.css';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return token ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return !token ? <>{children}</> : <Navigate to="/editor" />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/editor" element={
                        <PrivateRoute>
                            <Editor />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;