// ==UserScript==
// @name         Tribal Wars Auto Farmer
// @namespace    https://github.com/DermanDanisman/Tribalwars-Scripts
// @version      1.0.0
// @description  Automatically farms barbarian villages for resources
// @author       DermanDanisman
// @match        https://*.tribalwars.net/*
// @match        https://*.die-staemme.de/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        maxFarms: 10,           // Maximum number of farms to send per run
        farmDelay: 2000,        // Delay between farm attacks (ms)
        minDistance: 5,         // Minimum distance for farming
        maxDistance: 20,        // Maximum distance for farming
        troopTemplate: {        // Troops to send per farm
            spear: 0,
            sword: 0,
            axe: 100,
            light: 50,
            heavy: 0
        }
    };
    
    // Utility functions
    const Utils = {
        // Get current page URL info
        getCurrentPage: function() {
            const url = window.location.href;
            if (url.includes('screen=place')) return 'place';
            if (url.includes('screen=overview')) return 'overview';
            if (url.includes('screen=map')) return 'map';
            return 'unknown';
        },
        
        // Add delay
        delay: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        // Log messages with timestamp
        log: function(message) {
            console.log(`[Auto Farmer] ${new Date().toLocaleTimeString()}: ${message}`);
        },
        
        // Check if village is barbarian
        isBarbarian: function(villageElement) {
            return villageElement && villageElement.classList.contains('icon-26x26-barbarian');
        }
    };
    
    // Main Auto Farmer class
    class AutoFarmer {
        constructor() {
            this.isRunning = false;
            this.farmCount = 0;
            this.init();
        }
        
        init() {
            this.createUI();
            Utils.log('Auto Farmer initialized');
        }
        
        // Create user interface
        createUI() {
            const container = document.createElement('div');
            container.id = 'auto-farmer-ui';
            container.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #f4e4bc;
                border: 2px solid #7d510f;
                padding: 10px;
                border-radius: 5px;
                z-index: 10000;
                min-width: 200px;
                font-family: Verdana, Arial, sans-serif;
                font-size: 11px;
            `;
            
            container.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">🚜 Auto Farmer</div>
                <div>Status: <span id="farmer-status">Stopped</span></div>
                <div>Farms sent: <span id="farm-count">0</span>/${CONFIG.maxFarms}</div>
                <div style="margin-top: 10px;">
                    <button id="start-farming" style="margin-right: 5px;">Start</button>
                    <button id="stop-farming">Stop</button>
                </div>
                <div style="margin-top: 5px;">
                    <button id="farmer-settings">Settings</button>
                </div>
            `;
            
            document.body.appendChild(container);
            
            // Add event listeners
            document.getElementById('start-farming').addEventListener('click', () => this.start());
            document.getElementById('stop-farming').addEventListener('click', () => this.stop());
            document.getElementById('farmer-settings').addEventListener('click', () => this.showSettings());
        }
        
        // Update UI status
        updateStatus(status) {
            const statusElement = document.getElementById('farmer-status');
            const countElement = document.getElementById('farm-count');
            
            if (statusElement) statusElement.textContent = status;
            if (countElement) countElement.textContent = this.farmCount;
        }
        
        // Start farming
        async start() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            this.farmCount = 0;
            this.updateStatus('Running');
            Utils.log('Auto farming started');
            
            try {
                await this.farmLoop();
            } catch (error) {
                Utils.log(`Error during farming: ${error.message}`);
            }
            
            this.stop();
        }
        
        // Stop farming
        stop() {
            this.isRunning = false;
            this.updateStatus('Stopped');
            Utils.log('Auto farming stopped');
        }
        
        // Main farming loop
        async farmLoop() {
            while (this.isRunning && this.farmCount < CONFIG.maxFarms) {
                // Navigate to map if not already there
                if (Utils.getCurrentPage() !== 'map') {
                    window.location.href = window.location.origin + window.location.pathname + '?screen=map';
                    await Utils.delay(3000);
                    continue;
                }
                
                // Find barbarian villages
                const barbarians = this.findBarbarianVillages();
                
                if (barbarians.length === 0) {
                    Utils.log('No barbarian villages found nearby');
                    break;
                }
                
                // Attack first available barbarian
                const target = barbarians[0];
                await this.attackVillage(target);
                
                this.farmCount++;
                this.updateStatus(`Farming (${this.farmCount}/${CONFIG.maxFarms})`);
                
                await Utils.delay(CONFIG.farmDelay);
            }
        }
        
        // Find barbarian villages on map
        findBarbarianVillages() {
            const barbarians = [];
            const villageElements = document.querySelectorAll('area[href*="screen=info_village"]');
            
            villageElements.forEach(area => {
                const coords = this.extractCoordinates(area.href);
                if (coords && this.isValidTarget(coords)) {
                    barbarians.push({
                        element: area,
                        coords: coords,
                        href: area.href
                    });
                }
            });
            
            return barbarians;
        }
        
        // Extract coordinates from village link
        extractCoordinates(href) {
            const match = href.match(/id=(\d+)/);
            if (!match) return null;
            
            // This is simplified - in a real implementation you'd need to
            // properly extract coordinates from the village ID or map position
            return { x: 500, y: 500 }; // Placeholder
        }
        
        // Check if target is valid for farming
        isValidTarget(coords) {
            // Calculate distance from current village
            // This is simplified - you'd need actual player village coordinates
            const distance = Math.sqrt(Math.pow(coords.x - 500, 2) + Math.pow(coords.y - 500, 2));
            return distance >= CONFIG.minDistance && distance <= CONFIG.maxDistance;
        }
        
        // Attack a specific village
        async attackVillage(target) {
            try {
                // Navigate to place screen
                const placeUrl = window.location.origin + window.location.pathname + '?screen=place';
                window.location.href = placeUrl;
                await Utils.delay(2000);
                
                // Fill in troop numbers (simplified)
                this.fillTroops();
                
                // Submit attack
                this.submitAttack();
                
                Utils.log(`Farm attack sent to ${target.coords.x}|${target.coords.y}`);
                
            } catch (error) {
                Utils.log(`Failed to attack village: ${error.message}`);
            }
        }
        
        // Fill in troop numbers
        fillTroops() {
            for (const [unit, count] of Object.entries(CONFIG.troopTemplate)) {
                const input = document.querySelector(`input[name="${unit}"]`);
                if (input && count > 0) {
                    input.value = count;
                }
            }
        }
        
        // Submit attack form
        submitAttack() {
            const submitButton = document.querySelector('input[type="submit"][value*="Attack"]');
            if (submitButton) {
                submitButton.click();
            }
        }
        
        // Show settings dialog
        showSettings() {
            alert('Settings dialog would open here. Configure farming parameters like max distance, troop template, etc.');
        }
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new AutoFarmer());
    } else {
        new AutoFarmer();
    }
    
})();