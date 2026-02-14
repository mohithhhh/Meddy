// Dashboard Logic with AI Backend Integration

const supabase = window.supabaseClient;
const AI_BACKEND_URL = window.AI_BACKEND_URL;

let currentUser = null;

// Check authentication
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = session.user;
    document.getElementById('user-email').textContent = currentUser.email;
}

// Sign out
document.getElementById('signout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// Sidebar navigation
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget.getAttribute('href').substring(1);

        // Update active state
        document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
        e.currentTarget.parentElement.classList.add('active');

        // Show corresponding section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${target}-section`).classList.add('active');
    });
});

// AI Chat Functionality
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Add message to chat
function addMessage(content, isUser = false, showDisclaimer = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? currentUser.email[0].toUpperCase() : 'AI';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    // Parse content and add paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        messageContent.appendChild(p);
    });

    // Add timestamp
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    messageContent.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message';
    typingDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';

    messageContent.appendChild(typingIndicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(messageContent);
    chatMessages.appendChild(typingDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message to AI backend
async function sendMessage(message) {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                include_history: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error calling AI backend:', error);
        throw error;
    }
}

// Handle chat form submission
chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);

    // Clear input
    chatInput.value = '';

    // Disable send button
    sendBtn.disabled = true;
    chatInput.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call AI backend
        const response = await sendMessage(message);

        // Remove typing indicator
        removeTypingIndicator();

        // Add AI response
        if (response.is_refused) {
            addMessage(response.response, false, false);
        } else {
            addMessage(response.response, false, true);
        }

    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please make sure the AI backend is running and try again.', false);
    } finally {
        // Re-enable send button
        sendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
});

// Initialize
checkAuth();
