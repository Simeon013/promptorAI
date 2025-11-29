'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BugReportFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function BugReportForm({ className, onSuccess }: BugReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    error_message: '',
  });
  const [browserInfo, setBrowserInfo] = useState({
    browser: '',
    os: '',
    screen_resolution: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Détecter les infos du navigateur au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      let os = 'Unknown';

      // Détecter le navigateur
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      // Détecter l'OS
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS')) os = 'iOS';

      setBrowserInfo({
        browser: `${browser} (${ua})`,
        os: os,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...browserInfo,
          page_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSubmitStatus('success');
      setFormData({
        title: '',
        description: '',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: '',
        severity: 'medium',
        error_message: '',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (error) {
      console.error('Bug report form error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Severity */}
        <div>
          <label htmlFor="severity" className="block text-sm font-medium mb-2">
            Gravité <span className="text-red-500">*</span>
          </label>
          <select
            id="severity"
            name="severity"
            required
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="low">Faible - Problème mineur</option>
            <option value="medium">Moyen - Gêne notable</option>
            <option value="high">Élevé - Fonctionnalité bloquée</option>
            <option value="critical">Critique - Application inutilisable</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Titre du bug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ex: Le bouton Générer ne fonctionne pas"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full"
            placeholder="Décrivez le bug en détail..."
          />
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label htmlFor="steps_to_reproduce" className="block text-sm font-medium mb-2">
            Étapes pour reproduire (optionnel)
          </label>
          <Textarea
            id="steps_to_reproduce"
            name="steps_to_reproduce"
            value={formData.steps_to_reproduce}
            onChange={handleChange}
            rows={4}
            className="w-full"
            placeholder="1. Aller sur la page /editor&#10;2. Cliquer sur 'Générer'&#10;3. Observer l'erreur"
          />
        </div>

        {/* Expected vs Actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expected_behavior" className="block text-sm font-medium mb-2">
              Comportement attendu
            </label>
            <Textarea
              id="expected_behavior"
              name="expected_behavior"
              value={formData.expected_behavior}
              onChange={handleChange}
              rows={3}
              className="w-full"
              placeholder="Ce qui devrait se passer..."
            />
          </div>
          <div>
            <label htmlFor="actual_behavior" className="block text-sm font-medium mb-2">
              Comportement observé
            </label>
            <Textarea
              id="actual_behavior"
              name="actual_behavior"
              value={formData.actual_behavior}
              onChange={handleChange}
              rows={3}
              className="w-full"
              placeholder="Ce qui se passe réellement..."
            />
          </div>
        </div>

        {/* Error Message */}
        <div>
          <label htmlFor="error_message" className="block text-sm font-medium mb-2">
            Message d'erreur (optionnel)
          </label>
          <Textarea
            id="error_message"
            name="error_message"
            value={formData.error_message}
            onChange={handleChange}
            rows={3}
            className="w-full font-mono text-sm"
            placeholder="Copiez-collez le message d'erreur si disponible..."
          />
        </div>

        {/* Browser Info (read-only) */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium mb-2">Informations techniques (automatiques)</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Navigateur :</strong> {browserInfo.browser || 'Détection...'}</p>
            <p><strong>OS :</strong> {browserInfo.os || 'Détection...'}</p>
            <p><strong>Résolution :</strong> {browserInfo.screen_resolution || 'Détection...'}</p>
          </div>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ Bug signalé avec succès !
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Notre équipe va analyser le problème et vous tiendra informé.
            </p>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 font-medium">
              ✗ Erreur lors de l'envoi
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-gradient"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Signaler le bug'}
        </Button>
      </form>
    </div>
  );
}
