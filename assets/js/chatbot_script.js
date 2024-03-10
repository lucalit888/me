let isChatOpen = true;

// Initialize chat icon only if it does not exist
if (!document.querySelector('.chat-icon')) {
    chatIcon = document.createElement('div');
    chatIcon.textContent = '💬';
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
        chatbot.style.display = 'none';
        chatContent.style.display = 'none';
        chatIcon.style.display = 'flex';
        isChatOpen = false;
    } else {
        chatbot.style.display = 'flex';
        chatContent.style.display = 'flex';
        chatIcon.style.display = 'none';
        isChatOpen = true;
    }
}

let resumeText = "";

// Function to load resume text from resume.txt
async function loadResume() {
    console.log("Loading resume...");
    const response = await fetch('files/Luca_Lit_Resume_Mar2024.txt');
    resumeText = await response.text();
}

async function askQuestion() {
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const question = questionElement.value.trim();

    // Do not proceed if the question is empty
    if (!question) {
        return;
    }

    // Display user's question in chat history
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML += `<div><strong>You:</strong> ${question}</div>`;

    // Define the payload to send to your AWS Lambda function via API Gateway
    const payload = {
        question: question,
        context: resumeText // This should be a summary of your resume.
    };

    // Make the API call to your API Gateway endpoint
    const response = await fetch('https://selssv957e.execute-api.us-east-1.amazonaws.com/Production/ask', { // Replace with your actual endpoint URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:8000'
        },
        body: JSON.stringify(payload)
    });

    // Check if the response from the API Gateway is not OK (error handling)
    if (!response.ok) {
        console.error('API Request Failed:')
//        , response.status, response.statusText);
        chatHistory.innerHTML += `<div><strong>Luca:</strong> "Sorry, I couldn't get a response. Ask me something else, or try again later!"</div>`;
        return;
    }

    const data = await response.json();

    // Display the chatbot's answer in chat history
    chatHistory.innerHTML += `<div><strong>Luca:</strong> ${data.choices ? data.choices[0].message.content : "Sorry, I couldn't find an answer."}</div>`;

    // Clear the input field for the next question
    questionElement.value = '';

    // Scroll the chat history to the bottom so the latest interaction is visible
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

window.onload = loadResume;