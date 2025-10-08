'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Mail, Settings } from 'lucide-react'

interface EmailPreferencesProps {
  userId: string
}

interface EmailSettings {
  emailNotificationsEnabled: boolean
  notificationWindowStart: string
  notificationWindowEnd: string
  reminderCooldownHours: number
}

export function EmailPreferences({ userId }: EmailPreferencesProps) {
  const [settings, setSettings] = useState<EmailSettings>({
    emailNotificationsEnabled: true,
    notificationWindowStart: '08:00',
    notificationWindowEnd: '20:00',
    reminderCooldownHours: 6
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load current settings (this would be implemented when profile API is available)
  useEffect(() => {
    // For now, just set loading to false since we don't have the profile API endpoint yet
    setLoading(false)
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // This would make an API call to update user preferences
      // await updateUserEmailPreferences(settings)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Email preferences updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      emailNotificationsEnabled: !prev.emailNotificationsEnabled
    }))
  }

  const handleTimeChange = (field: 'notificationWindowStart' | 'notificationWindowEnd', value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCooldownChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      reminderCooldownHours: Math.max(1, Math.min(24, value))
    }))
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-border rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-border rounded w-3/4"></div>
          <div className="h-4 bg-border rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Email Notifications</h3>
          <p className="text-sm text-text-secondary">Manage your daily reminder preferences</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-success/10 border border-success/20 text-success' 
            : 'bg-error/10 border border-error/20 text-error'
        }`}>
          <Mail className="w-4 h-4" />
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-text-primary">Daily Reminders</h4>
            <p className="text-sm text-text-secondary">Get notified about incomplete tasks</p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.emailNotificationsEnabled ? 'bg-purple-600' : 'bg-border'
            }`}
          >
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
              settings.emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {settings.emailNotificationsEnabled && (
          <>
            {/* Notification Window */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-text-secondary" />
                <h4 className="text-base font-medium text-text-primary">Active Hours</h4>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Set when you&apos;d like to receive reminder emails (in your local timezone)
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">From</label>
                  <input
                    type="time"
                    value={settings.notificationWindowStart}
                    onChange={(e) => handleTimeChange('notificationWindowStart', e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">To</label>
                  <input
                    type="time"
                    value={settings.notificationWindowEnd}
                    onChange={(e) => handleTimeChange('notificationWindowEnd', e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Cooldown Period */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-text-secondary" />
                <h4 className="text-base font-medium text-text-primary">Reminder Frequency</h4>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Minimum hours between reminder emails
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCooldownChange(settings.reminderCooldownHours - 1)}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-medium text-text-primary">{settings.reminderCooldownHours}</span>
                  <span className="text-sm text-text-secondary ml-1">
                    {settings.reminderCooldownHours === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
                <button
                  onClick={() => handleCooldownChange(settings.reminderCooldownHours + 1)}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-background border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Preview</h4>
              <p className="text-xs text-text-secondary">
                You&apos;ll receive reminder emails between {settings.notificationWindowStart} and {settings.notificationWindowEnd} 
                {' '}(local time), with at least {settings.reminderCooldownHours} hours between each reminder.
              </p>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          )}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
