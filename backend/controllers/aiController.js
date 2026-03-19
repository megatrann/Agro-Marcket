const { generateProductDescription } = require("../services/aiDescriptionService");

const generateDescription = async (req, res) => {
  try {
    const { productName, category, location, type } = req.body;

    if (!productName || !category || !location || !type) {
      return res.status(400).json({
        message: "productName, category, location, and type are required",
      });
    }

    const content = await generateProductDescription({
      productName: String(productName).trim(),
      category: String(category).trim(),
      location: String(location).trim(),
      type: String(type).trim(),
    });

    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate AI description" });
  }
};

module.exports = {
  generateDescription,
};
