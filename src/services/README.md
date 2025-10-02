# Services Documentation

This directory contains the core business logic services for the Quick Extension Manager extension.

## 🏗️ Service Architecture

Each service is responsible for a specific domain of functionality:

### ConfigurationService
Handles loading and validating extension configuration from `.vscode/ext.config.json`.

```typescript
const configService = new ConfigurationService();
const result = await configService.loadConfig();
if (result.success) {
  console.log('Extensions to disable:', result.config.disabled);
}
```

### WorkspaceService
Manages workspace path operations and validation.

```typescript
const workspaceService = new WorkspaceService();
const workspacePath = workspaceService.getWorkspacePath();
const hasWorkspace = workspaceService.hasWorkspace();
```

### CommandBuilderService
Constructs VS Code CLI commands for disabling extensions.

```typescript
const commandBuilder = new CommandBuilderService();
const command = commandBuilder.buildDisableCommand(config, workspacePath);
// Result: "code --new-window --disable-extension ext1 --disable-extension ext2 /path/to/workspace"
```

### UserInteractionService
Handles all user interactions, dialogs, and notifications.

```typescript
const userInteraction = new UserInteractionService();

// Show confirmation dialog
const result = await userInteraction.showConfirmation({
  message: 'Are you sure?',
  modal: true
});

// Show error with action
const actionClicked = await userInteraction.showError('Error occurred', 'Learn More');
```

### ExecutionService
Executes commands and manages VS Code window operations.

```typescript
const executionService = new ExecutionService();

// Check if VS Code CLI is available
const cliAvailable = await executionService.checkVSCodeCLI(workspacePath);

// Execute disable command
executionService.executeDisableCommand(command, workspacePath, config);

// Open URL in VS Code
await executionService.openUrl('https://example.com');
```

## 🔧 Usage Patterns

### Simple Service Usage
```typescript
import { ConfigurationService } from './services';

const configService = new ConfigurationService();
const config = await configService.loadConfig();
```

### Service Composition
```typescript
import {
  ConfigurationService,
  WorkspaceService,
  CommandBuilderService
} from './services';

const configService = new ConfigurationService();
const workspaceService = new WorkspaceService();
const commandBuilder = new CommandBuilderService();

// Load config
const configResult = await configService.loadConfig();
if (!configResult.success) return;

// Get workspace
const workspacePath = workspaceService.getWorkspacePath();

// Build command
const command = commandBuilder.buildDisableCommand(configResult.config, workspacePath);
```

## 🧪 Testing Services

Each service is designed to be easily testable:

```typescript
// Example test
describe('ConfigurationService', () => {
  it('should validate configuration correctly', async () => {
    const service = new ConfigurationService();
    // Mock workspace.findFiles...
    const result = await service.loadConfig();
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Extending Services

To add new functionality:

1. **Extend existing service** if related functionality
2. **Create new service** if different domain
3. **Follow the same patterns** for consistency

```typescript
// Example: Extending ConfigurationService
class ConfigurationService {
  async loadConfig(): Promise<ConfigLoadResult> { /* existing */ }

  // New method
  async saveConfig(config: ExtensionConfig): Promise<void> {
    // Implementation
  }
}
```

## 📋 Service Interface Guidelines

- Use async/await for all async operations
- Return result objects instead of throwing errors
- Use TypeScript interfaces for all parameters and return types
- Document public methods with JSDoc
- Keep methods focused and single-purpose
