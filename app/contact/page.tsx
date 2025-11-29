import { ContactForm } from '@/components/forms/ContactForm';
import Link from 'next/link';

export const metadata = {
  title: 'Contact - Promptor',
  description: 'Contactez l\'équipe Promptor pour toute question ou demande.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-8"
        >
          ← Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              support@promptor.app
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="font-semibold mb-2">Temps de réponse</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Généralement sous 24h
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lun-Ven, 9h-18h (CET)
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <ContactForm />
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous avez une question fréquente ?
          </p>
          <Link
            href="/#faq"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Consultez notre FAQ
            →
          </Link>
        </div>
      </div>
    </div>
  );
}
