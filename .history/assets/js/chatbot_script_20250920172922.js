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
        chatHistory.innerHTML += `<div>"You asked too many questions within one minute! Taking a quick break - ask me again in a few! 😁" </div>`;
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

    console.log('Sending payload to Lambda:', payload);
    console.log('Question length:', question.length);
    console.log('Context length:', resumeText.length);

//    chatHistory.appendChild(typingIndicator); // Append the typing indicator to the chat history
//    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        // Make the API call to your API Gateway endpoint
        const response = await fetch('https://selssv957e.execute-api.us-east-1.amazonaws.com/Production//ask', { // Replace with your actual endpoint URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://lucalit888.github.io/me'
            },
            body: JSON.stringify(payload)
        });

            // Check if the response from the API Gateway is not OK (error handling)
        if (!response.ok) {
            console.error('API Request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            chatHistory.innerHTML += `<div><strong>Luca:</strong> Sorry, I couldn't get a response. Ask me something else, or try again later!</div>`;
            isChatOpen = true; // Re-enable input if there's an error
            return;
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug logging
        
        let bodyObject;
        try {
            bodyObject = JSON.parse(data.body);
        } catch (parseError) {
            console.error('Error parsing response body:', parseError);
            console.error('Raw body:', data.body);
            throw new Error('Invalid response format from server');
        }
        
        // Check if we have an answer in the expected format
        let answer;
        if (bodyObject.answer && bodyObject.answer.trim() !== '') {
            // New format from your Lambda (with content)
            answer = bodyObject.answer;
        } else if (bodyObject.choices && bodyObject.choices.length > 0) {
            // OpenAI format (fallback)
            answer = bodyObject.choices[0].message.content;
        } else {
            // Handle empty or missing answer
            console.warn('Received empty answer from Lambda:', bodyObject);
            answer = 'Sorry, I couldn\'t generate a response to that question. Could you try rephrasing it or ask something else about my background?';
        }

        // Display the chatbot's answer in chat history
        chatHistory.innerHTML += `<div><strong>Luca:</strong> ${answer}</div>`;
    } catch (error) {
        // Handle any errors that occurred during the fetch or processing
        console.error('Error in askQuestion:', error);
        console.error('Error details:', error.message);
        chatHistory.innerHTML += `<div><strong>Luca:</strong> Sorry, I couldn't get a response. Please try again later!</div>`;
        isChatOpen = true; // Re-enable input if there's an error
    }

    // Re-enable input after the response has been printed
    isChatOpen = true;

    // Scroll the chat history to the bottom so the latest interaction is visible
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

window.onload = loadResume;

// Function to make an element draggable
function makeDraggable(dragHandle, dragTarget) {
    let offsetX;

    dragHandle.addEventListener('mousedown', function(e) {
        const rect = dragTarget.getBoundingClientRect();
        offsetX = e.clientX - rect.left;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event) {
        let newX = event.clientX - offsetX;

        // Convert newX to calculate right
        const newRight = window.innerWidth - newX - dragTarget.offsetWidth;

        // Ensure the chat window stays within the screen boundaries
        const maxRight = window.innerWidth - dragTarget.offsetWidth;

        const calculatedRight = Math.min(Math.max(0, newRight), maxRight);

        dragTarget.style.right = `${calculatedRight}px`;
        // Remove the top and bottom style changes
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// Call this function with the header as the handle and the chat window as the target
const chatHeader = document.querySelector('#chatHeader'); // Adjust if needed
const chatWindow = document.querySelector('.chatbot'); // Adjust if needed
makeDraggable(chatHeader, chatWindow);

