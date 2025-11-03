"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as api from "../../src/api";
import * as pages from "../../src/pages";
import * as auth from "../../src/authtools";
import CollapsibleSidebar, {
  SidebarToggleButton,
} from "../../src/components/CollapsibleSidebar";
import ChatHistoryMenu from "../../src/components/ChatHistoryMenu";
import FileUpload from "../../src/components/FileUpload";
import ConversationView from "../../src/components/ConversationView";

export default function HomePage() {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [chatIds, setChatIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push(pages.loginRoute());
      return;
    }
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setIsLoadingChats(true);
      const { chatIds: ids } = await api.getChats();
      setChatIds(ids || []);
    } catch (err: any) {
      console.error("Failed to load chats:", err);
    } finally {
      setIsLoadingChats(false);
    }
  }

  async function initializeChat() {
    try {
      const { chatId } = await api.newChat();
      setCurrentChatId(chatId);
      setConversation([]);
      // Refresh chat list to include the new chat
      await loadChats();
    } catch (err: any) {
      setError(err.message || "Failed to initialize chat");
    }
  }

  async function switchToChat(chatId: string) {
    if (chatId === currentChatId) return;

    try {
      setIsLoading(true);
      setError(null);
      const { conversation: conv } = await api.getConversation(chatId);
      setCurrentChatId(chatId);
      setConversation(conv || []);
      setPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading...");
    setError(null);
    try {
      await api.uploadNote(file);
      setUploadStatus("Note uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload note");
      setUploadStatus("");
    }
  }

  async function handleSendPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !currentChatId || isLoading) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setIsLoading(true);
    setError(null);

    try {
      const { response } = await api.sendPrompt(currentChatId, userPrompt);
      // Add both user message and assistant response after successful request
      setConversation([
        ...conversation,
        { role: "user", content: userPrompt },
        { role: "assistant", content: response },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await api.sessionExpire();
      router.push(pages.loginRoute());
    } catch (err: any) {
      auth.clearSession();
      router.push(pages.loginRoute());
    }
  }

  async function handleNewChat() {
    await initializeChat();
    setPrompt("");
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  function handleChatSelect(chatId: string) {
    switchToChat(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header */}
      <header className="bg-white shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SidebarToggleButton
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <h1 className="text-2xl font-bold text-gray-900">TeachMe</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <ChatHistoryMenu
          chatIds={chatIds}
          currentChatId={currentChatId}
          isLoadingChats={isLoadingChats}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </CollapsibleSidebar>

      {/* Main Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Middle Sidebar - Notes Upload */}
            <div className="lg:col-span-1">
              <FileUpload
                uploadStatus={uploadStatus}
                onFileUpload={handleFileUpload}
              />
            </div>

            {/* Right Side - Chat Interface */}
            <div className="lg:col-span-2">
              <ConversationView
                currentChatId={currentChatId}
                conversation={conversation}
                prompt={prompt}
                isLoading={isLoading}
                error={error}
                onPromptChange={setPrompt}
                onSendPrompt={handleSendPrompt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
