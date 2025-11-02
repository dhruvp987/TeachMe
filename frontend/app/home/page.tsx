'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import * as api from '../../src/api';
import * as pages from '../../src/pages';
import * as auth from '../../src/authtools';

export default function HomePage() {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push(pages.loginRoute());
      return;
    }
    initializeChat();
  }, []);

  async function initializeChat() {
    try {
      const { chatId } = await api.newChat();
      setCurrentChatId(chatId);
      setConversation([]);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize chat');
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    setError(null);
    try {
      await api.uploadNote(file);
      setUploadStatus('Note uploaded successfully!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload note');
      setUploadStatus('');
    }
  }

  async function handleSendPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !currentChatId || isLoading) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const { response } = await api.sendPrompt(currentChatId, userPrompt);
      // Add both user message and assistant response after successful request
      setConversation([
        ...conversation,
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: response }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
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
    setPrompt('');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TeachMe</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Notes Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Notes</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload a text file
                  </label>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {uploadStatus && (
                  <div className={`text-sm ${uploadStatus.includes('successfully') ? 'text-green-600' : 'text-blue-600'}`}>
                    {uploadStatus}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleNewChat}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  New Chat
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversation.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-lg">Start a conversation with your AI student!</p>
                    <p className="text-sm mt-2">Upload notes first to help the AI understand your material.</p>
                  </div>
                )}
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
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

              {/* Error Message */}
              {error && (
                <div className="mx-6 mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Input Form */}
              <div className="border-t p-4">
                <form onSubmit={handleSendPrompt} className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

