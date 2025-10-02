import { workspace, window } from 'vscode';
import { ExtensionConfig, ValidatedConfig, ConfigLoadResult } from '../types';
import { EXTENSION_CONSTANTS } from '../constants';

/**
 * Service for managing extension configuration
 */
export class ConfigurationService {

  /**
   * Loads and validates the extension configuration
   */
  async loadConfig(): Promise<ConfigLoadResult> {
    try {
      const files = await workspace.findFiles(
        EXTENSION_CONSTANTS.CONFIG_FILE_GLOB,
        EXTENSION_CONSTANTS.CONFIG_EXCLUDE_PATTERN
      );

      if (files.length !== 1) {
        return {
          success: false,
          error: EXTENSION_CONSTANTS.MESSAGES.NO_CONFIG_FILE_FOUND
        };
      }

      const buffer = await workspace.fs.readFile(files[0]);
      const rawConfig: ExtensionConfig = JSON.parse(buffer.toString());

      const validatedConfig = this.validateAndNormalizeConfig(rawConfig);

      return {
        success: true,
        config: validatedConfig
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load configuration'
      };
    }
  }

  /**
   * Validates and applies default values to the configuration
   */
  private validateAndNormalizeConfig(config: ExtensionConfig): ValidatedConfig {
    return {
      disabled: Array.isArray(config.disabled) ? config.disabled : [],
      autoReload: config.autoReload ?? true,
      openInNewWindow: config.openInNewWindow ?? true
    };
  }

  /**
   * Checks if there are extensions to disable
   */
  hasExtensionsToDisable(config: ValidatedConfig): boolean {
    return config.disabled.length > 0;
  }
}
