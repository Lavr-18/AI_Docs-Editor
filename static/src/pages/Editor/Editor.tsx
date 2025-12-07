import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    Plus,
    Save,
    Trash2,
    Bot,
    FileText,
    Loader2
} from 'lucide-react';
import { Button } from '../../components/Button/Button.tsx';
import { Input } from '../../components/Input/Input.tsx';
import { TextArea } from '../../components/TextArea/TextArea.tsx';
import { documentsAPI, authAPI } from '../../services/api';
import type {Document} from '../../types';
import styles from './Editor.module.css';

export const Editor: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
    const [content, setContent] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await documentsAPI.getAll();
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDocTitle.trim()) return;

        try {
            const response = await documentsAPI.create(newDocTitle);
            setDocuments([...documents, response.data]);
            setCurrentDoc(response.data);
            setContent('');
            setNewDocTitle('');
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    };

    const handleSelectDocument = async (doc: Document) => {
        try {
            const response = await documentsAPI.getById(doc.id);
            setCurrentDoc(doc);
            setContent(response.data);
        } catch (error) {
            console.error('Failed to load document:', error);
        }
    };

    const handleSaveDocument = async () => {
        if (!currentDoc) return;

        try {
            setIsSaving(true);
            await documentsAPI.update(currentDoc.id, content);
        } catch (error) {
            console.error('Failed to save document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDocument = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentsAPI.delete(id);
            setDocuments(documents.filter(doc => doc.id !== id));
            if (currentDoc?.id === id) {
                setCurrentDoc(null);
                setContent('');
            }
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    const handleAiAssist = async () => {
        if (!currentDoc || !aiPrompt.trim()) return;

        try {
            setIsAiProcessing(true);
            setAiResponse('');

            const response = await documentsAPI.assist(currentDoc.id, {
                current_text: content,
                user_prompt: aiPrompt,
            });

            setContent(prev => prev + '\n\n' + response.data);
            setAiPrompt('');
        } catch (error) {
            console.error('AI Assist error:', error);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate('/login');
    };

    return (
        <div className={styles.editorPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <FileText className={styles.logoIcon} />
                        <span className={styles.logoText}>AI Document Editor</span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        startIcon={<LogOut size={18} />}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.contentGrid}>
                    {/* Sidebar - Documents List */}
                    <div className={styles.sidebar}>
                        <h2 className={styles.sidebarTitle}>Your Documents</h2>

                        <form onSubmit={handleCreateDocument} className={styles.newDocForm}>
                            <Input
                                placeholder="New document title"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" variant="primary">
                                <Plus size={18} />
                            </Button>
                        </form>

                        <div className={styles.documentsList}>
                            {isLoading ? (
                                <div className={styles.loading}>
                                    <Loader2 className="spin-animation" size={24} />
                                </div>
                            ) : documents.length === 0 ? (
                                <p className={styles.emptyState}>No documents yet</p>
                            ) : (
                                documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleSelectDocument(doc)}
                                        className={`${styles.documentItem} ${
                                            currentDoc?.id === doc.id ? styles.active : ''
                                        }`}
                                    >
                                        <div className={styles.documentInfo}>
                                            <div className={styles.documentTitle}>
                                                {doc.title}
                                            </div>
                                            <div className={styles.documentDate}>
                                                {new Date(doc.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDeleteDocument(doc.id, e)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Editor */}
                    <div className={styles.editorSection}>
                        <div className={styles.editorHeader}>
                            <div>
                                <h2 className={styles.editorTitle}>
                                    {currentDoc ? currentDoc.title : 'Select a document'}
                                </h2>
                                {currentDoc && (
                                    <p className={styles.editorSubtitle}>
                                        Last updated: {new Date(currentDoc.updated_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            {currentDoc && (
                                <Button
                                    onClick={handleSaveDocument}
                                    isLoading={isSaving}
                                    variant="primary"
                                    startIcon={<Save size={18} />}
                                >
                                    Save
                                </Button>
                            )}
                        </div>

                        <TextArea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your document here..."
                            className={styles.editorTextarea}
                            disabled={!currentDoc}
                        />
                    </div>

                    {/* AI Assistant */}
                    <div className={styles.aiSection}>
                        <div className={styles.aiHeader}>
                            <Bot className={styles.aiIcon} />
                            <h2 className={styles.aiTitle}>AI Assistant</h2>
                        </div>

                        <div className={styles.aiPrompt}>
                            <TextArea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ask AI to help with your document..."
                                rows={4}
                                disabled={!currentDoc || isAiProcessing}
                            />
                        </div>

                        <Button
                            onClick={handleAiAssist}
                            isLoading={isAiProcessing}
                            disabled={!currentDoc || !aiPrompt.trim()}
                            variant="primary"
                            startIcon={<Bot size={18} />}
                            className="w-full mb-4"
                        >
                            Ask AI
                        </Button>

                        {aiResponse && (
                            <div className={styles.aiResponse}>
                                <p className="font-medium text-gray-700 mb-2">AI Response:</p>
                                <p>{aiResponse}</p>
                            </div>
                        )}

                        <div className={styles.aiExamples}>
                            <p className={styles.examplesTitle}>Examples:</p>
                            <ul className={styles.examplesList}>
                                <li>"Summarize this document"</li>
                                <li>"Improve the grammar"</li>
                                <li>"Translate to Spanish"</li>
                                <li>"Make this more professional"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};