# Quick Extension Manager Changelog

## [1.0.0] - 2025-10-02

**Major Release: Complete Architecture Overhaul**

### Added
- **Modern Webview Interface** - Professional card-based UI for extension management
- **Real Extension Icons** - Displays authentic logos from each extension
- **Interactive Toggle Switches** - Intuitive enable/disable controls
- **Real-time Search and Filtering** - Find extensions by name, ID, or description
- **Smart Extension Detection** - Automatically excludes built-in VS Code extensions
- **Team Collaboration Support** - Shareable workspace configurations via `.vscode/ext.config.json`
- **Comprehensive Command Suite** - 7 new commands for complete functionality:
  - Quick Extension Manager: Manage Extensions
  - Quick Extension Manager: Enable Extension Manager
  - Quick Extension Manager: Disable Extension Manager
  - Quick Extension Manager: Update Extension
  - Quick Extension Manager: Open GitHub Repository
  - Quick Extension Manager: Open Settings
  - Quick Extension Manager: Report Issue

### Changed
- **Complete Architecture Refactor** - Moved from monolithic to service-based architecture
- **Enhanced TypeScript Support** - Comprehensive type definitions and interfaces
- **Improved Error Handling** - Robust error management with user-friendly feedback
- **Performance Optimization** - Efficient extension loading and management
- **Modern UI/UX** - Replaced quick pick interface with professional webview panel

### Technical Improvements
- **ExtensionManagerWebviewService** - Modern UI interface management
- **ConfigurationService** - Advanced workspace settings validation
- **WorkspaceService** - Enhanced workspace operations
- **CommandBuilderService** - Sophisticated CLI command construction
- **ExecutionService** - Reliable command execution and process management
- **UserInteractionService** - Consistent user dialog management

### Fixed
- Configuration saving issues in webview interface
- Icon background color problems in extension cards
- VS Code CLI detection and error handling
- Workspace path validation and error reporting
- Extension ID validation and filtering

### Breaking Changes
- Minimum VS Code version increased to 1.58.0
- Extension now requires VS Code CLI to be available in system PATH
- Configuration format remains backward compatible

### Security
- Enhanced input validation for extension IDs
- Secure webview implementation with proper CSP headers
- Safe command execution with parameter validation

---

## [0.1.2] - 2021-11-30

- update deps and docs

---

## [0.1.1] - 2021-11-10

- initial release
