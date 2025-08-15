class ChatCache:
    def __init__(self):
        self._chat_cache = {}

    def store(self, chat_id, key, value):
        if chat_id not in self._chat_cache:
            self._chat_cache[chat_id] = {}
        cache = self._chat_cache[chat_id]
        cache[key] = value

    def get(self, chat_id, key):
        if chat_id not in self._chat_cache:
            return None
        cache = self._chat_cache[chat_id]
        if key not in cache:
            return None
        return cache[key]
