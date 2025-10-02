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
    EXTENSION_ACTIVE: '"disable-extensions" is now active!',
    NO_EXTENSIONS_TO_DISABLE: 'No extensions to disable',
    CODE_COMMAND_NOT_RECOGNIZED: "'code' command is not recognized.",
    DISABLE_EXTENSIONS_CONFIRM: 'Disable extensions and open new VS Code?',
    NO_WORKSPACE_FOUND: 'No workspace file found',
    NO_CONFIG_FILE_FOUND: 'No config file found'
  },

  // URLs
  URLS: {
    VS_CODE_CLI_DOCS: 'https://code.visualstudio.com/docs/editor/command-line#_common-questions'
  },

  // Timeouts
  TIMEOUTS: {
    CLOSE_FOLDER_DELAY: 200
  }
} as const;

export type ExtensionConstants = typeof EXTENSION_CONSTANTS;
