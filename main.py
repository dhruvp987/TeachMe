from google import genai

# The client gets the Gemini API key from the GEMINI_API_KEY environment variable
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Who are you?"
)
print(response.text)
