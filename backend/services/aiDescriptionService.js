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

const buildFallback = ({ productName, category, location, type }) => {
  const farmingType = parseType(type);
  const prefix = farmingType === "Organic" ? "Farm Fresh Organic" : "Premium Farm";
  const title = `${prefix} ${productName} from ${location}`;

  const description = `${productName} is sourced from trusted growers in ${location} under ${farmingType.toLowerCase()} farming practices. This ${category.toLowerCase()} listing is prepared for agriculture marketplace buyers who need reliable quality, consistent supply, and fresh farm output for daily retail and wholesale demand.`;

  const benefits = DEFAULT_BENEFITS[category] || [
    "Sourced from verified farms for dependable supply",
    "Quality-focused handling for marketplace readiness",
    "Suitable for both retail and wholesale requirements",
  ];

  const tags = normalizeArray([
    productName,
    category,
    location,
    farmingType,
    `${productName} supplier`,
    "agriculture marketplace",
    "farm produce",
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

const generateWithOpenAI = async ({ productName, category, location, type }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

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
      "Return strict JSON with keys: title, description, benefits, tags.",
      "Use natural, concise, persuasive style suitable for e-commerce.",
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
