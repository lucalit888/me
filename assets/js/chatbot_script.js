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

let questionCount = 0; // Initialize question count

async function askQuestion() {
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const question = questionElement.value.trim();
//    const typingIndicator = document.createElement('div');
//    typingIndicator.classList.add('typing-indicator');
//    typingIndicator.innerHTML = '<span class="bounce-dot"></span><span class="bounce-dot"></span><span class="bounce-dot"></span>';

    // Do not proceed if the question is empty or if the chatbot is still responding to the previous question
    if (!question || isChatOpen === false) {
        return;
    }

    if (questionCount >= 8) {
        chatHistory.innerHTML += `<div>"You asked too many questions within one minute! I need a break! 🥵" </div>`;
    }

    // Display user's question in chat history
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML += `<div><strong>You:</strong> ${question}</div>`;

    // Clear the input field for the next question
    questionElement.value = '';

    setTimeout(() => {
        questionCount = 0; // Reset the question count after one minute
    }, 60000*2);

    // Prevent further input until the response from the last question has been printed
    isChatOpen = false;

    // Define the payload to send to your AWS Lambda function via API Gateway
    const payload = {
        question: question,
        context: resumeText // This should be a summary of your resume.
    };

//    chatHistory.appendChild(typingIndicator); // Append the typing indicator to the chat history
//    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Make the API call to your API Gateway endpoint
    const response = await fetch('https://selssv957e.execute-api.us-east-1.amazonaws.com/Production//ask', { // Replace with your actual endpoint URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://lucalit888.github.io'
        },
        body: JSON.stringify(payload)
    });

    // Check if the response from the API Gateway is not OK (error handling)
    if (!response.ok) {
//        , response.status, response.statusText);
        chatHistory.innerHTML += `<div><strong>Luca:</strong> "Sorry, I couldn't get a response. Ask me something else, or try again later!"</div>`;
        isChatOpen = true; // Re-enable input if there's an error
        return;
    }

    const data = await response.json();
    const bodyObject = JSON.parse(data.body);
    const content = bodyObject.choices[0].message.content;
//
//    chatHistory.removeChild(typingIndicator); // Remove the typing indicator from the chat history
//    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Display the chatbot's answer in chat history
    chatHistory.innerHTML += `<div><strong>Luca:</strong> ${bodyObject.choices && bodyObject.choices.length > 0 ? bodyObject.choices[0].message.content : "Sorry, I couldn't tell you the answer to that. Ask me something else?"}</div>`;

    // Re-enable input after the response has been printed
    isChatOpen = true;

    // Scroll the chat history to the bottom so the latest interaction is visible
    chatHistory.scrollTop = chatHistory.scrollHeight;
}



window.onload = loadResume;