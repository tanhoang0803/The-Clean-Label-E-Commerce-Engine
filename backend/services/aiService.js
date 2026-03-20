const OpenAI = require('openai');

// Lazy singleton — instantiated on first call so the server starts even
// if OPENAI_API_KEY is not yet configured (e.g. Render cold start before env vars).
let openai = null;
function getClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const SYSTEM_PROMPT = `You are a clean-label ingredient auditor. Your job is to evaluate a product's ingredient list for safety concerns.

Flag any of the following:
- Alcohol derivatives: ethanol, isopropanol, denatured alcohol
- Acidic pH agents at concerning concentrations: citric acid concentration >5%, phosphoric acid
- Synthetic dyes: FD&C dyes, tartrazine, Red 40, Yellow 5, Blue 1, etc.
- Parabens: methylparaben, ethylparaben, propylparaben, butylparaben
- Sodium Lauryl Sulfate (SLS) or Sodium Laureth Sulfate (SLES)

Respond ONLY with valid JSON in this exact format, no markdown, no prose:
{
  "is_safe": true or false,
  "reason": "Brief human-readable explanation of your decision",
  "flagged_ingredients": ["ingredient1", "ingredient2"]
}

If no harmful ingredients are found, return is_safe: true with an empty flagged_ingredients array.`;

/**
 * Analyzes a product's ingredient list using OpenAI.
 *
 * @param {string} ingredientString - Raw ingredient list as a string (e.g. "water, citric acid, red 40")
 * @returns {Promise<{ is_safe: boolean, reason: string, flagged_ingredients: string[] }>}
 */
async function analyzeIngredients(ingredientString) {
  if (!ingredientString || ingredientString.trim().length === 0) {
    return {
      is_safe: false,
      reason: 'No ingredients provided for audit.',
      flagged_ingredients: [],
    };
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please audit the following ingredient list:\n\n${ingredientString}`,
        },
      ],
      temperature: 0,
      max_tokens: 300,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new Error('OpenAI returned an empty response');
    }

    const result = JSON.parse(rawContent);

    // Validate expected shape
    if (typeof result.is_safe !== 'boolean' || typeof result.reason !== 'string') {
      throw new Error('OpenAI response did not match expected JSON schema');
    }

    return {
      is_safe: result.is_safe,
      reason: result.reason,
      flagged_ingredients: Array.isArray(result.flagged_ingredients)
        ? result.flagged_ingredients
        : [],
    };
  } catch (err) {
    console.error('[aiService] analyzeIngredients error:', err.message);
    // Fail safe: treat audit failure as unsafe so the product is not publicly listed
    return {
      is_safe: false,
      reason: `AI audit could not be completed: ${err.message}`,
      flagged_ingredients: [],
    };
  }
}

module.exports = { analyzeIngredients };
