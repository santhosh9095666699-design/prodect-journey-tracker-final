const productionOrigin = "https://fronten-of-trace-trail.vercel.app";

export function getProductPath(productId) {
  return `/product/${encodeURIComponent(String(productId))}`;
}

export function getPublicProductUrl(productId) {
  if (typeof window === "undefined") {
    return `${productionOrigin}${getProductPath(productId)}`;
  }
  const host = window.location.hostname;
  const origin = host === "localhost" || host === "127.0.0.1"
    ? productionOrigin
    : window.location.origin;
  return `${origin}${getProductPath(productId)}`;
}
