import OpenAI from 'openai';
import { logger } from '@/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedVibeContent {
  name: string;
  tagline: string;
  description: string;
  imagePrompt: string;
  suggestedImageUrl?: string;
}

export class OpenAIService {
  /**
   * Generate wedding vibe content from a prompt
   * @param prompt User's description of the wedding vibe
   * @returns Generated vibe content
   */
  public async generateVibeContent(prompt: string): Promise<GeneratedVibeContent> {
    try {
      logger.info(`Generating vibe content for prompt: ${prompt}`);

      // Generate text content (name, tagline, description)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a creative wedding planner assistant. Generate wedding vibe content based on user descriptions.

Your response must be a valid JSON object with these exact fields:
- name: A catchy 2-3 word vibe name (e.g., "Coastal Escape", "Regal Royale")
- tagline: A short 3-5 word tagline
- description: A compelling 2-3 sentence description
- imagePrompt: A detailed prompt for generating an image that captures this vibe

Focus on:
- Elegance and sophistication
- Cultural relevance for Indian weddings
- Visual and emotional appeal
- Unique and memorable naming

Return ONLY the JSON object, no other text.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const generatedContent = JSON.parse(response) as GeneratedVibeContent;

      logger.info(`Generated vibe: ${generatedContent.name}`);

      // Optionally generate image using DALL-E (commented out to save costs)
      // const imageUrl = await this.generateVibeImage(generatedContent.imagePrompt);
      // generatedContent.suggestedImageUrl = imageUrl;

      // For now, suggest using Unsplash API or let admin upload manually
      generatedContent.suggestedImageUrl = this.getSuggestedUnsplashUrl(
        generatedContent.imagePrompt
      );

      return generatedContent;
    } catch (error: any) {
      logger.error(`Error generating vibe content: ${error.message}`);
      throw new Error(`Failed to generate vibe content: ${error.message}`);
    }
  }

  /**
   * Generate image using DALL-E (optional - costs money)
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  public async generateVibeImage(prompt: string): Promise<string> {
    try {
      logger.info(`Generating image for prompt: ${prompt}`);

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Professional wedding photography style: ${prompt}. High quality, elegant, sophisticated, cinematic lighting.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      const imageUrl = response && response.data && response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      logger.info(`Generated image URL: ${imageUrl}`);
      return imageUrl;
    } catch (error: any) {
      logger.error(`Error generating image: ${error.message}`);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Get suggested Unsplash URL based on keywords
   * @param prompt Image prompt
   * @returns Unsplash search URL
   */
  private getSuggestedUnsplashUrl(prompt: string): string {
    // Extract keywords from prompt
    const keywords = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter((word) => word.length > 3)
      .slice(0, 3)
      .join(',');

    return `https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80&auto=format&fit=crop&keywords=${keywords}`;
  }

  /**
   * Enhance existing vibe description using AI
   * @param currentDescription Current description
   * @returns Enhanced description
   */
  public async enhanceDescription(currentDescription: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional wedding content writer. Enhance the given wedding vibe description to make it more compelling, elegant, and emotionally resonant. Keep it to 2-3 sentences. Focus on visual imagery and emotional appeal.',
          },
          {
            role: 'user',
            content: currentDescription,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return completion.choices[0].message.content || currentDescription;
    } catch (error: any) {
      logger.error(`Error enhancing description: ${error.message}`);
      throw new Error(`Failed to enhance description: ${error.message}`);
    }
  }

  /**
   * Generate personalized vibe description for a specific couple
   * @param vibeName Name of the vibe
   * @param coupleData Couple's wedding data
   * @returns Personalized description
   */
  public async generatePersonalizedVibeDescription(
    vibeName: string,
    coupleData: {
      coupleNames?: string;
      guests?: number;
      weddingDate?: string;
    }
  ): Promise<string> {
    try {
      const { coupleNames, guests = 100, weddingDate } = coupleData;

      // Determine guest size and season
      const guestSize = guests < 100 ? 'intimate' : guests < 200 ? 'medium-sized' : 'grand';
      let seasonInfo = '';
      let monthName = '';

      if (weddingDate) {
        const date = new Date(weddingDate);
        const month = date.getMonth();
        const season =
          month >= 2 && month <= 4
            ? 'spring'
            : month >= 5 && month <= 8
              ? 'summer'
              : month >= 9 && month <= 10
                ? 'autumn'
                : 'winter';
        seasonInfo = `in ${season}`;
        monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a creative Indian wedding planner. Generate a compelling, personalized description for a "${vibeName}" wedding vibe.

The description should:
- Be 2-3 sentences long
- Be unique and different each time (use creative variations)
- Incorporate the couple's specific details naturally
- Focus on emotional appeal and visual imagery
- Be enthusiastic and inspiring
- Reference the venue type, ambiance, and experience
- Make the couple feel this vibe is perfect for THEM specifically

Return ONLY the description text, no JSON, no extra formatting.`,
          },
          {
            role: 'user',
            content: `Create a personalized "${vibeName}" vibe description for:
${coupleNames ? `- Couple: ${coupleNames}` : '- A lovely couple'}
- ${guestSize} celebration with ${guests} guests
${weddingDate ? `- Wedding date: ${monthName} ${seasonInfo}` : ''}

Make it unique, compelling, and personalized to their details. Be creative with different angles and perspectives - don't repeat the same patterns.`,
          },
        ],
        temperature: 0.9, // Higher temperature for more variety
        max_tokens: 250,
      });

      const description = completion.choices[0].message.content?.trim();
      if (!description) {
        throw new Error('No description generated');
      }

      logger.info(`Generated personalized description for ${vibeName}`);
      return description;
    } catch (error: any) {
      logger.error(`Error generating personalized description: ${error.message}`);
      // Return a fallback instead of throwing
      return `Perfect for your ${coupleData.guests || 100}-guest celebration!`;
    }
  }
}

export const openAIService = new OpenAIService();
