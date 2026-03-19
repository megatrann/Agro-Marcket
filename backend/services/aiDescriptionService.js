const DEFAULT_BENEFITS = {
  Vegetables: [
    "Harvested at peak freshness for rich taste and texture",
    "Supports balanced nutrition with daily-use farm produce",
    "Suitable for home kitchens, retail shops, and food services",
  ],
  Fruits: [
    "Naturally sweet and fresh for everyday consumption",
    "Handled carefully to maintain quality during transport",
    "Great fit for households, cafes, and juice counters",
  ],
  Grains: [
    "Cleaned and packed for consistent cooking quality",
    "Reliable staple for homes, hotels, and retailers",
    "Ideal for regular bulk purchasing with stable supply",
  ],
  Seeds: [
    "Sourced for healthy germination and farm readiness",
    "Suitable for nursery, field, and kitchen garden use",
    "Helps improve planting consistency and crop quality",
  ],
  Fertilizer: [
    "Supports healthy plant growth and better yield outcomes",
    "Useful across vegetable, fruit, and mixed crop cycles",
    "Balanced for practical use in farms and gardens",
  ],
  Equipment: [
    "Built for field durability and regular farm operations",
    "Improves productivity with dependable performance",
    "Suitable for small farms and large agricultural setups",
  ],
  Vehicles: [
    "Designed to support transport across farm routes",
    "Helps move produce and materials efficiently",
    "Reliable option for daily agricultural logistics",
  ],
};

const SUPPORTED_LANGUAGES = {
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
};

const FALLBACK_TEXT = {
  en: {
    titlePrefixOrganic: "Farm Fresh Organic",
    titlePrefixNonOrganic: "Premium Farm",
    description:
      "{productName} is sourced from trusted growers in {location} under {type} farming practices. This {category} listing is prepared for agriculture marketplace buyers who need reliable quality, consistent supply, and fresh farm output for daily retail and wholesale demand.",
    benefitsGeneric: [
      "Sourced from verified farms for dependable supply",
      "Quality-focused handling for marketplace readiness",
      "Suitable for both retail and wholesale requirements",
    ],
    supplierTag: "supplier",
    marketplaceTag: "agriculture marketplace",
    farmProduceTag: "farm produce",
  },
  si: {
    titlePrefixOrganic: "නැවුම් සෛව",
    titlePrefixNonOrganic: "ගුණාත්මක ගොවි",
    description:
      "{location} ප්‍රදේශයේ විශ්වාසදායී වගාකරුවන්ගෙන් {type} වගා ක්‍රම යටතේ {productName} ලබා ගනී. මෙම {category} ලැයිස්තුගත කිරීම දිනපතා සිල්ලර සහ තොග ඉල්ලුම සඳහා ස්ථාවර සැපයුම හා ගුණාත්මකභාවය අවශ්‍ය වෙළඳපොළ ගැනුම්කරුවන් සඳහා සකස් කර ඇත.",
    benefitsGeneric: [
      "විශ්වාසදායී ගොවිපලවලින් ස්ථාවර සැපයුමක්",
      "වෙළඳපොළ විකිණීමට සුදුසු ගුණාත්මක සැකසීම",
      "සිල්ලර සහ තොග දෙකටම යෝග්‍යයි",
    ],
    supplierTag: "සැපයුම්කරු",
    marketplaceTag: "කෘෂි වෙළඳපොළ",
    farmProduceTag: "ගොවි නිෂ්පාදන",
  },
  ta: {
    titlePrefixOrganic: "புதிய இயற்கை",
    titlePrefixNonOrganic: "தரமான பண்ணை",
    description:
      "{location} பகுதியில் உள்ள நம்பகமான விவசாயிகளிடமிருந்து {type} முறையில் {productName} பெறப்படுகிறது. இந்த {category} பட்டியல் தினசரி சில்லறை மற்றும் மொத்த தேவைக்கான நிலையான வழங்கல் மற்றும் தரத்தைக் கேட்கும் சந்தை வாங்குபவர்களுக்காக தயாரிக்கப்பட்டது.",
    benefitsGeneric: [
      "நம்பகமான பண்ணைகளிலிருந்து நிலையான வழங்கல்",
      "சந்தை விற்பனைக்கு பொருந்தும் தரமான கையாளல்",
      "சில்லறை மற்றும் மொத்த தேவைகளுக்கு ஏற்றது",
    ],
    supplierTag: "விநியோகஸ்தர்",
    marketplaceTag: "விவசாய சந்தை",
    farmProduceTag: "பண்ணை உற்பத்தி",
  },
};

