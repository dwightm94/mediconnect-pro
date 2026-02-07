'use client'

import { useState } from 'react'
import { Button, Card, CardHeader, CardBody, Chip, Modal, Alert } from '@/components/ui'
import { Key, Shield, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

interface SSOProvider {
  id: string
  name: string
  icon: string
  description: string
  status: 'connected' | 'not_connected'
  configuredDate?: string
}

export default function SSOConfigPage() {
  const [providers, setProviders] = useState<SSOProvider[]>([
    { id: 'google', name: 'Google Workspace', icon: '🔴', description: 'Sign in with Google accounts', status: 'connected', configuredDate: '2025-06-15' },
    { id: 'azure', name: 'Microsoft Azure AD', icon: '🔷', description: 'Enterprise identity with Microsoft', status: 'not_connected' },
    { id: 'okta', name: 'Okta', icon: '🔵', description: 'Okta identity platform', status: 'not_connected' },
    { id: 'saml', name: 'Custom SAML 2.0', icon: '🔐', description: 'Any SAML 2.0 compatible IdP', status: 'not_connected' },
  ])
  
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  
  // SSO Settings
  const [autoProvision, setAutoProvision] = useState(true)
  const [defaultRole, setDefaultRole] = useState('staff')
  const [sessionTimeout, setSessionTimeout] = useState('60')
  const [requireMFA, setRequireMFA] = useState(false)

  const openConfig = (provider: SSOProvider) => {
    setSelectedProvider(provider)
    setShowConfigModal(true)
  }

  const openDisconnect = (provider: SSOProvider) => {
    setSelectedProvider(provider)
    setShowDisconnectModal(true)
  }

  const handleConnect = () => {
    if (!selectedProvider) return

    setProviders(prev =>
      prev.map(p =>
        p.id === selectedProvider.id
          ? { ...p, status: 'connected' as const, configuredDate: new Date().toISOString().split('T')[0] }
          : p
      )
    )
    setShowConfigModal(false)
  }

  const handleDisconnect = () => {
    if (!selectedProvider) return

    setProviders(prev =>
      prev.map(p =>
        p.id === selectedProvider.id
          ? { ...p, status: 'not_connected' as const, configuredDate: undefined }
          : p
      )
    )
    setShowDisconnectModal(false)
  }

  const connectedCount = providers.filter(p => p.status === 'connected').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">SSO Configuration</h1>
        <p className="text-gray-500">Configure single sign-on for your organization</p>
      </div>

      {/* Info Banner */}
      <Alert variant="info">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Enterprise Single Sign-On</h3>
            <p className="text-sm">
              SSO allows your staff to sign in using your organization's existing identity provider. 
              This improves security and simplifies user management.
            </p>
          </div>
        </div>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600">{providers.length}</div>
            <div className="text-sm text-gray-500">Available Providers</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">{connectedCount}</div>
            <div className="text-sm text-gray-500">Connected</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-[#0A6E6E]">{sessionTimeout}m</div>
            <div className="text-sm text-gray-500">Session Timeout</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-amber-500">{requireMFA ? 'Yes' : 'No'}</div>
            <div className="text-sm text-gray-500">MFA Required</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Identity Providers */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-lg">Identity Providers</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                      {provider.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{provider.name}</h4>
                        <Chip variant={provider.status === 'connected' ? 'ok' : 'warn'}>
                          {provider.status === 'connected' ? 'Connected' : 'Not Connected'}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                      {provider.configuredDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Connected since {provider.configuredDate}
                        </p>
                      )}
                    </div>
                    <div>
                      {provider.status === 'connected' ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openConfig(provider)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDisconnect(provider)}>
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => openConfig(provider)}>
                          Configure
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* SSO Settings */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-lg">SSO Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default User Role
              </label>
              <select
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="staff">Staff</option>
                <option value="nurse">Nurse</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Role assigned to new users on first sign-in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Provision Users
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoProvision(true)}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                    autoProvision
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${autoProvision ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Yes</div>
                  <div className="text-xs text-gray-500">Auto-create on first sign-in</div>
                </button>
                <button
                  onClick={() => setAutoProvision(false)}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                    !autoProvision
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${!autoProvision ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">No</div>
                  <div className="text-xs text-gray-500">Pre-registration required</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                min="5"
                max="480"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Users will be logged out after this period of inactivity
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireMFA}
                  onChange={(e) => setRequireMFA(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium">Require Multi-Factor Authentication</div>
                  <div className="text-sm text-gray-500">All users must use MFA to sign in</div>
                </div>
              </label>
            </div>

            <Button className="w-full">
              Save Settings
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* SAML/OIDC Info */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">🔧 Technical Configuration</h3>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">SAML Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Entity ID</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">urn:mediconnect:org:YOUR_ORG_ID</code>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">ACS URL</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">https://api.mediconnect.com/sso/saml/callback</code>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Sign-on URL</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">https://app.mediconnect.com/sso/YOUR_ORG_ID</code>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">OIDC Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Redirect URI</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">https://api.mediconnect.com/sso/oidc/callback</code>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Scopes</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">openid profile email</code>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Grant Type</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">authorization_code</code>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Config Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={`Configure ${selectedProvider?.name}`}
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                {selectedProvider.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedProvider.name}</h3>
                <p className="text-gray-500">{selectedProvider.description}</p>
              </div>
            </div>

            {selectedProvider.id === 'google' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Workspace Domain
                  </label>
                  <input
                    type="text"
                    placeholder="yourcompany.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxx.apps.googleusercontent.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {selectedProvider.id === 'azure' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant ID
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application (Client) ID
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {(selectedProvider.id === 'okta' || selectedProvider.id === 'saml') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metadata URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-idp.com/metadata.xml"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="text-center text-gray-500 text-sm">— or —</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Metadata XML
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input type="file" className="hidden" id="metadata-upload" accept=".xml" />
                    <label htmlFor="metadata-upload" className="cursor-pointer">
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-sm text-gray-600">Click to upload metadata.xml</div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConnect}>
                <Key className="w-4 h-4 mr-2" />
                {selectedProvider.status === 'connected' ? 'Update Configuration' : 'Connect Provider'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Disconnect Modal */}
      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Provider"
      >
        {selectedProvider && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-800">
                Are you sure you want to disconnect <strong>{selectedProvider.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Users will no longer be able to sign in using this provider.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDisconnectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
