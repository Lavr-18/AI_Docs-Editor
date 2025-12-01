const API_BASE_URL = window.location.origin;

// Helper function to make API calls
async function apiCall(method, path, data = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/static/login.html'; // Redirect to login if no token
            return;
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, config);
        if (response.ok) {
            if (response.status === 204) return null; // No content for successful PUT
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Something went wrong');
        }
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// --- Authentication Logic ---
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('message');

    try {
        const form = new URLSearchParams();
        form.append('username', email);
        form.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form.toString(),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            window.location.href = '/static/editor.html';
        } else {
            const errorData = await response.json();
            messageDiv.textContent = errorData.detail || 'Login failed';
        }
    } catch (error) {
        console.error('Login Error:', error);
        messageDiv.textContent = 'An error occurred during login.';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageDiv = document.getElementById('message');

    try {
        const data = { email, password };
        const response = await apiCall('POST', '/auth/register', data, false);

        if (response) {
            messageDiv.textContent = 'Registration successful! Please log in.';
            messageDiv.style.color = 'green';
            // Optionally clear the form
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
        }
    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.style.color = 'red';
    }
}

function handleLogout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/static/login.html';
}

// --- Document Management Logic ---
let currentDocumentId = null;

async function loadDocuments() {
    try {
        const documents = await apiCall('GET', '/documents');
        const documentsList = document.getElementById('documentsList');
        documentsList.innerHTML = '';
        documents.forEach(doc => {
            const li = document.createElement('li');
            li.textContent = doc.title;
            li.dataset.id = doc.id;
            li.addEventListener('click', () => loadDocumentContent(doc.id, doc.title));
            documentsList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to load documents:', error);
        // Handle error, e.g., redirect to login if token expired
        if (error.message === 'Could not validate credentials') { // Example check
             window.location.href = '/static/login.html';
        }
    }
}

async function createDocument(event) {
    event.preventDefault();
    const newDocumentTitleInput = document.getElementById('newDocumentTitle');
    const title = newDocumentTitleInput.value;

    if (!title) return;

    try {
        const newDoc = await apiCall('POST', '/documents/', { title });
        newDocumentTitleInput.value = '';
        await loadDocuments(); // Reload the list of documents
        loadDocumentContent(newDoc.id, newDoc.title); // Load the newly created document
    } catch (error) {
        console.error('Failed to create document:', error);
        alert('Failed to create document: ' + error.message);
    }
}

async function loadDocumentContent(docId, docTitle) {
    try {
        const content = await apiCall('GET', `/documents/${docId}`);
        document.getElementById('documentTitle').value = docTitle;
        document.getElementById('editor-area').value = content;
        currentDocumentId = docId;
    } catch (error) {
        console.error('Failed to load document content:', error);
        alert('Failed to load document content: ' + error.message);
    }
}

async function saveDocumentContent() {
    if (!currentDocumentId) {
        alert('No document selected to save.');
        return;
    }
    const content = document.getElementById('editor-area').value;
    try {
        await apiCall('PUT', `/documents/${currentDocumentId}`, content);
        alert('Document saved successfully!');
    } catch (error) {
        console.error('Failed to save document:', error);
        alert('Failed to save document: ' + error.message);
    }
}

// --- AI Assistant Logic ---
async function sendAiPrompt() {
    if (!currentDocumentId) {
        alert('Please select a document before using the AI assistant.');
        return;
    }
    const aiPromptInput = document.getElementById('aiPrompt');
    const userPrompt = aiPromptInput.value;
    const currentText = document.getElementById('editor-area').value;
    const aiResponseDiv = document.getElementById('aiResponse');

    if (!userPrompt) return;

    aiResponseDiv.textContent = 'AI is thinking...';
    try {
        const response = await apiCall('POST', `/documents/${currentDocumentId}/assist`, {
            current_text: currentText,
            user_prompt: userPrompt
        });
        aiResponseDiv.textContent = ''; // Clear "AI is thinking..."
        document.getElementById('editor-area').value += "\n\n" + response; // Append AI response to editor
        aiPromptInput.value = ''; // Clear AI prompt input
    } catch (error) {
        console.error('AI Assistant Error:', error);
        aiResponseDiv.textContent = 'Error: ' + error.message;
    }
}


// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('login.html') || path === '/') {
        // Login/Register page
        if (localStorage.getItem('accessToken')) {
            window.location.href = '/static/editor.html'; // Already logged in, redirect
        }
        document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
        document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    } else if (path.includes('editor.html')) {
        // Editor page
        if (!localStorage.getItem('accessToken')) {
            window.location.href = '/static/login.html'; // Not logged in, redirect
        }
        document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
        document.getElementById('newDocumentForm')?.addEventListener('submit', createDocument);
        document.getElementById('saveDocumentButton')?.addEventListener('click', saveDocumentContent);
        document.getElementById('sendAiPromptButton')?.addEventListener('click', sendAiPrompt);
        loadDocuments();
    }
});
