import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Input, Button, Alert } from '@/components';
import { apiClient } from '@/services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.login(username, password);
      onLogin();
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Bot className="h-10 w-10 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">OpenBot</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {error && (
          <Alert
            type="error"
            title="Authentication failed"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
