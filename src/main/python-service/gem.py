import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Correct environment variable name
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GOOGLE_API_KEY is not set. Check your .env file.")

# Configure GenAI with API key
genai.configure(api_key=api_key)

def fetch_definition_data(disease_name):
    query = (
        f"Provide a brief summary of the cure and precautionary measures for {disease_name}. "
        "Focus on actionable steps and essential information that can be quickly understood by farmers. "
        "Additionally, specify the recommended pesticides or fertilizers, along with their appropriate quantities, to prevent or manage the disease effectively."
    )


    try:
        # Generate response from Gemini AI model
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(query)

        # Extract generated text safely
        if response and hasattr(response, "text") and response.text:
            return response.text.strip()
        
        return "No relevant information found."

    except Exception as e:
        print(f"Error fetching suggestions: {e}")
        return "Error fetching suggestions."

