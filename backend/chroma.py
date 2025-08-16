import uuid
import chromadb


class Chroma:
    def __init__(self):
        self._client = chromadb.Client()

    def add(self, user_id, documents):
        col = self._client.get_or_create_collection(name=user_id)
        ids = []
        for doc in documents:
            ids.append(str(uuid.uuid4()))
        col.add(ids=ids, documents=documents)
        return ids

    def query(self, user_id, query_texts, n_results=10):
        col = self._client.get_or_create_collection(name=user_id)
        results = col.query(query_texts=query_texts, n_results=n_results)
        return {"ids": results["ids"], "documents": results["documents"]}
