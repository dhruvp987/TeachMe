from google import genai
from google.genai import types

QUERY_USER_NOTES_COL_NAME = "query_user_notes_collection"

query_user_notes_col_decl = {
    "name": QUERY_USER_NOTES_COL_NAME,
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
tools = types.Tool(function_declarations=[query_user_notes_col_decl])

thinking_config = types.ThinkingConfig(include_thoughts=True)

# Make sure GEMINI_API_KEY env var is set
client = genai.Client()


class GeminiStudentAgent:
    GEMINI_2_5_FLASH = "gemini-2.5-flash"

    def __init__(self, system_inst, model=GEMINI_2_5_FLASH):
        self._model = model

        self._config = types.GenerateContentConfig(
            system_instruction=system_inst,
            tools=[tools],
            thinking_config=thinking_config,
        )

        self._contents = []

    def generate(self, prompt, query_notes_func):
        output = []

        self._contents.append(
            types.Content(role="user", parts=[types.Part(text=prompt)])
        )
        response = client.models.generate_content(
            model=self._model,
            contents=self._contents,
            config=self._config,
        )

        if (
            response.function_calls
            and response.function_calls[0].name == QUERY_USER_NOTES_COL_NAME
        ):
            func_call = response.function_calls[0]
            notes = query_notes_func(**func_call.args)

            function_response_part = types.Part.from_function_response(
                name=func_call.name, response={"result": notes}
            )
            self._contents.append(response.candidates[0].content)
            self._contents.append(
                types.Content(role="user", parts=[function_response_part])
            )

            assistant_out = {
                "role": "assistant",
                "toolCall": {
                    "name": QUERY_USER_NOTES_COL_NAME,
                    "args": func_call.args,
                },
            }
            self._add_possible_thought(
                response.candidates[0].content.parts, assistant_out
            )

            output.append(assistant_out)
            output.append(
                {
                    "role": "user",
                    "toolCallResult": {
                        "name": QUERY_USER_NOTES_COL_NAME,
                        "result": notes,
                    },
                }
            )

            response = client.models.generate_content(
                model=self._model,
                contents=self._contents,
                config=self._config,
            )

        assistant_out = {
            "role": "assistant",
            "content": response.text,
        }
        self._add_possible_thought(response.candidates[0].content.parts, assistant_out)
        output.append(assistant_out)

        return output

    def _add_possible_thought(self, parts, out):
        for part in parts:
            if part.thought:
                return part.text
        return None
