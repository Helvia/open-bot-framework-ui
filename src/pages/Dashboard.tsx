import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Card, Button, LoadingSpinner, Alert, Modal, Input } from '@/components';
import { OpenBot } from '@/types';

interface DashboardProps {
  onSelectBot: (botId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectBot }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBot, setEditingBot] = useState<OpenBot | null>(null);
  const [formData, setFormData] = useState({ handle: '', endpoint: '', schemaVersion: 'v1.3' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, loading: dataLoading, error: dataError, refetch } = useFetch(
    () => apiClient.getOpenBots(0, 100),
    []
  );

  const handleCreate = async () => {
    if (!formData.handle || !formData.endpoint) {
      setError('Handle and Endpoint are required');
      return;
    }

    setLoading(true);
    try {
      await apiClient.createOpenBot({
        handle: formData.handle,
        endpoint: formData.endpoint,
        schemaVersion: formData.schemaVersion,
      });
      setSuccess('Bot created successfully');
      setFormData({ handle: '', endpoint: '', schemaVersion: 'v1.3' });
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      setError((err as Error).message || 'Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      try {
        await apiClient.deleteOpenBot(id);
        setSuccess('Bot deleted successfully');
        await refetch();
      } catch (err) {
        setError((err as Error).message || 'Failed to delete bot');
      }
    }
  };

  const handleEditBot = (bot: OpenBot) => {
    setEditingBot(bot);
    setFormData({
      handle: bot.handle,
      endpoint: bot.endpoint,
      schemaVersion: bot.schemaVersion,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.handle || !formData.endpoint) {
      setError('Handle and Endpoint are required');
      return;
    }

    if (!editingBot) return;

    setLoading(true);
    try {
      await apiClient.updateOpenBot(editingBot.id, {
        handle: formData.handle,
        endpoint: formData.endpoint,
        schemaVersion: formData.schemaVersion,
      });
      setSuccess('Bot updated successfully');
      setShowEditModal(false);
      setEditingBot(null);
      setFormData({ handle: '', endpoint: '', schemaVersion: 'v1.3' });
      await refetch();
    } catch (err) {
      setError((err as Error).message || 'Failed to update bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 className="text-4xl font-bold mb-2">OpenBot Dashboard</h1>
          <p className="text-primary-100">Manage your bots, credentials, and channels in one place</p>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Bots</h2>
          <p className="text-gray-600 mt-1">Manage your bot configurations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="h-5 w-5 mr-2 inline" />
          New Bot
        </Button>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />
      )}

      {dataLoading ? (
        <LoadingSpinner label="Loading bots..." />
      ) : dataError ? (
        <Alert type="error" title="Error" message="Failed to load bots" />
      ) : !data?.items || data.items.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-600 text-lg mb-6">No bots created yet</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create Your First Bot
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide px-2">
            {data.items.length} Bot{data.items.length !== 1 ? 's' : ''} Available
          </div>
          <div className="space-y-2">
            {data.items.map((bot: OpenBot) => (
              <Card key={bot.id} clickable={true} onClick={() => onSelectBot(bot.id)}>
                <div className="flex justify-between items-center gap-4 py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                        {bot.handle.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{bot.handle}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-md">{bot.endpoint}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Schema Version</p>
                      <p className="text-sm font-medium text-gray-900">{bot.schemaVersion}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBot(bot.id);
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBot(bot);
                        }}
                        title="Edit bot"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(bot.id);
                        }}
                        title="Delete bot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        title="Create New Bot"
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
          setFormData({ handle: '', endpoint: '', schemaVersion: 'v1.3' });
        }}
        onAction={handleCreate}
        loading={loading}
        actionLabel="Create"
      >
        <div className="space-y-4">
          {error && <Alert type="error" title="Error" message={error} />}
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

      <Modal
        isOpen={showEditModal}
        title="Edit Bot"
        onClose={() => {
          setShowEditModal(false);
          setEditingBot(null);
          setError(null);
          setFormData({ handle: '', endpoint: '', schemaVersion: 'v1.3' });
        }}
        onAction={handleSaveEdit}
        loading={loading}
        actionLabel="Save Changes"
      >
        <div className="space-y-4">
          {error && <Alert type="error" title="Error" message={error} />}
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
