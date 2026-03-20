// Capture the mock create function at module level so all tests share it
const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

const { analyzeIngredients } = require('../services/aiService');

describe('aiService.analyzeIngredients', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns is_safe: false when no ingredients provided', async () => {
    const result = await analyzeIngredients('');
    expect(result.is_safe).toBe(false);
    expect(result.reason).toMatch(/No ingredients/);
  });

  it('parses a SAFE response from OpenAI correctly', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            is_safe: true,
            reason: 'All ingredients are clean-label compliant.',
            flagged_ingredients: [],
          }),
        },
      }],
    });

    const result = await analyzeIngredients('water, xylitol, mint extract');
    expect(result.is_safe).toBe(true);
    expect(result.flagged_ingredients).toHaveLength(0);
  });

  it('returns is_safe: false when OpenAI flags ethanol', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            is_safe: false,
            reason: 'Contains ethanol, an alcohol derivative.',
            flagged_ingredients: ['ethanol'],
          }),
        },
      }],
    });

    const result = await analyzeIngredients('water, ethanol, mint');
    expect(result.is_safe).toBe(false);
    expect(result.flagged_ingredients).toContain('ethanol');
  });

  it('fails safe when OpenAI returns malformed JSON', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Sorry, I cannot help with that.' } }],
    });

    const result = await analyzeIngredients('water, xylitol');
    expect(result.is_safe).toBe(false);
    expect(result.reason).toMatch(/AI audit could not be completed/);
  });

  it('fails safe when OpenAI call throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network error'));

    const result = await analyzeIngredients('water, xylitol');
    expect(result.is_safe).toBe(false);
  });
});
