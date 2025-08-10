from typing import Annotated
from fastapi import FastAPI, File, Header, HTTPException
from pydantic import BaseModel
from chroma import Chroma
from inmemoryloginstore import InMemoryLoginStore
from inmemorysessionmanager import InMemorySessionManager


class LoginInfo(BaseModel):
    email: str
    password: str


def auth_session_or_fail(ses_token, ses_mngr):
    if ses_token is None:
        raise HTTPException(status_code=401, detail="Session token is required.")
    id_or_none = ses_mngr.authenticate_session(ses_token)
    if id_or_none is None:
        raise HTTPException(status_code=401, detail="Session token is invalid.")
    return id_or_none


login_store = InMemoryLoginStore()
ses_manager = InMemorySessionManager()

notes_vec_db = Chroma()

app = FastAPI()


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
    return notes_vec_db.add(user_id, [note_str])
