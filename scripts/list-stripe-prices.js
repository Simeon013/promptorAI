// Script pour lister les produits et prix Stripe
// Usage: node scripts/list-stripe-prices.js

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listPricesAndProducts() {
  console.log('\n📦 Produits et Prix Stripe:\n');
  console.log('='.repeat(80));

  try {
    // Récupérer tous les produits
    const products = await stripe.products.list({ limit: 100, active: true });

    for (const product of products.data) {
      console.log(`\n📌 Produit: ${product.name}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);

      // Récupérer les prix pour ce produit
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 10,
        active: true,
      });

      if (prices.data.length === 0) {
        console.log('   ⚠️  Aucun prix actif trouvé pour ce produit');
      } else {
        console.log('\n   💰 Prix disponibles:');
        prices.data.forEach((price) => {
          const amount = (price.unit_amount / 100).toFixed(2);
          const currency = price.currency.toUpperCase();
          const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)';

          console.log(`      → ${amount} ${currency}${interval}`);
          console.log(`        Price ID: ${price.id}`);
          console.log(`        Type: ${price.type}`);
        });
      }

      console.log('   ' + '-'.repeat(76));
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Terminé! Copiez les Price IDs (price_...) dans votre .env.local\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);

    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Vérifiez que STRIPE_SECRET_KEY est correct dans .env.local\n');
    }
  }
}

listPricesAndProducts();
