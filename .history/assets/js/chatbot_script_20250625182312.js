let isChatOpen = true;
let isProcessing = false;

// Initialize chat icon only if it does not exist
if (!document.querySelector('.chat-icon')) {
    chatIcon = document.createElement('div');
    chatIcon.innerHTML = '💬';
    chatIcon.classList.add('chat-icon');
    // Append the chat icon to the body
    document.body.appendChild(chatIcon);

    // Attach click event to the chat icon right after creating it
    chatIcon.onclick = function() {
        toggleChat();
    };
} else {
    // If it already exists, just reference it
    chatIcon = document.querySelector('.chat-icon');
}

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    const chatContent = document.getElementById('chatContent');

    if (isChatOpen) {
        // Smooth close animation
        chatbot.style.transform = 'translateY(20px) scale(0.95)';
        chatbot.style.opacity = '0';
        
        setTimeout(() => {
            chatbot.style.display = 'none';
            chatContent.style.display = 'none';
            chatIcon.style.display = 'flex';
        }, 200);
        
        isChatOpen = false;
    } else {
        // Smooth open animation
        chatbot.style.display = 'flex';
        chatContent.style.display = 'flex';
        chatIcon.style.display = 'none';
        
        setTimeout(() => {
            chatbot.style.transform = 'translateY(0) scale(1)';
            chatbot.style.opacity = '1';
        }, 10);
        
        isChatOpen = true;
        
        // Focus on input when opening
        const questionElement = document.getElementById('question');
        setTimeout(() => questionElement.focus(), 300);
    }
}

let resumeText = "";

// Function to load resume text from resume.txt
async function loadResume() {
    console.log("Loading resume...");
    try {
        const response = await fetch('files/Luca_Lit_Resume_Mar2024.txt');
        resumeText = await response.text();
        console.log("Resume loaded successfully");
    } catch (error) {
        console.error("Failed to load resume:", error);
    }
}

let questionCount = 0; // Initialize question count

// Enhanced message display function
function displayMessage(sender, message, isUser = false) {
    const chatHistory = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const senderElement = document.createElement('strong');
    senderElement.textContent = `${sender}: `;
    
    const textElement = document.createElement('span');
    textElement.textContent = message;
    
    messageContent.appendChild(senderElement);
    messageContent.appendChild(textElement);
    messageDiv.appendChild(messageContent);
    
    chatHistory.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

// Enhanced typing indicator
function showTypingIndicator() {
    const chatHistory = document.getElementById('chatHistory');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <div class="bounce-dot"></div>
            <div class="bounce-dot"></div>
            <div class="bounce-dot"></div>
        </div>
        <span>Luca is typing...</span>
    `;
    
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTo({
        top: chatHistory.scrollHeight,
        behavior: 'smooth'
    });
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced question asking function
async function askQuestion() {
    if (isProcessing) return; // Prevent multiple simultaneous requests
    
    const questionElement = document.getElementById('question');
    const sendButton = document.getElementById('sendButton');
    const question = questionElement.value.trim();

    // Do not proceed if the question is empty
    if (!question) {
        // Add a subtle shake animation to indicate empty input
        questionElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            questionElement.style.animation = '';
        }, 500);
        return;
    }

    // Rate limiting
    if (questionCount >= 8) {
        displayMessage("System", "You've asked too many questions within one minute! Taking a quick break - ask me again in a few! 😁", false);
        return;
    }

    // Set processing state
    isProcessing = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '<div class="spinner"></div>';
    
    // Display user's question
    displayMessage("You", question, true);

    // Clear the input field
    questionElement.value = '';
    questionElement.style.height = 'auto'; // Reset height for multi-line inputs

    // Increment question count and reset after 2 minutes
    questionCount++;
    setTimeout(() => {
        questionCount = Math.max(0, questionCount - 1);
    }, 60000 * 2);

    // Show typing indicator
    showTypingIndicator();

    // Define the payload
    const payload = {
        question: question,
        context: resumeText
    };

    try {
        // Make the API call
        const response = await fetch('https://selssv957e.execute-api.us-east-1.amazonaws.com/Production//ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://lucalit888.github.io'
            },
            body: JSON.stringify(payload)
        });

        hideTypingIndicator();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const bodyObject = JSON.parse(data.body);
        const content = bodyObject.choices?.[0]?.message?.content;

        if (content) {
            displayMessage("Luca", content, false);
        } else {
            displayMessage("Luca", "Sorry, I couldn't process that question. Could you try rephrasing it?", false);
        }

    } catch (error) {
        hideTypingIndicator();
        console.error('Error:', error);
        displayMessage("Luca", "Sorry, I'm having trouble connecting right now. Please try again in a moment!", false);
    } finally {
        // Reset processing state
        isProcessing = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '<span>Send</span><span>🚀</span>';
        
        // Focus back on input
        questionElement.focus();
    }
}

// Enhanced input handling
document.addEventListener('DOMContentLoaded', function() {
    const questionElement = document.getElementById('question');
    
    if (questionElement) {
        // Auto-resize textarea functionality
        questionElement.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        // Enhanced enter key handling
        questionElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
            }
        });
        
        // Focus styling
        questionElement.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        questionElement.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }
});

// Load resume when page loads
window.onload = function() {
    loadResume();
    
    // Add welcome message
    setTimeout(() => {
        displayMessage("Luca", "Hi there! 👋 I'm Luca's AI assistant. Ask me anything about his experience, skills, or background!", false);
    }, 1000);
};

// Enhanced draggable functionality
function makeDraggable(dragHandle, dragTarget) {
    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.addEventListener('mousedown', function(e) {
        isDragging = true;
        const rect = dragTarget.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        dragTarget.style.transition = 'none';
        document.body.style.userSelect = 'none';
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event) {
        if (!isDragging) return;
        
        let newX = event.clientX - offsetX;
        let newY = event.clientY - offsetY;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - dragTarget.offsetWidth;
        const maxY = window.innerHeight - dragTarget.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        dragTarget.style.left = newX + 'px';
        dragTarget.style.top = newY + 'px';
        dragTarget.style.right = 'auto';
        dragTarget.style.bottom = 'auto';
    }

    function onMouseUp() {
        isDragging = false;
        dragTarget.style.transition = '';
        document.body.style.userSelect = '';
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// Initialize draggable functionality
const chatHeader = document.querySelector('#chatHeader');
const chatWindow = document.querySelector('.chatbot');
if (chatHeader && chatWindow) {
    makeDraggable(chatHeader, chatWindow);
}

// Add CSS for shake animation and spinner
const additionalStyles = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.typing-dots {
    display: flex;
    gap: 2px;
}

.input-container.focused {
    transform: translateY(-1px);
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

