import {
  window,
  ViewColumn,
  WebviewPanel,
  ExtensionContext,
  Uri,
  extensions,
  workspace
} from 'vscode';
import { ConfigurationService } from './configurationService';
import { WorkspaceService } from './workspaceService';
import { UserInteractionService } from './userInteractionService';
import { ValidatedConfig, ExtensionConfig } from '../types';
import { EXTENSION_CONSTANTS } from '../constants';

interface ExtensionInfo {
  id: string;
  displayName: string;
  description: string;
  publisher: string;
  version: string;
  enabled: boolean;
  icon?: string;
  categories?: string[];
}

interface WebviewMessage {
  command: string;
  data?: any;
}

/**
 * Service for managing the Extension Manager webview
 */
export class ExtensionManagerWebviewService {
  private panel: WebviewPanel | undefined;
  private configService: ConfigurationService;
  private workspaceService: WorkspaceService;
  private userInteraction: UserInteractionService;
  private context: ExtensionContext | undefined;

  constructor() {
    this.configService = new ConfigurationService();
    this.workspaceService = new WorkspaceService();
    this.userInteraction = new UserInteractionService();
  }

  /**
   * Initialize the service with extension context
   */
  initialize(context: ExtensionContext): void {
    this.context = context;
  }

  /**
   * Show the Extension Manager webview
   */
  async showExtensionManager(): Promise<void> {
    if (!this.context) {
      throw new Error('Webview service not initialized');
    }

    if (!this.workspaceService.hasWorkspace()) {
      this.userInteraction.showError('Please open a workspace to manage extensions');
      return;
    }

    // If panel already exists, just show it
    if (this.panel) {
      this.panel.reveal(ViewColumn.One);
      return;
    }

    // Create new webview panel
    this.panel = window.createWebviewPanel(
      'extensionManager',
      'Workspace Extension Manager',
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          Uri.joinPath(this.context.extensionUri, 'resources'),
          Uri.joinPath(this.context.extensionUri, 'media'),
          // Allow access to all extension directories for their icons
          ...extensions.all
            .filter(ext => ext.extensionUri.scheme === 'file')
            .map(ext => ext.extensionUri)
        ]
      }
    );

    // Set up panel icon
    this.panel.iconPath = {
      light: Uri.joinPath(this.context.extensionUri, 'resources', 'logo.png'),
      dark: Uri.joinPath(this.context.extensionUri, 'resources', 'logo.png')
    };

    // Handle panel disposal
    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleWebviewMessage(message)
    );

    // Set webview content
    await this.updateWebviewContent();
  }

  /**
   * Handle messages received from the webview
   */
  private async handleWebviewMessage(message: WebviewMessage): Promise<void> {
    switch (message.command) {
      case 'ready':
        // Webview is ready, send initial data
        await this.sendExtensionData();
        break;

      case 'toggleExtension':
        await this.toggleExtension(message.data.extensionId, message.data.enabled);
        break;

      case 'saveConfiguration':
        await this.saveConfiguration(message.data.disabledExtensions);
        break;

      case 'applyChanges':
        await this.applyChanges();
        break;

      case 'resetToDefaults':
        await this.resetConfiguration();
        break;

      default:
        console.log('Unknown webview message:', message.command);
    }
  }

  /**
   * Send extension data to the webview
   */
  private async sendExtensionData(): Promise<void> {
    if (!this.panel) return;

    try {
      // Get all installed extensions
      const allExtensions = extensions.all.filter(ext =>
        !ext.id.startsWith('vscode.') &&
        !ext.id.startsWith('ms-vscode.') &&
        ext.id !== 'ToolsHive.vscode-quick-extension-manager'
      );

      // Load current configuration
      const configResult = await this.configService.loadConfig();
      const currentConfig: ValidatedConfig = configResult.success && configResult.config ? configResult.config : {
        disabled: [],
        autoReload: true,
        openInNewWindow: true
      };

      // Transform extensions to webview format
      const extensionData: ExtensionInfo[] = allExtensions.map(ext => {
        // Get the extension icon URI
        let iconUri = '';
        if (ext.packageJSON.icon) {
          try {
            const iconPath = Uri.joinPath(ext.extensionUri, ext.packageJSON.icon);
            iconUri = this.panel?.webview.asWebviewUri(iconPath).toString() || '';
          } catch (error) {
            console.log(`Failed to get icon for ${ext.id}:`, error);
          }
        }

        return {
          id: ext.id,
          displayName: ext.packageJSON.displayName || ext.id,
          description: ext.packageJSON.description || 'No description available',
          publisher: ext.packageJSON.publisher || 'Unknown',
          version: ext.packageJSON.version || '0.0.0',
          enabled: !currentConfig.disabled.includes(ext.id),
          categories: ext.packageJSON.categories || [],
          icon: iconUri
        };
      });

      // Send data to webview
      this.panel.webview.postMessage({
        command: 'updateExtensions',
        data: {
          extensions: extensionData,
          config: currentConfig,
          pendingChanges: 0
        }
      });

    } catch (error) {
      console.error('Failed to send extension data:', error);
      this.userInteraction.showError('Failed to load extension data');
    }
  }

  /**
   * Toggle extension enabled/disabled state
   */
  private async toggleExtension(extensionId: string, enabled: boolean): Promise<void> {
    // This is handled in the webview UI for now
    // The actual configuration is saved when user clicks "Apply Changes"
    console.log(`Toggle extension ${extensionId} to ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Save the extension configuration
   */
  private async saveConfiguration(disabledExtensions: string[]): Promise<void> {
    console.log('Saving configuration with disabled extensions:', disabledExtensions);
    try {
      // Load current configuration to preserve other settings
      const configResult = await this.configService.loadConfig();
      const currentConfig = configResult.success && configResult.config ? configResult.config : {
        disabled: [],
        autoReload: true,
        openInNewWindow: true
      };

      const newConfig: ExtensionConfig = {
        disabled: disabledExtensions,
        autoReload: currentConfig.autoReload,
        openInNewWindow: currentConfig.openInNewWindow
      };

      // Create .vscode directory if it doesn't exist
      const workspacePath = this.workspaceService.getWorkspacePath();
      const configPath = `${workspacePath}/.vscode`;

      try {
        await workspace.fs.stat(Uri.file(configPath));
      } catch {
        await workspace.fs.createDirectory(Uri.file(configPath));
      }

      // Write configuration file
      const configFile = Uri.file(`${configPath}/ext.config.json`);
      const configContent = JSON.stringify(newConfig, null, 2);
      await workspace.fs.writeFile(configFile, Buffer.from(configContent, 'utf8'));

      console.log('Configuration file written:', configFile.fsPath);
      console.log('Configuration content:', configContent);

      // Notify webview that configuration was saved
      if (this.panel) {
        this.panel.webview.postMessage({
          command: 'configurationSaved',
          data: { success: true }
        });
      }

    } catch (error) {
      console.error('Failed to save configuration:', error);
      this.userInteraction.showError('Failed to save extension configuration');

      if (this.panel) {
        this.panel.webview.postMessage({
          command: 'configurationSaved',
          data: { success: false, error: 'Failed to save configuration' }
        });
      }
    }
  }

  /**
   * Apply changes by restarting VS Code with new configuration
   */
  private async applyChanges(): Promise<void> {
    try {
      // Import and use the extension manager to apply changes
      const { ExtensionManager } = await import('../managers');
      const manager = new ExtensionManager();

      if (this.context) {
        await manager.disableExtensions(this.context);
      }
    } catch (error) {
      console.error('Failed to apply changes:', error);
      this.userInteraction.showError('Failed to apply extension changes');
    }
  }

  /**
   * Reset configuration to defaults
   */
  private async resetConfiguration(): Promise<void> {
    try {
      const confirmed = await this.userInteraction.showConfirmation({
        message: 'Reset extension configuration?',
        detail: 'This will enable all extensions for this workspace.'
      });

      if (confirmed.confirmed) {
        await this.saveConfiguration([]);
        await this.sendExtensionData();
      }
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      this.userInteraction.showError('Failed to reset configuration');
    }
  }

  /**
   * Update the webview content with HTML
   */
  private async updateWebviewContent(): Promise<void> {
    if (!this.panel || !this.context) return;

    const webview = this.panel.webview;

    // Get URIs for resources
    const styleUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'style.css')
    );
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'script.js')
    );

    this.panel.webview.html = this.getWebviewContent(styleUri, scriptUri);
  }

  /**
   * Generate the HTML content for the webview
   */
  private getWebviewContent(styleUri: Uri, scriptUri: Uri): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workspace Extension Manager</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
        }

        .controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .search-container {
            position: relative;
            margin-bottom: 20px;
        }

        .search-input {
            width: 100%;
            padding: 10px 40px 10px 15px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-size: 14px;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .search-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.6;
        }

        .filter-controls {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            align-items: center;
        }

        .filter-controls label {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            opacity: 0.8;
        }

        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 13px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .extensions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 15px;
        }

        .extension-card {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            transition: all 0.2s ease;
        }

        .extension-card:hover {
            border-color: var(--vscode-focusBorder);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .extension-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }

        .extension-icon {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            background: transparent;
        }

        .extension-icon-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 4px;
            background: transparent;
        }

        .extension-icon-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: var(--vscode-button-foreground);
            background-color: var(--vscode-button-background);
            border-radius: 4px;
        }

        .extension-info {
            flex: 1;
            min-width: 0;
        }

        .extension-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
            word-wrap: break-word;
        }

        .extension-id {
            font-size: 12px;
            opacity: 0.7;
            font-family: var(--vscode-editor-font-family);
        }

        .extension-description {
            font-size: 13px;
            opacity: 0.8;
            margin-bottom: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .extension-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .extension-meta {
            font-size: 12px;
            opacity: 0.6;
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 24px;
            transition: 0.3s;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: var(--vscode-foreground);
            border-radius: 50%;
            transition: 0.3s;
        }

        input:checked + .toggle-slider {
            background-color: var(--vscode-button-background);
            border-color: var(--vscode-button-background);
        }

        input:checked + .toggle-slider:before {
            transform: translateX(20px);
            background-color: var(--vscode-button-foreground);
        }

        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--vscode-statusBar-background);
            color: var(--vscode-statusBar-foreground);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .status-info {
            font-size: 12px;
        }

        .pending-changes {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
            font-size: 14px;
            opacity: 0.7;
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }

        .empty-state h3 {
            margin-bottom: 8px;
        }

        .extension-card.disabled {
            opacity: 0.6;
        }

        .extension-card.disabled .extension-name {
            text-decoration: line-through;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Workspace Extension Manager</h1>
        <div class="controls">
            <button class="button secondary" id="resetBtn">Reset to Defaults</button>
            <button class="button" id="applyBtn" disabled>Apply Changes</button>
        </div>
    </div>

    <div class="search-container">
        <input type="text" class="search-input" id="searchInput" placeholder="Filter extensions...">
        <span class="search-icon">🔍</span>
    </div>

    <div class="filter-controls">
        <label>Show:</label>
        <button class="button secondary" id="showAllBtn">All</button>
        <button class="button secondary" id="showEnabledBtn">Enabled</button>
        <button class="button secondary" id="showDisabledBtn">Disabled</button>
    </div>

    <div id="extensionsContainer">
        <div class="loading">Loading extensions...</div>
    </div>

    <div class="status-bar">
        <div class="status-info">
            <span id="totalExtensions">0</span> extensions •
            <span id="enabledCount">0</span> enabled •
            <span id="disabledCount">0</span> disabled
        </div>
        <div class="pending-changes" id="pendingChanges" style="display: none;">
            <span id="changesCount">0</span> pending changes
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let allExtensions = [];
        let currentFilter = 'all';
        let searchQuery = '';
        let pendingChanges = new Set();
        let originalDisabledExtensions = new Set();

        // DOM elements
        const searchInput = document.getElementById('searchInput');
        const extensionsContainer = document.getElementById('extensionsContainer');
        const applyBtn = document.getElementById('applyBtn');
        const resetBtn = document.getElementById('resetBtn');
        const showAllBtn = document.getElementById('showAllBtn');
        const showEnabledBtn = document.getElementById('showEnabledBtn');
        const showDisabledBtn = document.getElementById('showDisabledBtn');
        const totalExtensions = document.getElementById('totalExtensions');
        const enabledCount = document.getElementById('enabledCount');
        const disabledCount = document.getElementById('disabledCount');
        const pendingChangesEl = document.getElementById('pendingChanges');
        const changesCount = document.getElementById('changesCount');

        // Event listeners
        searchInput.addEventListener('input', handleSearch);
        applyBtn.addEventListener('click', applyChanges);
        resetBtn.addEventListener('click', resetConfiguration);
        showAllBtn.addEventListener('click', () => setFilter('all'));
        showEnabledBtn.addEventListener('click', () => setFilter('enabled'));
        showDisabledBtn.addEventListener('click', () => setFilter('disabled'));

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateExtensions':
                    updateExtensions(message.data);
                    break;
                case 'configurationSaved':
                    handleConfigurationSaved(message.data);
                    break;
            }
        });

        function updateExtensions(data) {
            allExtensions = data.extensions;
            originalDisabledExtensions = new Set(data.config.disabled);
            pendingChanges.clear();
            renderExtensions();
            updateStatusBar();
            updateApplyButton();
        }

        function renderExtensions() {
            const filteredExtensions = allExtensions.filter(ext => {
                const matchesSearch = ext.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    ext.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    ext.description.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesFilter = currentFilter === 'all' ||
                                    (currentFilter === 'enabled' && ext.enabled) ||
                                    (currentFilter === 'disabled' && !ext.enabled);

                return matchesSearch && matchesFilter;
            });

            if (filteredExtensions.length === 0) {
                extensionsContainer.innerHTML = '<div class="empty-state"><h3>No extensions found</h3><p>Try adjusting your search or filter criteria.</p></div>';
                return;
            }

            extensionsContainer.innerHTML = '<div class="extensions-grid">' +
                filteredExtensions.map(renderExtensionCard).join('') +
                '</div>';
        }

        function renderExtensionCard(ext) {
            const isDisabled = !ext.enabled;
            const iconText = ext.displayName.substring(0, 2).toUpperCase();

            // Use actual extension icon if available, otherwise fallback to initials
            const iconContent = ext.icon
                ? \`<img src="\${ext.icon}" alt="\${ext.displayName}" class="extension-icon-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">\`
                + \`<div class="extension-icon-fallback" style="display: none;">\${iconText}</div>\`
                : \`<div class="extension-icon-fallback">\${iconText}</div>\`;

            return \`
                <div class="extension-card \${isDisabled ? 'disabled' : ''}">
                    <div class="extension-header">
                        <div class="extension-icon">\${iconContent}</div>
                        <div class="extension-info">
                            <div class="extension-name">\${ext.displayName}</div>
                            <div class="extension-id">\${ext.publisher} • \${ext.id}</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" \${ext.enabled ? 'checked' : ''}
                                   onchange="toggleExtension('\${ext.id}', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="extension-description">\${ext.description}</div>
                    <div class="extension-footer">
                        <div class="extension-meta">v\${ext.version}</div>
                    </div>
                </div>
            \`;
        }

        function toggleExtension(extensionId, enabled) {
            const ext = allExtensions.find(e => e.id === extensionId);
            if (ext) {
                ext.enabled = enabled;

                // Track pending changes
                const wasOriginallyDisabled = originalDisabledExtensions.has(extensionId);
                const isNowDisabled = !enabled;

                if (wasOriginallyDisabled !== isNowDisabled) {
                    pendingChanges.add(extensionId);
                } else {
                    pendingChanges.delete(extensionId);
                }

                updateStatusBar();
                updateApplyButton();
                renderExtensions();
            }
        }

        function handleSearch(event) {
            searchQuery = event.target.value;
            renderExtensions();
        }

        function setFilter(filter) {
            currentFilter = filter;

            // Update button states
            document.querySelectorAll('.filter-controls .button').forEach(btn => {
                btn.classList.remove('button');
                btn.classList.add('button', 'secondary');
            });

            const activeBtn = filter === 'all' ? showAllBtn :
                             filter === 'enabled' ? showEnabledBtn : showDisabledBtn;
            activeBtn.classList.remove('secondary');

            renderExtensions();
        }

        function updateStatusBar() {
            const enabled = allExtensions.filter(ext => ext.enabled).length;
            const disabled = allExtensions.length - enabled;

            totalExtensions.textContent = allExtensions.length;
            enabledCount.textContent = enabled;
            disabledCount.textContent = disabled;

            if (pendingChanges.size > 0) {
                pendingChangesEl.style.display = 'block';
                changesCount.textContent = pendingChanges.size;
            } else {
                pendingChangesEl.style.display = 'none';
            }
        }

        function updateApplyButton() {
            applyBtn.disabled = pendingChanges.size === 0;
        }

        function applyChanges() {
            const disabledExtensions = allExtensions
                .filter(ext => !ext.enabled)
                .map(ext => ext.id);

            console.log('Applying changes with disabled extensions:', disabledExtensions);
            console.log('All extensions state:', allExtensions.map(ext => ({ id: ext.id, enabled: ext.enabled })));

            vscode.postMessage({
                command: 'saveConfiguration',
                data: { disabledExtensions: disabledExtensions }
            });
        }

        function resetConfiguration() {
            vscode.postMessage({
                command: 'resetToDefaults'
            });
        }

        function handleConfigurationSaved(data) {
            if (data.success) {
                // Configuration saved successfully
                pendingChanges.clear();
                originalDisabledExtensions = new Set(allExtensions.filter(ext => !ext.enabled).map(ext => ext.id));
                updateStatusBar();
                updateApplyButton();

                // Show apply changes notification
                vscode.postMessage({
                    command: 'applyChanges'
                });
            } else {
                // Show error
                console.error('Failed to save configuration:', data.error);
            }
        }

        // Initialize when webview loads
        document.addEventListener('DOMContentLoaded', () => {
            vscode.postMessage({ command: 'ready' });
        });

        // Send ready message immediately
        vscode.postMessage({ command: 'ready' });
    </script>
</body>
</html>`;
  }
}
