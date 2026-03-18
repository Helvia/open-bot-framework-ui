import React, { useState } from 'react';
import { Lock, Key, MessageSquare, ArrowLeft, Edit2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Card, Button, LoadingSpinner, Alert, Modal, Input } from '@/components';
import { OpenBot } from '@/types';

interface BotDetailsProps {
  botId: string;
  onBack: () => void;
  onNavigateToCredentials: () => void;
  onNavigateToWebChat: () => void;
}

export const BotDetailsPage: React.FC<BotDetailsProps> = ({
  botId,
  onBack,
  onNavigateToCredentials,
  onNavigateToWebChat,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ handle: '', endpoint: '', schemaVersion: '' });
  const [loading, setLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: bot, loading: botLoading, error: botError, refetch } = useFetch(
    () => apiClient.getOpenBotById(botId),
    [botId]
  );

  const { data: secretsCount } = useFetch(
    () => apiClient.getOpenBotSecrets(botId, 0, 1),
    [botId]
  );

  const { data: channelsCount } = useFetch(
    () => apiClient.getWebChatChannels(botId, 0, 1),
    [botId]
  );

  const handleEditBot = () => {
    if (bot) {
      setFormData({
        handle: bot.handle,
        endpoint: bot.endpoint,
        schemaVersion: bot.schemaVersion,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.handle || !formData.endpoint) {
      setEditError('Handle and Endpoint are required');
      return;
    }

    setLoading(true);
    try {
      await apiClient.updateOpenBot(botId, {
        handle: formData.handle,
        endpoint: formData.endpoint,
        schemaVersion: formData.schemaVersion,
      });
      setSuccess('Bot updated successfully');
      setShowEditModal(false);
      await refetch();
    } catch (err) {
      setEditError((err as Error).message || 'Failed to update bot');
    } finally {
      setLoading(false);
    }
  };

  if (botLoading) {
    return <LoadingSpinner label="Loading bot details..." />;
  }

  if (botError) {
    return <Alert type="error" title="Error" message="Failed to load bot details" />;
  }

  if (!bot) {
    return <Alert type="error" title="Error" message="Bot not found" />;
  }

  return (
    <div className="space-y-8">
      {editError && <Alert type="error" title="Error" message={editError} onClose={() => setEditError(null)} />}
      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />
      )}

      <div>
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 mb-4 font-medium text-sm flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{bot.handle}</h1>
            <p className="text-gray-600 mt-2">{bot.endpoint}</p>
          </div>
          <Button onClick={handleEditBot} size="lg">
            <Edit2 className="h-5 w-5 mr-2 inline" />
            Edit Bot
          </Button>
        </div>
      </div>

      {/* Bot Info Card */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Bot Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">Bot Handle</p>
              <p className="text-gray-900 font-mono mt-1 text-lg">{bot.handle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Schema Version</p>
              <p className="text-gray-900 mt-1 text-lg">{bot.schemaVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Bot ID</p>
              <p className="text-gray-900 font-mono text-sm mt-1 break-all">{bot.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Endpoint</p>
              <p className="text-gray-900 font-mono text-sm mt-1 break-all">{bot.endpoint}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Created</p>
              <p className="text-gray-900 mt-1">{new Date(bot.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Last Updated</p>
              <p className="text-gray-900 mt-1">{new Date(bot.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credentials Card */}
        <Card clickable={true} onClick={onNavigateToCredentials}>
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-lg">
                  🔐
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Credentials</h3>
              </div>
              <p className="text-sm text-gray-600">Manage API keys and secrets</p>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Credentials</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {secretsCount?.total || 0}
                </p>
              </div>
              <Button variant="ghost" onClick={onNavigateToCredentials}>
                View →
              </Button>
            </div>
          </div>
        </Card>

        {/* WebChat Card */}
        <Card clickable={true} onClick={onNavigateToWebChat}>
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-lg">
                  💬
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">WebChat Channels</h3>
              </div>
              <p className="text-sm text-gray-600">Configure web chat integration</p>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Channels</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {channelsCount?.total || 0}
                </p>
              </div>
              <Button variant="ghost" onClick={onNavigateToWebChat}>
                View →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showEditModal}
        title="Edit Bot"
        onClose={() => {
          setShowEditModal(false);
          setEditError(null);
          setFormData({ handle: '', endpoint: '', schemaVersion: '' });
        }}
        onAction={handleSaveEdit}
        loading={loading}
        actionLabel="Save Changes"
      >
        <div className="space-y-4">
          {editError && <Alert type="error" title="Error" message={editError} />}
          <Input
            label="Bot Handle"
            placeholder="my-bot"
            value={formData.handle}
            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
            helper="Must be 4-64 chars, alphanumeric and hyphens"
          />
          <Input
            label="Endpoint"
            placeholder="https://api.example.com"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
          />
          <Input
            label="Schema Version"
            value={formData.schemaVersion}
            onChange={(e) => setFormData({ ...formData, schemaVersion: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BotDetailsPage;
