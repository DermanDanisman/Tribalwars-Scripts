# Contributing to Tribalwars-Scripts

We welcome contributions to this repository! Whether you're fixing bugs, adding new features, or improving documentation, your help is appreciated.

## 🚀 Getting Started

### Prerequisites
- Basic knowledge of JavaScript
- Understanding of Tribal Wars game mechanics
- Familiarity with userscripts (Tampermonkey/Greasemonkey)
- Git and GitHub basics

### Development Setup
1. Fork this repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Tribalwars-Scripts.git
   cd Tribalwars-Scripts
   ```
3. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📁 Project Structure

```
├── src/                 # Source code
│   ├── farming/        # Farming automation scripts
│   ├── attack/         # Attack coordination tools
│   ├── resources/      # Resource management scripts
│   ├── utilities/      # General utility scripts
│   └── common/         # Shared functions and helpers
├── docs/               # Documentation
├── examples/           # Example configurations
└── dist/               # Ready-to-use scripts
```

## 🔧 Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable and function names

### Script Structure
All userscripts should follow this template:

```javascript
// ==UserScript==
// @name         Script Name
// @namespace    https://github.com/DermanDanisman/Tribalwars-Scripts
// @version      1.0.0
// @description  Brief description
// @author       YourName
// @match        https://*.tribalwars.net/*
// @match        https://*.die-staemme.de/*
// @require      https://raw.githubusercontent.com/DermanDanisman/Tribalwars-Scripts/main/src/common/utils.js
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Your code here
    
})();
```

### Using Common Utilities
- Import and use `TWUtils` for common operations
- Don't duplicate functionality that exists in `utils.js`
- Add new utility functions to `utils.js` if they're reusable

### Configuration
- Use a `CONFIG` object for script settings
- Provide sensible defaults
- Document configuration options

## 🧪 Testing

### Manual Testing
1. Test scripts on a test world or dummy account
2. Verify functionality across different browsers
3. Test with various game states (different village sizes, troop counts, etc.)
4. Ensure scripts don't interfere with normal game play

### Testing Checklist
- [ ] Script loads without errors
- [ ] UI elements appear correctly
- [ ] Core functionality works as expected
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] No conflicts with other scripts

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Include parameter descriptions and return types
- Document complex algorithms or game mechanics

### User Documentation
- Update relevant documentation in `/docs`
- Include usage examples
- Document configuration options
- Add troubleshooting information

## 🐛 Bug Reports

When reporting bugs, please include:
- **Browser and version**
- **Userscript manager and version**
- **Tribal Wars world/server**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console error messages** (if any)
- **Screenshot** (if relevant)

Use this template:

```markdown
**Bug Description**
Brief description of the issue

**Environment**
- Browser: Chrome 120.0
- Userscript Manager: Tampermonkey 4.19
- Tribal Wars: en120.tribalwars.net

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Additional Information**
Any other relevant information
```

## ✨ Feature Requests

For new features:
- Check existing issues first
- Describe the use case clearly
- Explain how it would benefit users
- Consider implementation complexity
- Provide mockups or examples if possible

## 🔄 Pull Request Process

### Before Submitting
1. **Test thoroughly**: Ensure your changes work correctly
2. **Update documentation**: Add/update relevant docs
3. **Follow code style**: Match existing formatting and conventions
4. **Update dist files**: Copy updated scripts to `/dist` folder

### PR Guidelines
1. **Clear title**: Use descriptive PR titles
2. **Detailed description**: Explain what changes you made and why
3. **Link issues**: Reference related issues using `#issue-number`
4. **Small commits**: Make focused, atomic commits
5. **Clean history**: Squash commits if necessary

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested on test world
- [ ] Tested with multiple browsers
- [ ] No console errors
- [ ] Documentation updated

## Related Issues
Fixes #issue-number
```

## 🏷️ Version Management

### Semantic Versioning
We use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Process
1. Update version numbers in userscript headers
2. Update CHANGELOG.md
3. Create GitHub release
4. Update dist files

## 🤝 Community Guidelines

### Be Respectful
- Be kind and respectful to other contributors
- Provide constructive feedback
- Help newcomers learn and contribute

### Stay Legal
- Ensure contributions comply with Tribal Wars ToS
- Don't contribute scripts that give unfair advantages
- Respect intellectual property rights

### Quality Focus
- Prioritize code quality over speed
- Write maintainable, readable code
- Consider long-term implications

## 📄 License

By contributing to this repository, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions about contributing:
- Check existing documentation
- Search through issues and discussions
- Create a new issue with the "question" label
- Join community discussions

Thank you for contributing to Tribalwars-Scripts! 🎉