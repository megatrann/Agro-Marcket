const rawApiBase = import.meta.env.VITE_API_URL || "";

const buildPlaceholder = () => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#e5f3da"/>
      <stop offset="100%" stop-color="#bfdca8"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <path d="M80 380l150-150 130 110 120-95 170 135H80z" fill="#7dad67" opacity="0.5"/>
  <circle cx="595" cy="145" r="38" fill="#f2ffd6" opacity="0.9"/>
  <text x="50%" y="52%" text-anchor="middle" font-family="Poppins, Arial" font-size="34" fill="#275236">Product image</text>
  <text x="50%" y="60%" text-anchor="middle" font-family="Poppins, Arial" font-size="18" fill="#3f6a49">Upload an image to improve visibility</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const FALLBACK_IMAGE = buildPlaceholder();

const getApiOrigin = () => {
  if (!rawApiBase) {
    return "";
  }

  try {
    return new URL(rawApiBase, window.location.origin).origin;
  } catch (_error) {
    return "";
  }
};

const apiOrigin = getApiOrigin();

export const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return FALLBACK_IMAGE;
  }

  const image = value.trim();
  if (!image) {
    return FALLBACK_IMAGE;
  }

  if (image.startsWith("data:")) {
    return image;
  }

  if (image.startsWith("//")) {
    return `${window.location.protocol}${image}`;
  }

  if (/^https?:\/\//i.test(image)) {
    try {
      const parsed = new URL(image);
      const isExternalLocalhost =
        !["localhost", "127.0.0.1"].includes(window.location.hostname) &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname);

      if (isExternalLocalhost && parsed.pathname.startsWith("/uploads/") && apiOrigin) {
        return `${apiOrigin}${parsed.pathname}`;
      }
    } catch (_error) {
      return image;
    }

    return image;
  }

  if (image.startsWith("/")) {
    return apiOrigin ? `${apiOrigin}${image}` : image;
  }

  if (image.startsWith("uploads/")) {
    return apiOrigin ? `${apiOrigin}/${image}` : `/${image}`;
  }

  return image;
};
