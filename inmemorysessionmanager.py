import uuid


class InMemorySessionManager:
    """
    A small in memory manager for session tokens, useful for prototyping.
    """

    def __init__(self):
        # Key: Session token (str); Value: User ID (str)
        self._sessions = {}

    def new_session(self, user_id):
        session_tok = str(uuid.uuid4())
        self._sessions[session_tok] = user_id
        return session_tok

    def authenticate_session(self, session_tok):
        if session_tok in self._sessions:
            return self._sessions[session_tok]
        return None

    def expire_session(self, session_tok):
        if session_tok not in self._sessions:
            raise ValueError("Session token does not represent a valid session.")
        del self._sessions[session_tok]
