// Typing animation effect for hero text
(function() {
    // Text content to type out
    const texts = [
        {
            element: 'typing-text-1',
            html: 'Hi, I\'m <strong>Luca</strong>, Software Engineer,<br>Underwater Photographer & AR/VR Enthusiast',
            speed: 30 // milliseconds per character
        },
        {
            element: 'typing-text-2',
            html: 'Dartmouth College \'21 with a B.A. in Computer Science and Mathematics',
            speed: 25,
            delay: 0 // delay before starting this text (in ms)
        }
    ];

    // Function to type out HTML content
    function typeHTML(elementId, htmlString, speed, callback) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Create a temporary element to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = htmlString;

        let charIndex = 0;
        let currentHTML = '';
        const plainText = temp.textContent || temp.innerText;
        let htmlIndex = 0;
        let inTag = false;
        let currentTag = '';

        function typeChar() {
            if (htmlIndex < htmlString.length) {
                const char = htmlString[htmlIndex];

                // Handle HTML tags
                if (char === '<') {
                    inTag = true;
                    currentTag = char;
                } else if (char === '>' && inTag) {
                    currentTag += char;
                    currentHTML += currentTag;
                    element.innerHTML = currentHTML + '<span class="typing-cursor">|</span>';
                    inTag = false;
                    currentTag = '';
                    htmlIndex++;
                    setTimeout(typeChar, 0); // Process tags instantly
                    return;
                } else if (inTag) {
                    currentTag += char;
                    htmlIndex++;
                    setTimeout(typeChar, 0); // Process tags instantly
                    return;
                } else {
                    // Regular character
                    currentHTML += char;
                    element.innerHTML = currentHTML + '<span class="typing-cursor">|</span>';
                }

                htmlIndex++;
                setTimeout(typeChar, speed);
            } else {
                // Remove cursor when done
                element.innerHTML = currentHTML;
                if (callback) callback();
            }
        }

        typeChar();
    }

    // Start typing animation when page loads
    function startTyping() {
        // Type first text
        typeHTML(texts[0].element, texts[0].html, texts[0].speed, function() {
            // After first text completes, type second text
            if (texts[1]) {
                setTimeout(function() {
                    typeHTML(texts[1].element, texts[1].html, texts[1].speed);
                }, texts[1].delay || 0);
            }
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTyping);
    } else {
        startTyping();
    }
})();
