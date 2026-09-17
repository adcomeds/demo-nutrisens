import * as pdpApi from '@dropins/storefront-pdp/api.js';
import { initializers } from '@dropins/tools/initializer.js';

import {
  initialize,
  setEndpoint,
} from '@dropins/storefront-requisition-list/api.js';
import {
  getProductData as pdpGetProductData,
  getRefinedProduct as pdpGetRefinedProduct,
} from '@dropins/storefront-pdp/api.js';
import { initializeDropin } from './index.js';
import {
  CORE_FETCH_GRAPHQL,
  CS_FETCH_GRAPHQL,
  fetchPlaceholders,
} from '../commerce.js';

/**
 * Normalizes a product object into the shape expected by the requisition list UI:
 * url, urlKey, images[].url, and price (final.amount.{ value, currency }).
 * Handles multiple PDP response shapes (GraphQL, transformed prices, priceRange).
 *
 * @param {Object} product - Raw product from PDP (getProductData / getRefinedProduct).
 * @returns {Object} Product with normalized url, urlKey, images, price; or original if null.
 */
function ensureProductShape(product) {
  if (!product) return product;
  const url = product.url ?? product.canonicalUrl ?? '';
  const urlKey = product.urlKey ?? product.url_key ?? '';
  const images = Array.isArray(product.images)
    ? product.images.map((img) => ({
      url: img?.url ?? '',
      label: img?.label ?? '',
      roles: Array.isArray(img?.roles) ? img.roles : [],
    }))
    : [];
  let { price } = product;
  const { final: priceFinal } = price || {};
  const { amount: amt } = priceFinal || {};
  if (amt != null && typeof amt === 'object' && 'value' in amt) {
    // Already in GraphQL shape; no change
  } else if (amt != null && typeof amt === 'number') {
    const priceRegular = price?.regular;
    price = {
      final: { amount: { value: amt, currency: priceFinal?.currency ?? '' } },
      ...(priceRegular?.amount != null && {
        regular: {
          amount: {
            value: priceRegular.amount,
            currency: priceRegular.currency ?? priceFinal?.currency ?? '',
          },
        },
      }),
    };
  } else if (product.prices?.final != null) {
    const { final: pf, regular: pr } = product.prices;
    const regularAmount = pr != null
      ? { amount: { value: pr.amount ?? 0, currency: pr.currency ?? '' } }
      : undefined;
    price = {
      final: { amount: { value: pf.amount ?? 0, currency: pf.currency ?? '' } },
      regular: regularAmount,
    };
  } else if (product.priceRange?.minimum?.final?.amount != null) {
    price = {
      final: { amount: product.priceRange.minimum.final.amount },
      regular: product.priceRange.minimum.regular,
    };
  }
  return {
    ...product,
    url,
    urlKey,
    images,
    ...(price != null && { price }),
  };
}

/**
 * Fetches products by SKU and normalizes them for the requisition list.
 * PDP exposes getProductData(sku) → single product; this adapts it to
 * getProductData(skus) → products[] and is passed as a required prop to RequisitionListView.
 *
 * @param {string[]} skus - Product SKUs to fetch.
 * @returns {Promise<Object[]>} Resolved array of normalized products (falsy results omitted).
 */
export const getProductData = async (skus) => {
  const results = await Promise.all(skus.map((sku) => pdpGetProductData(sku)));
  return results.filter(Boolean).map(ensureProductShape);
};

/**
 * Enriches requisition list line items that have configurable options by resolving
 * the configured variant via PDP getRefinedProduct and attaching it as configured_product.
 *
 * @param {Object[]} items - Requisition list items (each with product, configurable_options).
 * @returns {Promise<Object[]>} Same items with configured_product set where resolution succeeds.
 */
export const enrichConfigurableProducts = async (items) => {
  if (!items?.length) return items;
  const __diag = []; // TEMP DIAGNOSTIC
  const out = await Promise.all(
    items.map(async (item) => {
      const { product, configurable_options: opts } = item;
      if (!product?.sku || !opts?.length) {
        __diag.push({ sku: product?.sku, opts: opts?.length ?? 0, skipped: true });
        return item;
      }
      let optionIds;
      try {
        optionIds = opts.map((o) => {
          const optionUid = o.option_uid ?? o.configurable_product_option_uid;
          const valueUid = o.value_uid ?? o.configurable_product_option_value_uid;
          return btoa(`configurable/${atob(optionUid)}/${atob(valueUid)}`);
        });
      } catch (e) {
        __diag.push({ sku: product.sku, optionUidBuildError: String(e), opts });
        return item;
      }
      try {
        const configured = await pdpGetRefinedProduct(product.sku, optionIds);
        const shaped = configured ? ensureProductShape(configured) : null;
        __diag.push({
          sku: product.sku,
          optionIds,
          gotConfigured: !!configured,
          configuredKeys: configured ? Object.keys(configured) : null,
          rawPrice: configured?.price ?? null,
          rawPrices: configured?.prices ?? null,
          rawPriceRange: configured?.priceRange ?? null,
          shapedPrice: shaped?.price ?? null,
          parentProductPrice: product?.price ?? null,
        });
        if (!configured) return item;
        // getRefinedProduct returns price.{regular,final}.amount as a bare number,
        // but the requisition-list renderer reads amount.value. Normalize the
        // resolved variant the same way simple products are, or its price renders 0.
        return { ...item, configured_product: shaped };
      } catch (e) {
        __diag.push({ sku: product.sku, refineError: String(e) });
        return item;
      }
    }),
  );
  // TEMP DIAGNOSTIC — render on page so it can be screenshotted
  try {
    window.__RL_ENRICH_DIAG = __diag;
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#7a0026;color:#fff;font:11px/1.4 monospace;padding:12px;white-space:pre-wrap;max-height:70vh;overflow:auto';
    bar.textContent = `RL ENRICH DIAG (${__diag.length} items) — screenshot me:\n${JSON.stringify(__diag, null, 2)}`;
    document.body.prepend(bar);
  } catch (e) { /* ignore */ }
  return out;
};

/**
 * Registers the requisition list drop-in: sets GraphQL endpoint (Core), placeholders,
 * and mounts with getProductData and enrichConfigurableProducts for list/view blocks.
 */
await initializeDropin(async () => {
  pdpApi.setEndpoint(CS_FETCH_GRAPHQL);
  setEndpoint(CORE_FETCH_GRAPHQL);

  const labels = await fetchPlaceholders('placeholders/requisition-list.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  const initConfig = {
    langDefinitions,
    getProductData,
    enrichConfigurableProducts,
  };

  await initializers.mountImmediately(initialize, initConfig);
})();
