import uuid


class InMemoryChatStorage:
    def __init__(self):
        self._chat_to_user_table = {}
        self._user_to_chat_table = {}
        self._chat_store = {}

    def new_chat(self, user_id):
        chat_id = str(uuid.uuid4())

        self._chat_to_user_table[chat_id] = user_id
        self._chat_store[chat_id] = {}

        if user_id not in self._user_to_chat_table:
            self._user_to_chat_table[user_id] = []
        self._user_to_chat_table[user_id].append(chat_id)

        return chat_id

    def store(self, chat_id, key, value):
        store = self._chat_store[chat_id]
        store[key] = value

    def get(self, chat_id, key):
        store = self._chat_store[chat_id]
        if key not in store:
            return None
        return store[key]

    def belongs_to_user(self, chat_id, user_id):
        if chat_id not in self._chat_to_user_table:
            return False
        if self._chat_to_user_table[chat_id] != user_id:
            return False
        return True

    def get_chats_for_user(self, user_id):
        if user_id not in self._user_to_chat_table:
            return None
        # Create a copy of this list so that this one does not get mutated
        # from somewhere unexpecting
        return self._user_to_chat_table[user_id][:]
