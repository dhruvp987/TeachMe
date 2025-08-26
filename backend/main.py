from typing import Annotated
from fastapi import FastAPI, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chroma import Chroma
from geministudentagent import GeminiStudentAgent
from chatcache import ChatCache
from inmemorychatstorage import InMemoryChatStorage
from inmemoryloginstore import InMemoryLoginStore
from inmemorysessionmanager import InMemorySessionManager


class LoginInfo(BaseModel):
    email: str
    password: str


class ChatInitInfo(BaseModel):
    chatId: str
    prompt: str


def auth_session_or_fail(ses_token, ses_mngr):
    if ses_token is None:
        raise HTTPException(status_code=401, detail="Session token is required.")
    id_or_none = ses_mngr.authenticate_session(ses_token)
    if id_or_none is None:
        raise HTTPException(status_code=401, detail="Session token is invalid.")
    return id_or_none


def fail_if_not_owner_of_chat(chat_id, user_id, chat_storage):
    if not chat_storage.belongs_to_user(chat_id, user_id):
        raise HTTPException(
            status_code=400, detail="Chat ID does not belong to this user ID."
        )


login_store = InMemoryLoginStore()
ses_manager = InMemorySessionManager()

chat_storage = InMemoryChatStorage()
CHAT_CONVERSATION_KEY = "conversation"
CHAT_STUDENT_AGENT_KEY = "student_agent"
CHAT_STUDENT_AGENT_STATE_KEY = "student_agent_state"

chat_cache = ChatCache()

notes_vec_db = Chroma()

app = FastAPI()

origins = [
    # Next.js origin when using "npm run dev"
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/new-account")
async def new_account(info: LoginInfo):
    new_user_id = login_store.add(info.email, info.password)
    ses_tok = ses_manager.new_session(new_user_id)
    return {"sessionToken": ses_tok}


@app.post("/auth/new-session")
async def new_session(info: LoginInfo):
    user_id = login_store.authenticate(info.email, info.password)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Login info is incorrect.")
    ses_tok = ses_manager.new_session(user_id)
    return {"sessionToken": ses_tok}


@app.post("/auth/session-expire")
async def session_expire(authorization: Annotated[str | None, Header()] = None):
    authenticate_session(authorization, ses_manager)
    ses_manager.expire_session(authorization)


@app.post("/notes/note-upload")
async def upload_note(
    note: Annotated[bytes, File()],
    authorization: Annotated[str | None, Header()] = None,
):
    user_id = auth_session_or_fail(authorization, ses_manager)
    try:
        note_str = note.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400, detail="Note is not a decodable text file."
        )
    return {"noteId": notes_vec_db.add(user_id, [note_str])}


@app.post("/chat/new-chat")
async def new_chat(authorization: Annotated[str | None, Header()] = None):
    user_id = auth_session_or_fail(authorization, ses_manager)
    chat_id = chat_storage.new_chat(user_id)
    chat_storage.store(chat_id, CHAT_CONVERSATION_KEY, [])
    return {"chatId": chat_id}


@app.get("/chat/chats")
async def get_chats(authorization: Annotated[str | None, Header()] = None):
    user_id = auth_session_or_fail(authorization, ses_manager)
    return {"chatIds": chat_storage.get_chats_for_user(user_id)}


@app.post("/chat/student-response")
async def chat(
    chat_info: ChatInitInfo, authorization: Annotated[str | None, Header()] = None
):
    user_id = auth_session_or_fail(authorization, ses_manager)
    chat_id = chat_info.chatId

    fail_if_not_owner_of_chat(chat_id, user_id, chat_storage)

    student_agent = chat_cache.get(chat_id, CHAT_STUDENT_AGENT_KEY)
    if student_agent is None:
        student_agent_state = chat_storage.get(chat_id, CHAT_STUDENT_AGENT_STATE_KEY)
        if student_agent_state is None:
            student_agent = GeminiStudentAgent(
                "You are a very smart and knowledgable person who can tackle any question without much help."
            )
        else:
            student_agent = GeminiStudentAgent.load(student_agent_state)
        chat_cache.store(chat_id, CHAT_STUDENT_AGENT_KEY, student_agent)

    response = student_agent.generate(
        chat_info.prompt,
        lambda query_texts, n_results: notes_vec_db.query(
            user_id, query_texts, n_results
        ),
    )

    prev_conv = chat_storage.get(chat_id, CHAT_CONVERSATION_KEY)
    prev_conv.append({"role": "user", "content": chat_info.prompt})
    prev_conv.append({"role": "assistant", "content": response})
    chat_storage.store(chat_id, CHAT_CONVERSATION_KEY, prev_conv)

    chat_storage.store(chat_id, CHAT_STUDENT_AGENT_STATE_KEY, student_agent.save())

    return {"response": response}


@app.get("/chat/conversation/{chat_id}")
async def get_conversation(
    chat_id: str, authorization: Annotated[str | None, Header()] = None
):
    user_id = auth_session_or_fail(authorization, ses_manager)
    fail_if_not_owner_of_chat(chat_id, user_id, chat_storage)
    return {"conversation": chat_storage.get(chat_id, CHAT_CONVERSATION_KEY)}
