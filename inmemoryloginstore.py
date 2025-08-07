import uuid


class InMemoryLoginStore:
    """
    A small in memory database for login info, useful for prototyping.
    """

    def __init__(self):
        # Key: Email (str); Value: Tuple[User ID (str), Password (str)]
        self._login_creds = {}

    def add(self, email, password):
        if email in self._login_creds:
            raise ValueError("An account with this email already exists!")
        new_user_id = str(uuid.uuid4())
        self._login_creds[email] = (new_user_id, password)
        return new_user_id

    def authenticate(self, email, password):
        if email in self._login_creds:
            creds = self._login_creds[email]
            if creds[1] == password:
                return creds[0]
        return None
