import React, { useState, useEffect } from 'react';
import { Bot, LogOut } from 'lucide-react';
import { Dashboard, CredentialsPage, WebChatPage, BotDetailsPage, LoginPage } from '@/pages';
import { Navbar } from '@/components';
import { apiClient } from '@/services/api';

type Page = 'dashboard' | 'bot-details' | 'credentials' | 'webchat';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!apiClient.getToken());
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.onUnauthorized = () => setIsAuthenticated(false);
    return () => {
      apiClient.onUnauthorized = null;
    };
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setSelectedBotId(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const handleSelectBot = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-details');
  };

  const handleNavigateToCredentials = () => {
    setCurrentPage('credentials');
  };

  const handleNavigateToWebChat = () => {
    setCurrentPage('webchat');
  };

  const handleBackToBotDetails = () => {
    setCurrentPage('bot-details');
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
    setSelectedBotId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        brand="OpenBot"
        items={[
          { label: 'Dashboard', href: '/dashboard', icon: <Bot className="h-4 w-4" /> },
        ]}
        currentPath={currentPage === 'dashboard' ? '/dashboard' : '/bot'}
        onNavigate={() => handleBack()}
        userMenu={
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard onSelectBot={handleSelectBot} />}

        {currentPage === 'bot-details' && selectedBotId && (
          <BotDetailsPage
            botId={selectedBotId}
            onBack={handleBack}
            onNavigateToCredentials={handleNavigateToCredentials}
            onNavigateToWebChat={handleNavigateToWebChat}
          />
        )}

        {currentPage === 'credentials' && selectedBotId && (
          <CredentialsPage botId={selectedBotId} onBack={handleBackToBotDetails} />
        )}

        {currentPage === 'webchat' && selectedBotId && (
          <WebChatPage botId={selectedBotId} onBack={handleBackToBotDetails} />
        )}
      </main>
    </div>
  );
};

export default App;
