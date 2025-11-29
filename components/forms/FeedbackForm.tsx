'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ className, onSuccess }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    type: 'feature_request' as 'feature_request' | 'improvement' | 'praise' | 'other',
    category: '',
    title: '',
    description: '',
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating > 0 ? formData.rating : null,
          page_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSubmitStatus('success');
      setFormData({
        type: 'feature_request',
        category: '',
        title: '',
        description: '',
        rating: 0,
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (error) {
      console.error('Feedback form error:', error);
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

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            Type de feedback <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="feature_request">Demande de fonctionnalité</option>
            <option value="improvement">Suggestion d'amélioration</option>
            <option value="praise">Compliment</option>
            <option value="other">Autre</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Catégorie (optionnel)
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Sélectionner --</option>
            <option value="ui">Interface utilisateur</option>
            <option value="ai">IA / Génération de prompts</option>
            <option value="performance">Performance</option>
            <option value="documentation">Documentation</option>
            <option value="pricing">Tarifs / Abonnement</option>
            <option value="other">Autre</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Résumé en une ligne"
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
            rows={5}
            className="w-full"
            placeholder="Décrivez votre feedback en détail..."
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Note globale (optionnel)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className={`text-3xl transition-colors ${
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                }`}
              >
                ★
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 self-center">
                {formData.rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ Merci pour votre feedback !
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Votre retour nous aide à améliorer Promptor.
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
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le feedback'}
        </Button>
      </form>
    </div>
  );
}
