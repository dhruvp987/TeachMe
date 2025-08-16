import chromadb
from google import genai
from google.genai import types


# Temporary in-memory DB
chroma_client = chromadb.Client()

user_col = chroma_client.create_collection(name="user")
user_col.add(
    ids=["id1", "id2"],
    documents=[
        "Hi I like pineapples.",
        "I EAT PINEAPPLES. I SING WITH PINEAPPLES. I DANCE WITH PINEAPPLES.",
    ],
)

query_notes_col_gemini_decl = {
    "name": "query_user_notes_collection",
    "description": "Get the user's notes that are most similar to a list of queries.",
    "parameters": {
        "type": "object",
        "properties": {
            "query_texts": {
                "type": "array",
                "items": {
                    "type": "string",
                },
                "description": "A list of strings which will be used to query the notes collection. Each string will have its own set of results.",
            },
            "n_results": {
                "type": "integer",
                "description": "The number of most similar notes to return for each query text.",
            },
        },
        "required": ["query_texts", "n_results"],
    },
}


# The client gets the Gemini API key from the GEMINI_API_KEY environment variable
client = genai.Client()
tools = types.Tool(function_declarations=[query_notes_col_gemini_decl])
config = types.GenerateContentConfig(tools=[tools])

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Please get 1 of the user's notes that is most similar to a discussion of pineapples.",
    config=config,
)

func_call = response.candidates[0].content.parts[0].function_call
if func_call and func_call.name == "query_user_notes_collection":
    results = user_col.query(**func_call.args)
    print(results)
else:
    print("No function call was made")
