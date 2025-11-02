"use client";

interface ChatHistoryMenuProps {
  chatIds: string[];
  currentChatId: string | null;
  isLoadingChats: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistoryMenu({
  chatIds,
  currentChatId,
  isLoadingChats,
  onChatSelect,
  onNewChat,
}: ChatHistoryMenuProps) {
  return (
    <div
      className="bg-white rounded-lg shadow p-6 flex flex-col"
      style={{ height: "calc(100vh - 200px)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Chat History</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {isLoadingChats ? (
          <div className="text-center text-gray-500 text-sm py-4">
            Loading chats...
          </div>
        ) : chatIds.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No chats yet
          </div>
        ) : (
          [...chatIds].reverse().map((chatId, index) => (
            <button
              key={chatId}
              onClick={() => onChatSelect(chatId)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                currentChatId === chatId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="truncate">Chat {chatIds.length - index}</div>
            </button>
          ))
        )}
      </div>
      <button
        onClick={onNewChat}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        New Chat
      </button>
    </div>
  );
}
