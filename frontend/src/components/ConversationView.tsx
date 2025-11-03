"use client";

interface Message {
  role: string;
  content: string;
}

interface ConversationViewProps {
  currentChatId: string | null;
  conversation: Message[];
  prompt: string;
  isLoading: boolean;
  error: string | null;
  onPromptChange: (value: string) => void;
  onSendPrompt: (e: React.FormEvent) => void;
  onNewChat?: () => void;
}

export default function ConversationView({
  currentChatId,
  conversation,
  prompt,
  isLoading,
  error,
  onPromptChange,
  onSendPrompt,
  onNewChat,
}: ConversationViewProps) {
  return (
    <div
      className="bg-white rounded-lg shadow flex flex-col"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {currentChatId ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversation.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg">
                Start a conversation with your AI student!
              </p>
              <p className="text-sm mt-2">
                Upload notes first to help the AI understand your material.
              </p>
            </div>
          )}
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg">
              Teach an AI student and learn!
            </p>
            <p className="text-sm mt-2">
              Start a new session or go back to a previous one using the sidebar.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onNewChat}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={onSendPrompt} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading || !currentChatId}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || !currentChatId}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
