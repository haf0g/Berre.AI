# v4 with Darija support and improved retrieval
from dotenv import load_dotenv
import os
import json
from typing import List, Dict, Any
from dataclasses import dataclass
from flask import Flask, request, jsonify, render_template, Response
from groq import Groq
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from googletrans import Translator
from fuzzywuzzy import process

# Load environment variables
load_dotenv()

# Initialize translator for Darija support
translator = Translator()

@dataclass
class BerrechidLocation:
    category: str
    name: str
    address: str
    details: Dict[str, Any]

class BerrechidRAG:
    def __init__(self, data_path: str = 'knowledge_base_v2.json'):
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.data = self.load_data(data_path)
        self.embeddings = {}
        self.initialize_embeddings()

    def load_data(self, data_path: str) -> List[BerrechidLocation]:
        # Construct the full path relative to the script's location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        full_path = os.path.join(script_dir, data_path)
        print(f"Loading data from: {full_path}")  # Debugging: Print the full path
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
        except FileNotFoundError:
            raise ValueError(f"File not found: {full_path}")
        except json.JSONDecodeError:
            raise ValueError(f"Error decoding JSON in file: {full_path}")

        locations = []
        for category, items in raw_data.items():
            for item in items:
                locations.append(
                    BerrechidLocation(
                        category=category,
                        name=item.get('name', ''),
                        address=item.get('adress', ''),
                        details=item
                    )
                )
        return locations

    def initialize_embeddings(self):
        for location in self.data:
            text = f"{location.name} {location.address} {' '.join(str(v) for v in location.details.values() if isinstance(v, (str, list)))}"
            self.embeddings[location.name] = self.model.encode(text)

    def retrieve_relevant_info(self, query: str, k: int = 3) -> List[Dict]:
        query_embedding = self.model.encode(query)
        
        # Fuzzy matching to handle misspellings
        location_names = [location.name for location in self.data]
        matches = process.extract(query, location_names, limit=k)
        matched_names = [match[0] for match in matches]

        similarities = []
        for location in self.data:
            if location.name in matched_names:
                similarity = cosine_similarity(
                    [query_embedding],
                    [self.embeddings[location.name]]
                )[0][0]
                similarities.append((similarity, location))
        
        relevant_items = sorted(similarities, key=lambda x: x[0], reverse=True)[:k]
        
        return [
            {
                'category': item[1].category,
                'name': item[1].name,
                'address': item[1].address,
                'details': item[1].details,
                'similarity': float(item[0])
            }
            for item in relevant_items
        ]

class BerrechidChatbot:
    def __init__(self, rag_system: BerrechidRAG, groq_client: Groq):
        self.rag = rag_system
        self.client = groq_client

    def generate_response(self, user_input: str) -> str:
        # Translate Darija to Modern Standard Arabic (MSA) or French/English
        translated_input = self.translate_darija(user_input)
        
        # Retrieve relevant information
        relevant_info = self.rag.retrieve_relevant_info(translated_input)
        context = self._format_context(relevant_info)
        prompt = self._create_prompt(translated_input, context)
        
        try:
            response = self.client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[{"role": "system", "content": "You are a helpful assistant for Berrechid."},
                          {"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"

    def translate_darija(self, text: str) -> str:
        try:
            translation = translator.translate(text, src='ar', dest='ar')
            return translation.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Fallback to original text if translation fails

    def _format_context(self, relevant_info: List[Dict]) -> str:
        context_parts = []
        for info in relevant_info:
            context_parts.append(
                f"Category: {info['category']}\n"
                f"Name: {info['name']}\n"
                f"Address: {info['address']}\n"
                f"Details: {json.dumps(info['details'], ensure_ascii=False)}\n"
            )
        return "\n".join(context_parts)

    def _create_prompt(self, user_input: str, context: str) -> str:
        return f"""Based on the following information about locations in Berrechid:

{context}

Please answer this question or request: {user_input}

Provide a natural, helpful response in the same language as the user's question. Include relevant details from the context."""


# Flask application setup
app = Flask(__name__)

# Initialize RAG system and chatbot
GROQ_API = os.getenv("GROQ_API")
rag_system = BerrechidRAG('knowledge_base_v2.json')
groq_client = Groq(api_key=GROQ_API)
berrechid_bot = BerrechidChatbot(rag_system, groq_client)

# Routes
@app.route("/")
def landing_page():
    return render_template('index_landing.html')

@app.route("/bot")
def chatbot_page():
    return render_template('index.html')

@app.route("/about")
def about_page():
    return render_template('about.html')

@app.route("/features")
def features_page():
    return render_template('features.html')

@app.route("/contact")
def contact_page():
    return render_template('contacts.html')

@app.route("/chat", methods=["POST"])
def chat():
    try:
        app.logger.info("Received chat request")
        user_input = request.json.get("message", "").strip()
        app.logger.info(f"User input: {user_input}")
        
        if not user_input:
            app.logger.warning("No input provided")
            return jsonify({"error": "No input provided"}), 400

        response = berrechid_bot.generate_response(user_input)
        app.logger.info(f"Generated response: {response}")
        return jsonify({"message": response})

    except Exception as e:
        app.logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)