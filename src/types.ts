/**
 * Configuration structure for the extension
 */
export interface ExtensionConfig {
  /** Array of extension IDs to disable */
  disabled: string[];
  /** Whether to automatically reload VS Code after disabling extensions */
  autoReload?: boolean;
  /** Whether to open the workspace in a new window */
  openInNewWindow?: boolean;
}

/**
 * Validated configuration with default values applied
 */
export interface ValidatedConfig extends ExtensionConfig {
  autoReload: boolean;
  openInNewWindow: boolean;
}

/**
 * Result of configuration loading operation
 */
export interface ConfigLoadResult {
  success: boolean;
  config?: ValidatedConfig;
  error?: string;
}

/**
 * Options for confirming user actions
 */
export interface ConfirmationOptions {
  message: string;
  detail?: string;
  modal?: boolean;
}

/**
 * Result of user confirmation
 */
export interface ConfirmationResult {
  confirmed: boolean;
}

// Legacy type for backward compatibility
export type Configs = ExtensionConfig;
