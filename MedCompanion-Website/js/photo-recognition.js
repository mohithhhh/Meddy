// Photo Recognition and AI Chat Functionality

// Mock medication database
const medicationDatabase = {
    'metformin': {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500mg',
        drugClass: 'Antidiabetic',
        description: 'Used to control blood sugar levels in people with type 2 diabetes.',
        sideEffects: 'Nausea, diarrhea, stomach upset',
        instructions: 'Take with food to reduce stomach upset'
    },
    'lisinopril': {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        drugClass: 'ACE Inhibitor',
        description: 'Used to treat high blood pressure and heart failure.',
        sideEffects: 'Dizziness, dry cough, headache',
        instructions: 'Take once daily, preferably at the same time each day'
    },
    'aspirin': {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        dosage: '81mg',
        drugClass: 'Antiplatelet',
        description: 'Used to reduce the risk of heart attack and stroke.',
        sideEffects: 'Stomach upset, heartburn',
        instructions: 'Take with food or milk'
    }
};

// Current conversation context
let currentMedication = null;
let conversationHistory = [];

// File upload handling
document.getElementById('fileInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// Drag and drop
const uploadZone = document.getElementById('uploadZone');
if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#4A90E2';
        uploadZone.style.background = 'rgba(74, 144, 226, 0.1)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'rgba(74, 144, 226, 0.3)';
        uploadZone.style.background = '';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
        uploadZone.style.borderColor = 'rgba(74, 144, 226, 0.3)';
        uploadZone.style.background = '';
    });
}

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        // Show preview
        const uploadArea = document.querySelector('.photo-upload-area');
        document.getElementById('uploadZone').classList.add('hidden');
        const preview = document.getElementById('photoPreview');
        preview.classList.remove('hidden');
        document.getElementById('previewImage').src = e.target.result;

        // Simulate AI recognition (in production, this would call an API)
        setTimeout(() => {
            recognizePill();
        }, 1500);
    };
    reader.readAsDataURL(file);
}

function recognizePill() {
    // Simulate pill recognition (randomly pick a medication for demo)
    const meds = Object.keys(medicationDatabase);
    const randomMed = meds[Math.floor(Math.random() * meds.length)];
    currentMedication = medicationDatabase[randomMed];

    // Add AI message with recognition result
    addAIMessage(`I've identified your medication! This appears to be **${currentMedication.name}** (${currentMedication.genericName}), ${currentMedication.dosage}.

**What it's for:** ${currentMedication.description}

**Drug class:** ${currentMedication.drugClass}

Would you like to know more about side effects, dosage instructions, or anything else?`);
}

function resetUpload() {
    document.getElementById('uploadZone').classList.remove('hidden');
    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('previewImage').src = '';
    document.getElementById('fileInput').value = '';
    currentMedication = null;
}

// Chat functionality
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addUserMessage(message);
    input.value = '';

    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage(response);
    }, 800);
}

// Allow Enter key to send
document.getElementById('chatInput')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    conversationHistory.push({ role: 'user', content: text });
}

function addAIMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ai-message';
    messageDiv.innerHTML = `<div class="message-content">${formatMessage(text)}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    conversationHistory.push({ role: 'ai', content: text });
}

function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Guard rails - dangerous queries
    if (lowerMessage.includes('dosage change') ||
        lowerMessage.includes('stop taking') ||
        lowerMessage.includes('instead of') ||
        lowerMessage.includes('replace')) {
        return "I can't provide advice on changing your medication dosage or treatment plan. Please consult your doctor or pharmacist for any changes to your prescribed medications. Your safety is my top priority!";
    }

    // Context-aware responses
    if (currentMedication) {
        if (lowerMessage.includes('side effect')) {
            return `Common side effects of ${currentMedication.name} include: ${currentMedication.sideEffects}. 

If you experience severe or persistent side effects, please contact your healthcare provider immediately.`;
        }

        if (lowerMessage.includes('how to take') || lowerMessage.includes('instruction')) {
            return `**Instructions for ${currentMedication.name}:**

${currentMedication.instructions}

Always follow your doctor's specific instructions, as they may differ based on your individual needs.`;
        }

        if (lowerMessage.includes('what is') || lowerMessage.includes('what does')) {
            return `${currentMedication.name} is a ${currentMedication.drugClass} medication. ${currentMedication.description}

It's important to take it as prescribed by your doctor for the best results.`;
        }

        if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
            return `${currentMedication.instructions}

If you're unsure about food interactions, check with your pharmacist or the medication guide that came with your prescription.`;
        }

        if (lowerMessage.includes('miss') || lowerMessage.includes('forgot')) {
            return `If you miss a dose of ${currentMedication.name}, take it as soon as you remember. However, if it's almost time for your next dose, skip the missed dose and continue with your regular schedule.

Never double up on doses. If you're unsure, contact your pharmacist for guidance.`;
        }
    }

    // General helpful responses
    if (lowerMessage.includes('thank')) {
        return "You're welcome! I'm here to help you understand your medications better. Feel free to ask anything else!";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm here to help you with your medication questions. Upload a photo of your pill, or ask me anything about your medications!";
    }

    // Default response
    return `I'd be happy to help with that! ${currentMedication ? `For ${currentMedication.name}, ` : ''}I can provide information about:

• Side effects
• How to take it
• What it's used for
• What to do if you miss a dose

What would you like to know?`;
}

function formatMessage(text) {
    // Convert markdown-style bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('Photo recognition module loaded');
