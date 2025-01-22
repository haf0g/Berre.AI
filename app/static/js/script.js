/*document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action (form submission)
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    const messages = document.getElementById("messages");

    // Display user's message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = userInput;
    messages.appendChild(userMessage);

    // Send user's message to the server
    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
        .then(response => response.json())
        .then(data => {
            // Create and display the bot's response
            const botMessage = document.createElement("div");
            botMessage.className = "message bot";

            // Split the response into paragraphs by looking for double newlines
            const responseText = data.message || "Sorry, I didn't understand that.";
            const paragraphs = responseText.split("\n\n");

            paragraphs.forEach(paragraph => {
                const pElement = document.createElement("p");
                pElement.textContent = paragraph;
                botMessage.appendChild(pElement);
            });

            messages.appendChild(botMessage);

            // Clear the input field
            document.getElementById("user-input").value = "";

            // Scroll to the latest message
            messages.scrollTop = messages.scrollHeight;
        })
        .catch(err => {
            console.error(err);

            // Handle errors
            const errorMessage = document.createElement("div");
            errorMessage.className = "message error";
            errorMessage.textContent = "An error occurred. Please try again.";
            messages.appendChild(errorMessage);
        });
}*/
class ChatUI {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.messageQueue = [];
        this.isProcessing = false;
    }

    initializeElements() {
        this.messageContainer = document.getElementById('messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        this.chatForm = document.getElementById('chat-form');
        this.errorContainer = document.getElementById('error-container');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.messageTemplate = document.getElementById('message-template');
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        this.userInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });

        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Handle connection status
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
    }

    adjustTextareaHeight() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    updateConnectionStatus(isOnline) {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = isOnline ? 'Connected' : 'Offline';
        statusElement.style.color = isOnline ? 'var(--success-color)' : 'var(--error-color)';
    }

    async sendMessage() {
        const userInput = this.userInput.value.trim();
        if (!userInput || this.isProcessing) return;

        try {
            this.setLoading(true);
            this.clearError();

            // Display user message
            this.displayMessage(userInput, 'user');
            this.userInput.value = '';
            this.adjustTextareaHeight();

            // Show typing indicator
            this.showTypingIndicator();

            // Send to server
            const response = await this.sendToServer(userInput);
            
            // Hide typing indicator
            this.hideTypingIndicator();

            // Display bot response
            if (response.message) {
                this.displayMessage(response.message, 'bot');
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.showError('An error occurred. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    /*
    async sendToServer(message) {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Time': new Date().toISOString()
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
    */
    // In your ChatUI class, modify the sendToServer method:
    async sendToServer(message) {
        try {
            console.log('Sending request to server:', message);
            const response = await fetch('/chat', {  // Send a POST request to the server
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }
    displayMessage(content, type) {
        const messageElement = this.createMessageElement(content, type);
        this.messageContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Highlight code blocks if present
        if (type === 'bot') {
            this.highlightCodeBlocks(messageElement);
        }
    }

    createMessageElement(content, type) {
        const clone = this.messageTemplate.content.cloneNode(true);
        const messageDiv = clone.querySelector('.message');
        const contentDiv = clone.querySelector('.message-content');
        const timestampDiv = clone.querySelector('.message-timestamp');

        messageDiv.classList.add(type);

        // Parse markdown for bot messages
        if (type === 'bot') {
            contentDiv.innerHTML = marked.parse(content);
        } else {
            contentDiv.textContent = content;
        }

        timestampDiv.textContent = new Date().toLocaleTimeString();
        return clone;
    }

    highlightCodeBlocks(messageElement) {
        messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    setLoading(isLoading) {
        this.isProcessing = isLoading;
        this.sendButton.disabled = isLoading;
        this.userInput.disabled = isLoading;
        this.sendButton.querySelector('.button-text').style.display = isLoading ? 'none' : 'block';
        this.sendButton.querySelector('.button-loader').classList.toggle('hidden', !isLoading);
    }

    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    }

    showError(message) {
        this.errorContainer.textContent = message;
        this.errorContainer.classList.remove('hidden');
    }

    clearError() {
        this.errorContainer.textContent = '';
        this.errorContainer.classList.add('hidden');
    }

    scrollToBottom() {
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatUI = new ChatUI();
});
