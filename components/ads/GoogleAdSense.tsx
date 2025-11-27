'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * Composant Google AdSense
 * Pour l'utiliser, vous devez d'abord :
 * 1. Créer un compte Google AdSense
 * 2. Ajouter votre site et obtenir l'approbation
 * 3. Créer des unités publicitaires et obtenir les IDs
 * 4. Ajouter NEXT_PUBLIC_GOOGLE_ADSENSE_ID dans .env.local
 */
export function GoogleAdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: GoogleAdSenseProps) {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  useEffect(() => {
    // Charger les publicités AdSense
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Si pas d'ID AdSense configuré, ne rien afficher
  if (!adSenseId) {
    return (
      <div className={`border-2 border-dashed border-yellow-500/30 bg-yellow-500/5 p-4 rounded-lg ${className}`}>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
          AdSense non configuré. Ajoutez NEXT_PUBLIC_GOOGLE_ADSENSE_ID dans .env.local
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adSenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

/**
 * Script AdSense à ajouter dans le layout
 * Charge le script AdSense de manière asynchrone
 */
export function GoogleAdSenseScript() {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  if (!adSenseId) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
