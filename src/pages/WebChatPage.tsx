import React, { useState } from 'react';
import { Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Card, Button, LoadingSpinner, Alert, Modal, Input } from '@/components';
import { WebChatChannel } from '@/types';

interface WebChatPageProps {
  botId: string;
  onBack: () => void;
}

export const WebChatPage: React.FC<WebChatPageProps> = ({ botId, onBack }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, loading: dataLoading, error: dataError, refetch } = useFetch(
    () => apiClient.getWebChatChannels(botId, 0, 100),
    [botId]
  );

  const handleCreate = async () => {
    if (!formData.name) {
      setError('Channel name is required');
      return;
    }

    setLoading(true);
    try {
      await apiClient.createWebChatChannel(botId, {
        name: formData.name,
      });
      setSuccess('WebChat channel created successfully');
      setFormData({ name: '' });
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      setError((err as Error).message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (channelId: string) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await apiClient.deleteWebChatChannel(botId, channelId);
        setSuccess('WebChat channel deleted');
        await refetch();
      } catch (err) {
        setError((err as Error).message || 'Failed to delete channel');
      }
    }
  };

  const toggleRevealSecret = (secretId: string) => {
    const newRevealed = new Set(revealedSecrets);
    if (newRevealed.has(secretId)) {
      newRevealed.delete(secretId);
    } else {
      newRevealed.add(secretId);
    }
    setRevealedSecrets(newRevealed);
  };

  const handleCopySecret = (secret: string, secretId: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(secretId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={onBack} className="text-primary-600 hover:text-primary-700 mb-4 font-medium text-sm flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">WebChat Channels</h1>
          <p className="text-gray-600 mt-2">Configure web chat integration for your bot</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="h-5 w-5 mr-2 inline" />
          New Channel
        </Button>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />
      )}

      {dataLoading ? (
        <LoadingSpinner label="Loading channels..." />
      ) : dataError ? (
        <Alert type="error" title="Error" message="Failed to load channels" />
      ) : !data?.items || data.items.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-600 text-lg mb-6">No WebChat channels configured</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create First Channel
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide px-2 mb-4">
            {data.items.length} Channel{data.items.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-4">
            {data.items.map((channel: WebChatChannel) => (
              <Card key={channel.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm">
                          💬
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">ID: {channel.id}</p>
                      <p className="text-xs text-gray-500 mt-2">Created: {new Date(channel.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(channel.id)}
                      title="Delete channel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">Secret 1</label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs break-all">
                        {revealedSecrets.has(`${channel.id}-secret1`) ? channel.secret1 : '••••••••••••'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleRevealSecret(`${channel.id}-secret1`)}
                          title={revealedSecrets.has(`${channel.id}-secret1`) ? 'Hide secret' : 'Reveal secret'}
                          className="flex-1"
                        >
                          {revealedSecrets.has(`${channel.id}-secret1`) ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" /> Reveal
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopySecret(channel.secret1 || '', `${channel.id}-secret1`)}
                          title="Copy secret"
                        >
                          <Copy
                            className={`h-3 w-3 ${
                              copiedId === `${channel.id}-secret1` ? 'text-green-600' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">Secret 2</label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs break-all">
                        {revealedSecrets.has(`${channel.id}-secret2`) ? channel.secret2 : '••••••••••••'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleRevealSecret(`${channel.id}-secret2`)}
                          title={revealedSecrets.has(`${channel.id}-secret2`) ? 'Hide secret' : 'Reveal secret'}
                          className="flex-1"
                        >
                          {revealedSecrets.has(`${channel.id}-secret2`) ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" /> Reveal
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopySecret(channel.secret2 || '', `${channel.id}-secret2`)}
                          title="Copy secret"
                        >
                          <Copy
                            className={`h-3 w-3 ${
                              copiedId === `${channel.id}-secret2` ? 'text-green-600' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        title="Create New WebChat Channel"
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
          setFormData({ name: '' });
        }}
        onAction={handleCreate}
        loading={loading}
        actionLabel="Create"
      >
        <div className="space-y-4">
          {error && <Alert type="error" title="Error" message={error} />}
          <Input
            label="Channel Name"
            placeholder="e.g., Customer Support"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            helper="A friendly name for this WebChat channel"
          />
          <Alert
            type="info"
            title="Note"
            message="Secrets will be automatically generated upon creation. You can copy them after the channel is created."
          />
        </div>
      </Modal>
    </div>
  );
};
