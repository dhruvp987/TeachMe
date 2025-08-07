from typing import Annotated
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from inmemoryloginstore import InMemoryLoginStore
from inmemorysessionmanager import InMemorySessionManager


class LoginInfo(BaseModel):
    email: str
    password: str


login_store = InMemoryLoginStore()
ses_manager = InMemorySessionManager()

app = FastAPI()


@app.post("/auth/new-account")
def new_account(info: LoginInfo):
    new_user_id = login_store.add(info.email, info.password)
    ses_tok = ses_manager.new_session(new_user_id)
    return {"sessionToken": ses_tok}


@app.post("/auth/new-session")
def new_session(info: LoginInfo):
    user_id = login_store.authenticate(info.email, info.password)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Login info is incorrect.")
    ses_tok = ses_manager.new_session(user_id)
    return {"sessionToken": ses_tok}


@app.post("/auth/session-expire")
def session_expire(authorization: Annotated[str | None, Header()] = None):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Session token is required.")
    try:
        ses_manager.expire_session(authorization)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Session token is invalid.")
