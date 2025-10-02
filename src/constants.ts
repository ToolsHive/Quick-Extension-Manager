/**
 * Constants used throughout the extension
 */

export const EXTENSION_CONSTANTS = {
  // Extension identifiers
  EXTENSION_ID: 'muzaisimao.vscode-disable-extensions',

  // Configuration
  CONFIG_FILE_GLOB: '.vscode/ext.config.json',
  CONFIG_EXCLUDE_PATTERN: '**/node_modules/**',

  // Commands
  VSCODE_COMMANDS: {
    CLOSE_FOLDER: 'workbench.action.closeFolder',
    CLOSE_WINDOW: 'workbench.action.closeWindow',
    OPEN_URL: 'vscode.open'
  },

  // CLI Commands
  CLI_COMMANDS: {
    CODE_VERSION: 'code -v',
    CODE_REUSE_WINDOW: 'code --reuse-window',
    CODE_NEW_WINDOW: 'code --new-window'
  },

  // Messages
  MESSAGES: {
    EXTENSION_ACTIVE: '"Quick Extension Manager" is now active!',
    NO_EXTENSIONS_TO_DISABLE: 'No extensions to disable',
    CODE_COMMAND_NOT_RECOGNIZED: "'code' command is not recognized.",
    DISABLE_EXTENSIONS_CONFIRM: 'Disable extensions and open new VS Code?',
    NO_WORKSPACE_FOUND: 'No workspace file found',
    NO_CONFIG_FILE_FOUND: 'No config file found',
    EXTENSION_ENABLED: 'Quick Extension Manager has been enabled',
    EXTENSION_DISABLED: 'Quick Extension Manager has been disabled',
    EXTENSION_ALREADY_ENABLED: 'Quick Extension Manager is already enabled',
    EXTENSION_ALREADY_DISABLED: 'Quick Extension Manager is already disabled',
    UPDATE_CHECK: 'Checking for updates...',
    UPDATE_AVAILABLE: 'Update available! Please check the marketplace.',
    UPDATE_NOT_AVAILABLE: 'You are using the latest version.',
    OPENING_GITHUB: 'Opening GitHub repository...',
    OPENING_SETTINGS: 'Opening extension settings...',
    OPENING_REPORT: 'Opening issue tracker...',
    SELECT_EXTENSIONS: 'Select extensions to manage',
    MANAGE_SUCCESS: 'Extension configuration updated successfully'
  },

  // Extension Commands
  COMMANDS: {
    ENABLE: 'quickExtensionManager.enable',
    DISABLE: 'quickExtensionManager.disable',
    UPDATE: 'quickExtensionManager.update',
    GITHUB: 'quickExtensionManager.github',
    SETTINGS: 'quickExtensionManager.settings',
    REPORT: 'quickExtensionManager.report',
    MANAGE: 'quickExtensionManager.manage'
  },

  // URLs
  URLS: {
    VS_CODE_CLI_DOCS: 'https://code.visualstudio.com/docs/editor/command-line#_common-questions',
    GITHUB_REPO: 'https://github.com/ToolsHive/Quick-Extension-Manager',
    GITHUB_ISSUES: 'https://github.com/ToolsHive/Quick-Extension-Manager/issues',
    MARKETPLACE: 'https://marketplace.visualstudio.com/items?itemName=ToolsHive.vscode-quick-extension-manager'
  },

  // Timeouts
  TIMEOUTS: {
    CLOSE_FOLDER_DELAY: 200
  }
} as const;

export type ExtensionConstants = typeof EXTENSION_CONSTANTS;
