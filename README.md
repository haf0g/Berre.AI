# Berrechid City AI Chatbot Assistant

Welcome to the **Berrechid City AI Chatbot Assistant**! This project is designed to assist passengers and visitors in Berrechid city by providing information about locations, addresses, and other relevant details using a Retrieval-Augmented Generation (RAG) system powered by AI.

 
## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview
The Berrechid City AI Chatbot Assistant is a web-based application that leverages natural language processing (NLP) and machine learning to provide accurate and helpful responses to user queries about locations in Berrechid. The system uses a combination of **Sentence Transformers** for semantic search and **Groq's LLaMA 3 model** for generating natural language responses.

## Features
- **Location Search**: Retrieve information about places in Berrechid, including names, addresses, and details.
- **Semantic Search**: Find relevant locations based on user queries using cosine similarity.
- **Natural Language Responses**: Generate human-like responses using Groq's LLaMA 3 model.
- **Web Interface**: A user-friendly web interface for interacting with the chatbot.
- **Multi-language Support**: The chatbot can understand and respond in multiple languages.

## Technologies Used
- **Python**: Core programming language.
- **Flask**: Web framework for building the application.
- **Sentence Transformers**: For generating embeddings and semantic search.
- **Groq API**: For generating natural language responses using the LLaMA 3 model.
- **Sklearn**: For calculating cosine similarity.
- **HTML/CSS/JavaScript**: For the front-end interface.

## Installation
To set up the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/haf0g/Berre.AI.git
    cd Berre.AI
    ```

2. **Set up a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Set up the Groq API key**:
    - Create a `.env` file in the root directory and add your Groq API key:
        ```env
        GROQ_API=your_groq_api_key_here
        ```

5. **Run the application**:
    ```bash
    python app.py
    ```

6. **Access the application**:
    Open your browser and go to `http://localhost:5000`.

## Usage
1. **Landing Page**: Visit the landing page to learn more about the chatbot.
2. **Chat Interface**: Navigate to the chatbot page to start interacting with the assistant.
3. **Query Examples**:
    - "Where is the nearest hospital in Berrechid?"
    - "Can you tell me about restaurants in Berrechid?"
    - "What are the popular tourist spots in Berrechid?"

## API Documentation
The chatbot backend exposes the following API endpoints:

- **POST /chat**: Send user queries and receive responses.
    - Request Body:
        ```json
        {
          "message": "Your query here"
        }
        ```
    - Response:
        ```json
        {
          "message": "Generated response from the chatbot"
        }
        ```

- **GET /**: Landing page.
- **GET /bot**: Chatbot interface.
- **GET /about**: About page.
- **GET /features**: Features page.
- **GET /contact**: Contact page.

## Contributing
Contributions are welcome! If you'd like to contribute, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to reach out if you have any questions or suggestions! 😊
