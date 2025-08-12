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


class GeminiStudentAgent:
    GEMINI_2_5_FLASH = "gemini-2.5-flash"

    def __init__(self, system_inst, model=GEMINI_2_5_FLASH):
        # Make sure GEMINI_API_KEY is set
        self._client = genai.Client()
        self._model = model

        self._config = types.GenerateContentConfig(
            system_instruction=system_inst, tools=[tools]
        )

        self._contents = []

    def generate(self, prompt, query_notes_func):
        output = []

        self._contents.append(
            types.Content(role="user", parts=[types.Part(text=prompt)])
        )
        response = self._client.models.generate_content(
            model=self._model,
            contents=self._contents,
            config=self._config,
        )

        tool_call = response.candidates[0].content.parts[0].function_call
        if tool_call and tool_call.name == QUERY_USER_NOTES_COL_NAME:
            notes = query_notes_func(**tool_call.args)

            function_response_part = types.Part.from_function_response(
                name=tool_call.name, response={"result": notes}
            )
            self._contents.append(response.candidates[0].content)
            self._contents.append(
                types.Content(role="user", parts=[function_response_part])
            )

            output.append(
                {
                    "role": "assistant",
                    "toolCall": {
                        "name": QUERY_USER_NOTES_COL_NAME,
                        "args": tool_call.args,
                    },
                }
            )
            output.append(
                {
                    "role": "user",
                    "toolCallResult": {
                        "name": QUERY_USER_NOTES_COL_NAME,
                        "result": notes,
                    },
                }
            )

            response = self._client.models.generate_content(
                model=self._model,
                contents=self._contents,
                config=self._config,
            )

        output.append({"role": "assistant", "content": response.text})
        return output
