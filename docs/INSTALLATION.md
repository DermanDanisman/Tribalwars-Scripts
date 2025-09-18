# Installation Guide

This guide will help you install and set up Tribal Wars scripts from this repository.

## Prerequisites

Before installing any scripts, you need a userscript manager:

### For Chrome/Edge users
1. Install **Tampermonkey** from the Chrome Web Store
2. Go to [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
3. Click "Add to Chrome"

### For Firefox users
1. Install **Greasemonkey** from Firefox Add-ons
2. Go to [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
3. Click "Add to Firefox"

## Installing Scripts

### Method 1: Direct Installation (Recommended)

1. Navigate to the `/dist` folder in this repository
2. Click on the script file you want to install (e.g., `auto-farmer.js`)
3. Click the "Raw" button to view the raw script content
4. Copy the entire script content
5. Open your userscript manager (Tampermonkey/Greasemonkey)
6. Click "Create a new script"
7. Replace the default content with the copied script
8. Save the script (Ctrl+S)

### Method 2: Download and Install

1. Download the script file from the `/dist` folder
2. Open your userscript manager
3. Go to utilities/options
4. Click "Choose File" or "Import from file"
5. Select the downloaded script file
6. Confirm the installation

## Available Scripts

### 🚜 Auto Farmer (`auto-farmer.js`)
- **Purpose**: Automatically farms barbarian villages for resources
- **Installation**: Copy from `/dist/auto-farmer.js`
- **Usage**: Adds a control panel in the top-right corner of the game

### ⚔️ Attack Planner (`attack-planner.js`)
- **Purpose**: Plan and coordinate timed attacks
- **Installation**: Copy from `/dist/attack-planner.js`
- **Dependencies**: Requires `utils.js` to be installed first
- **Usage**: Adds planning interface on the right side of the game

### 📊 Resource Monitor (`resource-monitor.js`)
- **Purpose**: Monitor village resources and production
- **Installation**: Copy from `/dist/resource-monitor.js`
- **Dependencies**: Requires `utils.js` to be installed first
- **Usage**: Adds monitoring panel in the top-left corner

### 🔧 Utility Library (`utils.js`)
- **Purpose**: Common functions used by other scripts
- **Installation**: Copy from `/dist/utils.js`
- **Note**: Install this first if you plan to use other scripts

## Script Configuration

Most scripts include configuration options that can be modified:

### In-Script Configuration
1. Open the script in your userscript manager
2. Look for the `CONFIG` object at the top of the script
3. Modify values as needed
4. Save the script

### Runtime Configuration
Some scripts provide settings panels accessible while playing:
- Look for "Settings" buttons in script interfaces
- Modify values through the game interface
- Settings are automatically saved

## Troubleshooting

### Script Not Working
1. **Check userscript manager**: Ensure Tampermonkey/Greasemonkey is enabled
2. **Check script status**: Make sure the script is enabled in your manager
3. **Clear cache**: Clear browser cache and reload the game
4. **Check console**: Open browser console (F12) to see error messages

### Script Conflicts
1. **Disable other scripts**: Temporarily disable other userscripts
2. **Check for duplicates**: Ensure you don't have multiple versions installed
3. **Update scripts**: Make sure you're using the latest versions

### Game Updates
If Tribal Wars updates break scripts:
1. Check this repository for updates
2. Report issues in the GitHub issues section
3. Temporarily disable broken scripts

## Security and Safety

### Account Safety
- **Test in dummy villages**: Test scripts on less important villages first
- **Monitor usage**: Keep an eye on script behavior
- **Follow game rules**: Ensure your usage complies with game terms

### Script Safety
- **Only install from trusted sources**: Use scripts from this repository
- **Review code**: Check script content before installing
- **Report suspicious behavior**: Create an issue if a script behaves unexpectedly

## Support

If you need help:

1. **Check documentation**: Review the script-specific docs in `/docs`
2. **Search issues**: Look through existing GitHub issues
3. **Create an issue**: Report bugs or request features
4. **Community forums**: Ask in Tribal Wars community forums

## Updates

To update scripts:

1. **Check for updates**: Visit this repository regularly
2. **Replace old versions**: Remove old script and install new version
3. **Backup settings**: Note your configuration before updating
4. **Test thoroughly**: Verify updated scripts work correctly

---

**Important**: Always ensure your use of these scripts complies with Tribal Wars Terms of Service and your world's specific rules.