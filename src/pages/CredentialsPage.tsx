import React, { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Card, Button, LoadingSpinner, Alert, Modal, Input } from '@/components';
import { OpenBotSecret } from '@/types';

interface CredentialsPageProps {
  botId: string;
  onBack: () => void;
}

export const CredentialsPage: React.FC<CredentialsPageProps> = ({ botId, onBack }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', expiresAt: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const { data, loading: dataLoading, error: dataError, refetch } = useFetch(
    () => apiClient.getOpenBotSecrets(botId, 0, 100),
    [botId]
  );

  const handleCreate = async () => {
    if (!formData.description) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.createOpenBotSecret(botId, {
        description: formData.description,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      });
      setNewSecret(response.secret || null);
      setShowCreateModal(false);
      setShowSecretModal(true);
      setFormData({ description: '', expiresAt: '' });
    } catch (err) {
      setError((err as Error).message || 'Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (secretId: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await apiClient.deleteOpenBotSecret(botId, secretId);
        setSuccess('Credential deleted');
        await refetch();
      } catch (err) {
        setError((err as Error).message || 'Failed to delete credential');
      }
    }
  };

  // const handleCopy = (secret: string, id: string) => {
  //   navigator.clipboard.writeText(secret);
  //   setCopiedId(id);
  //   setTimeout(() => setCopiedId(null), 2000);
  // };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={onBack} className="text-primary-600 hover:text-primary-700 mb-4 font-medium text-sm flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Credentials</h1>
          <p className="text-gray-600 mt-2">Manage API keys and secrets for authentication</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="h-5 w-5 mr-2 inline" />
          New Credential
        </Button>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />
      )}

      {dataLoading ? (
        <LoadingSpinner label="Loading credentials..." />
      ) : dataError ? (
        <Alert type="error" title="Error" message="Failed to load credentials" />
      ) : !data?.items || data.items.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔑</div>
            <p className="text-gray-600 text-lg mb-6">No credentials created yet</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create First Credential
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide px-2 mb-4">
            {data.items.length} Credential{data.items.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.items.map((cred: OpenBotSecret) => (
              <Card key={cred.secretId}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm">
                          🔐
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{cred.description}</h3>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-gray-500">
                        <span>Created: {new Date(cred.createdAt).toLocaleDateString()}</span>
                        {cred.expiresAt && (
                          <span className="text-orange-600">
                            Expires: {new Date(cred.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(cred.secretId)}
                      title="Delete credential"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <label className="text-xs font-medium text-gray-600 block mb-2">Secret (abbreviated)</label>
                    <div
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs break-all cursor-help hover:bg-gray-100 transition-colors"
                      title="The full secret is only available when creating"
                    >
                      {cred.secret?.substring(0, 10)}...
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
        title="Create New Credential"
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
          setFormData({ description: '', expiresAt: '' });
        }}
        onAction={handleCreate}
        loading={loading}
        actionLabel="Create"
      >
        <div className="space-y-4">
          {error && <Alert type="error" title="Error" message={error} />}
          <Input
            label="Description"
            placeholder="e.g., Production API Key"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Expires At (Optional)"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showSecretModal}
        title="Save Your Secret Key"
        onClose={() => {
          setShowSecretModal(false);
          setNewSecret(null);
          refetch();
        }}
        actionLabel="Close"
        onAction={() => {
          setShowSecretModal(false);
          setNewSecret(null);
          refetch();
        }}
      >
        <div className="space-y-4">
          <Alert
            type="error"
            title="Important"
            message="Save this secret now. You won't be able to see it again!"
          />
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Your Secret Key:</p>
            <p className="text-gray-900 font-mono text-sm break-all">{newSecret}</p>
          </div>
          <Button
            onClick={() => {
              if (newSecret) {
                navigator.clipboard.writeText(newSecret);
                setCopiedId('new-secret');
                setTimeout(() => setCopiedId(null), 2000);
              }
            }}
            variant="primary"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2 inline" />
            {copiedId === 'new-secret' ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