const normalizeLanguage = (value) => (SUPPORTED_LANGUAGES[value] ? value : "en");

const interpolate = (template, values) =>
  String(template).replace(/\{(\w+)\}/g, (_match, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );

const parseType = (type) =>
  String(type || "")
    .trim()
    .toLowerCase()
    .includes("organic") && !String(type || "").toLowerCase().includes("non")
    ? "Organic"
    : "Non-Organic";

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .slice(0, 8);
};

const buildFallback = ({ productName, category, location, type, language }) => {
  const normalizedLanguage = normalizeLanguage(language);
  const text = FALLBACK_TEXT[normalizedLanguage] || FALLBACK_TEXT.en;
  const farmingType = parseType(type);
  const prefix =
    farmingType === "Organic" ? text.titlePrefixOrganic : text.titlePrefixNonOrganic;
  const title = `${prefix} ${productName} from ${location}`;

  const description = interpolate(text.description, {
    productName,
    location,
    type: farmingType.toLowerCase(),
    category: category.toLowerCase(),
  });

  const benefits = normalizedLanguage === "en" ? DEFAULT_BENEFITS[category] || text.benefitsGeneric : text.benefitsGeneric;

  const tags = normalizeArray([
    productName,
    category,
    location,
    farmingType,
    `${productName} ${text.supplierTag}`,
    text.marketplaceTag,
    text.farmProduceTag,
  ]);

  return {
    title,
    description,
    benefits,
    tags,
  };
};

const parseJsonFromText = (content) => {
  if (!content) {
    return null;
  }

  const direct = content.trim();
  try {
    return JSON.parse(direct);
  } catch (error) {
    const markdownJson = direct.match(/```json\s*([\s\S]*?)\s*```/i);
    if (markdownJson?.[1]) {
      try {
        return JSON.parse(markdownJson[1]);
      } catch (innerError) {
        return null;
      }
    }
  }

  return null;
};

const generateWithOpenAI = async ({ productName, category, location, type, language }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const normalizedLanguage = normalizeLanguage(language);
  const outputLanguage = SUPPORTED_LANGUAGES[normalizedLanguage];

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const prompt = [
      "Generate marketplace-ready agriculture product copy.",
      `productName: ${productName}`,
      `category: ${category}`,
      `location: ${location}`,
      `type: ${type}`,
      `outputLanguage: ${outputLanguage}`,
      "Return strict JSON with keys: title, description, benefits, tags.",
      "Use natural, concise, persuasive style suitable for e-commerce.",
      "Write all values in outputLanguage.",
      "benefits and tags must be arrays.",
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "You generate clean, factual agriculture marketplace product copy and output strict JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseJsonFromText(content);

    if (!parsed) {
      return null;
    }

    return {
      title: String(parsed.title || "").trim(),
      description: String(parsed.description || "").trim(),
      benefits: normalizeArray(parsed.benefits),
      tags: normalizeArray(parsed.tags),
    };
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const generateProductDescription = async (input) => {
  const fallback = buildFallback(input);
  const aiContent = await generateWithOpenAI(input);

  if (!aiContent) {
    return fallback;
  }

  return {
    title: aiContent.title || fallback.title,
    description: aiContent.description || fallback.description,
    benefits: aiContent.benefits.length ? aiContent.benefits : fallback.benefits,
    tags: aiContent.tags.length ? aiContent.tags : fallback.tags,
  };
};

module.exports = {
  generateProductDescription,
};
