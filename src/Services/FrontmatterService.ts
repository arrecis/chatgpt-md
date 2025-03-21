import { App, MarkdownView } from "obsidian";
import { parseSettingsFrontmatter } from "src/Utilities/TextHelpers";
import { ChatGPT_MDSettings } from "src/Models/Config";
import { DEFAULT_OPENAI_CONFIG } from "src/Services/OpenAiService";
import { DEFAULT_OLLAMA_CONFIG } from "src/Services/OllamaService";
import { DEFAULT_OPENROUTER_CONFIG } from "src/Services/OpenRouterService";
import { aiProviderFromUrl } from "src/Services/AiService";
import { AI_SERVICE_OLLAMA, AI_SERVICE_OPENAI, AI_SERVICE_OPENROUTER } from "src/Constants";

/**
 * Service responsible for frontmatter parsing and generation
 */
export class FrontmatterService {
  constructor(private app: App) {}

  /**
   * Get frontmatter from a markdown view
   */
  getFrontmatter(view: MarkdownView, settings: ChatGPT_MDSettings): any {
    const frontmatter = parseSettingsFrontmatter(view.editor.getValue());

    // Determine the AI service type
    let aiService =
      frontmatter.aiService || aiProviderFromUrl(frontmatter.url, frontmatter.model) || AI_SERVICE_OPENAI;

    // Get the default config for the service type
    let defaultConfig;
    switch (aiService) {
      case AI_SERVICE_OPENAI:
        defaultConfig = DEFAULT_OPENAI_CONFIG;
        break;
      case AI_SERVICE_OLLAMA:
        defaultConfig = DEFAULT_OLLAMA_CONFIG;
        break;
      case AI_SERVICE_OPENROUTER:
        defaultConfig = DEFAULT_OPENROUTER_CONFIG;
        break;
      default:
        defaultConfig = DEFAULT_OPENAI_CONFIG;
    }

    // Parse default frontmatter from settings if it exists
    let defaultFrontmatterSettings = null;
    if (settings.defaultChatFrontmatter) {
      defaultFrontmatterSettings = parseSettingsFrontmatter(settings.defaultChatFrontmatter);
      aiService = aiProviderFromUrl(defaultFrontmatterSettings.url, defaultFrontmatterSettings.model) || aiService;
    }

    // Merge the default config with the settings, default frontmatter, and file frontmatter
    // Order of precedence: defaultConfig < settings < defaultFrontmatterSettings < frontmatter
    return {
      ...defaultConfig,
      ...settings,
      ...defaultFrontmatterSettings,
      ...frontmatter,
      aiService,
    };
  }

  /**
   * Generate frontmatter for a new chat
   */
  generateFrontmatter(settings: ChatGPT_MDSettings, additionalSettings: Record<string, any> = {}): string {
    // If default frontmatter exists in settings, use it as a base
    if (settings.defaultChatFrontmatter) {
      // If there are additional settings, merge them with the default frontmatter
      if (Object.keys(additionalSettings).length > 0) {
        const defaultFrontmatter = parseSettingsFrontmatter(settings.defaultChatFrontmatter);
        const mergedFrontmatter = { ...defaultFrontmatter, ...additionalSettings };

        // Convert to YAML
        const frontmatterLines = Object.entries(mergedFrontmatter).map(([key, value]) => {
          if (value === null || value === undefined) {
            return `${key}:`;
          }
          if (typeof value === "string") {
            return `${key}: "${value}"`;
          }
          return `${key}: ${value}`;
        });

        return `---\n${frontmatterLines.join("\n")}\n---\n\n`;
      }

      // If no additional settings, return the default frontmatter as is
      return settings.defaultChatFrontmatter + "\n\n";
    }

    // If no default frontmatter in settings, generate one from scratch
    // Determine the AI service type
    const aiService = additionalSettings.aiService || AI_SERVICE_OPENAI;

    // Get the default config for the service type
    let frontmatterObj: Record<string, any> = {
      stream: settings.stream,
      ...additionalSettings,
    };

    // Add service-specific properties
    switch (aiService) {
      case AI_SERVICE_OPENAI:
        frontmatterObj = {
          ...frontmatterObj,
          model: DEFAULT_OPENAI_CONFIG.model,
          temperature: DEFAULT_OPENAI_CONFIG.temperature,
          top_p: DEFAULT_OPENAI_CONFIG.top_p,
          max_tokens: DEFAULT_OPENAI_CONFIG.max_tokens,
          presence_penalty: DEFAULT_OPENAI_CONFIG.presence_penalty,
          frequency_penalty: DEFAULT_OPENAI_CONFIG.frequency_penalty,
        };
        break;
      case AI_SERVICE_OLLAMA:
        frontmatterObj = {
          ...frontmatterObj,
          model: DEFAULT_OLLAMA_CONFIG.model,
          url: DEFAULT_OLLAMA_CONFIG.url,
        };
        break;
      case AI_SERVICE_OPENROUTER:
        frontmatterObj = {
          ...frontmatterObj,
          model: DEFAULT_OPENROUTER_CONFIG.model,
          temperature: DEFAULT_OPENROUTER_CONFIG.temperature,
          top_p: DEFAULT_OPENROUTER_CONFIG.top_p,
          max_tokens: DEFAULT_OPENROUTER_CONFIG.max_tokens,
          presence_penalty: DEFAULT_OPENROUTER_CONFIG.presence_penalty,
          frequency_penalty: DEFAULT_OPENROUTER_CONFIG.frequency_penalty,
        };
        break;
    }

    // Convert to YAML
    const frontmatterLines = Object.entries(frontmatterObj).map(([key, value]) => {
      if (value === null || value === undefined) {
        return `${key}:`;
      }
      if (typeof value === "string") {
        return `${key}: "${value}"`;
      }
      return `${key}: ${value}`;
    });

    return `---\n${frontmatterLines.join("\n")}\n---\n\n`;
  }
}
