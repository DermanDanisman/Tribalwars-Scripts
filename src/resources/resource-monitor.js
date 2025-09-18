// ==UserScript==
// @name         Tribal Wars Resource Monitor
// @namespace    https://github.com/DermanDanisman/Tribalwars-Scripts
// @version      1.0.0
// @description  Monitor and optimize village resources
// @author       DermanDanisman
// @match        https://*.tribalwars.net/*
// @match        https://*.die-staemme.de/*
// @require      https://raw.githubusercontent.com/DermanDanisman/Tribalwars-Scripts/main/src/common/utils.js
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Resource Monitor Configuration
    const CONFIG = {
        updateInterval: 60000,      // Update every minute
        alertThresholds: {
            wood: 20000,
            stone: 20000,
            iron: 20000
        },
        trackProduction: true,
        showProjections: true
    };
    
    class ResourceMonitor {
        constructor() {
            this.resources = { wood: 0, stone: 0, iron: 0, pop: 0 };
            this.production = { wood: 0, stone: 0, iron: 0 };
            this.storage = { wood: 0, stone: 0, iron: 0 };
            this.lastUpdate = Date.now();
            this.isRunning = false;
            
            this.init();
        }
        
        init() {
            this.createUI();
            this.updateResources();
            this.startMonitoring();
            TWUtils.debug.log('Resource Monitor initialized');
        }
        
        createUI() {
            const container = document.createElement('div');
            container.id = 'resource-monitor-ui';
            container.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: #f4e4bc;
                border: 2px solid #7d510f;
                padding: 10px;
                border-radius: 5px;
                z-index: 10000;
                min-width: 250px;
                font-family: Verdana, Arial, sans-serif;
                font-size: 11px;
            `;
            
            container.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">
                    📊 Resource Monitor
                </div>
                
                <div id="resource-display" style="margin-bottom: 10px;">
                    <!-- Resource info will be inserted here -->
                </div>
                
                <div id="production-display" style="margin-bottom: 10px; font-size: 10px;">
                    <!-- Production info will be inserted here -->
                </div>
                
                <div style="text-align: center;">
                    <button id="toggle-monitor">${this.isRunning ? 'Stop' : 'Start'} Monitor</button>
                    <button id="monitor-settings" style="margin-left: 5px;">Settings</button>
                </div>
                
                <div id="monitor-settings-panel" style="display: none; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Alert Thresholds:</div>
                    <div style="margin-bottom: 3px;">
                        Wood: <input type="number" id="wood-threshold" value="${CONFIG.alertThresholds.wood}" style="width: 70px;">
                    </div>
                    <div style="margin-bottom: 3px;">
                        Stone: <input type="number" id="stone-threshold" value="${CONFIG.alertThresholds.stone}" style="width: 70px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        Iron: <input type="number" id="iron-threshold" value="${CONFIG.alertThresholds.iron}" style="width: 70px;">
                    </div>
                    <button id="save-settings" style="width: 100%;">Save Settings</button>
                </div>
            `;
            
            document.body.appendChild(container);
            
            this.setupEventListeners();
        }
        
        setupEventListeners() {
            document.getElementById('toggle-monitor').addEventListener('click', () => this.toggleMonitoring());
            document.getElementById('monitor-settings').addEventListener('click', () => this.toggleSettings());
            document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        }
        
        // Start/stop monitoring
        toggleMonitoring() {
            if (this.isRunning) {
                this.stopMonitoring();
            } else {
                this.startMonitoring();
            }
        }
        
        startMonitoring() {
            this.isRunning = true;
            document.getElementById('toggle-monitor').textContent = 'Stop Monitor';
            
            this.monitorInterval = setInterval(() => {
                this.updateResources();
            }, CONFIG.updateInterval);
            
            TWUtils.dom.showNotification('Resource monitoring started', 'success');
        }
        
        stopMonitoring() {
            this.isRunning = false;
            document.getElementById('toggle-monitor').textContent = 'Start Monitor';
            
            if (this.monitorInterval) {
                clearInterval(this.monitorInterval);
            }
            
            TWUtils.dom.showNotification('Resource monitoring stopped', 'info');
        }
        
        // Update resource information
        updateResources() {
            const now = Date.now();
            const timeDiff = (now - this.lastUpdate) / 1000 / 60; // minutes
            
            // Get current resources from page
            const currentResources = this.getCurrentResources();
            if (!currentResources) return;
            
            // Calculate production if we have previous data
            if (this.lastUpdate && timeDiff > 0 && timeDiff < 10) { // Only if reasonable time diff
                this.production.wood = Math.round((currentResources.wood - this.resources.wood) / timeDiff);
                this.production.stone = Math.round((currentResources.stone - this.resources.stone) / timeDiff);
                this.production.iron = Math.round((currentResources.iron - this.resources.iron) / timeDiff);
            }
            
            this.resources = currentResources;
            this.storage = this.getCurrentStorage();
            this.lastUpdate = now;
            
            this.updateDisplay();
            this.checkAlerts();
        }
        
        // Get current resources from the page
        getCurrentResources() {
            try {
                // Try to get from game_data first
                if (window.game_data && window.game_data.village) {
                    const village = window.game_data.village;
                    return {
                        wood: parseInt(village.wood) || 0,
                        stone: parseInt(village.stone) || 0,
                        iron: parseInt(village.iron) || 0,
                        pop: parseInt(village.pop) || 0
                    };
                }
                
                // Fallback: parse from DOM
                const woodElement = document.getElementById('wood');
                const stoneElement = document.getElementById('stone');
                const ironElement = document.getElementById('iron');
                const popElement = document.getElementById('pop_current_label');
                
                if (woodElement && stoneElement && ironElement) {
                    return {
                        wood: parseInt(woodElement.textContent.replace(/[.,]/g, '')) || 0,
                        stone: parseInt(stoneElement.textContent.replace(/[.,]/g, '')) || 0,
                        iron: parseInt(ironElement.textContent.replace(/[.,]/g, '')) || 0,
                        pop: popElement ? parseInt(popElement.textContent.replace(/[.,]/g, '')) || 0 : 0
                    };
                }
                
                return null;
            } catch (error) {
                TWUtils.debug.error('Failed to get current resources', error);
                return null;
            }
        }
        
        // Get storage capacity
        getCurrentStorage() {
            try {
                // Try to find storage info in game data or DOM
                if (window.game_data && window.game_data.village) {
                    const village = window.game_data.village;
                    return {
                        wood: parseInt(village.storage_max) || 24000,
                        stone: parseInt(village.storage_max) || 24000,
                        iron: parseInt(village.storage_max) || 24000
                    };
                }
                
                // Fallback to default warehouse capacity
                return { wood: 24000, stone: 24000, iron: 24000 };
            } catch (error) {
                return { wood: 24000, stone: 24000, iron: 24000 };
            }
        }
        
        // Update the display
        updateDisplay() {
            const resourceDisplay = document.getElementById('resource-display');
            const productionDisplay = document.getElementById('production-display');
            
            if (!resourceDisplay || !productionDisplay) return;
            
            // Format numbers with thousand separators
            const formatNumber = (num) => num.toLocaleString();
            
            // Calculate storage percentages
            const woodPct = Math.round((this.resources.wood / this.storage.wood) * 100);
            const stonePct = Math.round((this.resources.stone / this.storage.stone) * 100);
            const ironPct = Math.round((this.resources.iron / this.storage.iron) * 100);
            
            resourceDisplay.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>🪵 Wood:</span>
                    <span>${formatNumber(this.resources.wood)} (${woodPct}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>🪨 Stone:</span>
                    <span>${formatNumber(this.resources.stone)} (${stonePct}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>⚔️ Iron:</span>
                    <span>${formatNumber(this.resources.iron)} (${ironPct}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>👥 Population:</span>
                    <span>${this.resources.pop}</span>
                </div>
            `;
            
            if (CONFIG.trackProduction && this.production.wood !== 0) {
                // Calculate time to full storage
                const timeToFull = this.calculateTimeToFull();
                
                productionDisplay.innerHTML = `
                    <div style="border-top: 1px solid #ccc; padding-top: 5px;">
                        <div style="font-weight: bold; margin-bottom: 3px;">Production/hour:</div>
                        <div>🪵 ${this.production.wood > 0 ? '+' : ''}${this.production.wood * 60}</div>
                        <div>🪨 ${this.production.stone > 0 ? '+' : ''}${this.production.stone * 60}</div>
                        <div>⚔️ ${this.production.iron > 0 ? '+' : ''}${this.production.iron * 60}</div>
                        ${timeToFull ? `<div style="margin-top: 3px; font-style: italic;">Storage full in: ${timeToFull}</div>` : ''}
                    </div>
                `;
            }
        }
        
        // Calculate time until storage is full
        calculateTimeToFull() {
            const productions = [
                { name: 'Wood', current: this.resources.wood, max: this.storage.wood, rate: this.production.wood },
                { name: 'Stone', current: this.resources.stone, max: this.storage.stone, rate: this.production.stone },
                { name: 'Iron', current: this.resources.iron, max: this.storage.iron, rate: this.production.iron }
            ];
            
            let shortestTime = Infinity;
            let resource = '';
            
            productions.forEach(prod => {
                if (prod.rate > 0) {
                    const remaining = prod.max - prod.current;
                    const timeMinutes = remaining / prod.rate;
                    if (timeMinutes < shortestTime) {
                        shortestTime = timeMinutes;
                        resource = prod.name;
                    }
                }
            });
            
            if (shortestTime === Infinity) return null;
            
            return `${TWUtils.time.formatDuration(Math.round(shortestTime))} (${resource})`;
        }
        
        // Check for resource alerts
        checkAlerts() {
            const thresholds = {
                wood: parseInt(document.getElementById('wood-threshold')?.value) || CONFIG.alertThresholds.wood,
                stone: parseInt(document.getElementById('stone-threshold')?.value) || CONFIG.alertThresholds.stone,
                iron: parseInt(document.getElementById('iron-threshold')?.value) || CONFIG.alertThresholds.iron
            };
            
            // Check if resources exceed thresholds
            if (this.resources.wood >= thresholds.wood) {
                this.showResourceAlert('Wood', this.resources.wood, thresholds.wood);
            }
            if (this.resources.stone >= thresholds.stone) {
                this.showResourceAlert('Stone', this.resources.stone, thresholds.stone);
            }
            if (this.resources.iron >= thresholds.iron) {
                this.showResourceAlert('Iron', this.resources.iron, thresholds.iron);
            }
            
            // Check for storage near full (95%)
            const woodPct = (this.resources.wood / this.storage.wood) * 100;
            const stonePct = (this.resources.stone / this.storage.stone) * 100;
            const ironPct = (this.resources.iron / this.storage.iron) * 100;
            
            if (woodPct >= 95) this.showStorageAlert('Wood', woodPct);
            if (stonePct >= 95) this.showStorageAlert('Stone', stonePct);
            if (ironPct >= 95) this.showStorageAlert('Iron', ironPct);
        }
        
        // Show resource threshold alert
        showResourceAlert(resource, current, threshold) {
            // Only show alert once per threshold crossing (implement cooldown)
            const alertKey = `alert_${resource}_${threshold}`;
            const lastAlert = TWUtils.storage.get(alertKey, 0);
            const now = Date.now();
            
            if (now - lastAlert > 300000) { // 5 minute cooldown
                TWUtils.dom.showNotification(`${resource} reached ${current.toLocaleString()} (threshold: ${threshold.toLocaleString()})`, 'warning');
                TWUtils.storage.set(alertKey, now);
            }
        }
        
        // Show storage alert
        showStorageAlert(resource, percentage) {
            const alertKey = `storage_alert_${resource}`;
            const lastAlert = TWUtils.storage.get(alertKey, 0);
            const now = Date.now();
            
            if (now - lastAlert > 600000) { // 10 minute cooldown
                TWUtils.dom.showNotification(`${resource} storage ${Math.round(percentage)}% full!`, 'warning');
                TWUtils.storage.set(alertKey, now);
            }
        }
        
        // Toggle settings panel
        toggleSettings() {
            const panel = document.getElementById('monitor-settings-panel');
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        }
        
        // Save settings
        saveSettings() {
            CONFIG.alertThresholds.wood = parseInt(document.getElementById('wood-threshold').value) || 20000;
            CONFIG.alertThresholds.stone = parseInt(document.getElementById('stone-threshold').value) || 20000;
            CONFIG.alertThresholds.iron = parseInt(document.getElementById('iron-threshold').value) || 20000;
            
            TWUtils.storage.set('resource_monitor_config', CONFIG);
            TWUtils.dom.showNotification('Settings saved', 'success');
            
            this.toggleSettings();
        }
    }
    
    // Load saved configuration
    const savedConfig = TWUtils.storage.get('resource_monitor_config');
    if (savedConfig) {
        Object.assign(CONFIG, savedConfig);
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ResourceMonitor());
    } else {
        new ResourceMonitor();
    }
    
})();