// ==UserScript==
// @name         Tribal Wars Attack Planner
// @namespace    https://github.com/DermanDanisman/Tribalwars-Scripts
// @version      1.0.0
// @description  Plan and coordinate timed attacks
// @author       DermanDanisman
// @match        https://*.tribalwars.net/*
// @match        https://*.die-staemme.de/*
// @require      https://raw.githubusercontent.com/DermanDanisman/Tribalwars-Scripts/main/src/common/utils.js
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Attack Planner Configuration
    const CONFIG = {
        defaultLandingTime: '12:00:00',
        maxPlannedAttacks: 50,
        autoCalculateTiming: true
    };
    
    class AttackPlanner {
        constructor() {
            this.plannedAttacks = TWUtils.storage.get('planned_attacks', []);
            this.init();
        }
        
        init() {
            if (TWUtils.url.getCurrentScreen() === 'place') {
                this.enhancePlaceScreen();
            }
            this.createPlannerUI();
            TWUtils.debug.log('Attack Planner initialized');
        }
        
        // Create main planner interface
        createPlannerUI() {
            const container = document.createElement('div');
            container.id = 'attack-planner-ui';
            container.style.cssText = `
                position: fixed;
                top: 50px;
                right: 10px;
                background: #f4e4bc;
                border: 2px solid #7d510f;
                padding: 10px;
                border-radius: 5px;
                z-index: 10000;
                min-width: 300px;
                font-family: Verdana, Arial, sans-serif;
                font-size: 11px;
                max-height: 400px;
                overflow-y: auto;
            `;
            
            container.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">
                    ⚔️ Attack Planner
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Quick Plan:</div>
                    <input type="text" id="target-coords" placeholder="XXX|YYY" style="width: 80px; margin-right: 5px;">
                    <input type="time" id="landing-time" value="${CONFIG.defaultLandingTime}" style="width: 80px; margin-right: 5px;">
                    <button id="add-attack" style="font-size: 10px;">Add</button>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <button id="toggle-planner" style="width: 100%;">
                        ${this.plannedAttacks.length > 0 ? `Hide Plans (${this.plannedAttacks.length})` : 'Show Plans (0)'}
                    </button>
                </div>
                
                <div id="planned-attacks-list" style="display: none; max-height: 200px; overflow-y: auto;">
                    <!-- Planned attacks will be inserted here -->
                </div>
                
                <div style="text-align: center; margin-top: 10px;">
                    <button id="clear-all-plans" style="font-size: 10px; color: #d00;">Clear All</button>
                </div>
            `;
            
            document.body.appendChild(container);
            
            // Add event listeners
            this.setupEventListeners();
            this.updatePlansList();
        }
        
        setupEventListeners() {
            document.getElementById('add-attack').addEventListener('click', () => this.addAttack());
            document.getElementById('toggle-planner').addEventListener('click', () => this.togglePlansList());
            document.getElementById('clear-all-plans').addEventListener('click', () => this.clearAllPlans());
            
            // Enter key support for quick planning
            document.getElementById('target-coords').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addAttack();
            });
        }
        
        // Add new attack to plan
        addAttack() {
            const coordsInput = document.getElementById('target-coords');
            const timeInput = document.getElementById('landing-time');
            
            const coords = TWUtils.coords.parse(coordsInput.value);
            const landingTime = timeInput.value;
            
            if (!coords) {
                TWUtils.dom.showNotification('Invalid coordinates format (use XXX|YYY)', 'error');
                return;
            }
            
            if (!landingTime) {
                TWUtils.dom.showNotification('Please specify landing time', 'error');
                return;
            }
            
            const currentVillage = TWUtils.game.getVillageCoords();
            if (!currentVillage) {
                TWUtils.dom.showNotification('Could not determine current village', 'error');
                return;
            }
            
            // Calculate launch time
            const travelTime = TWUtils.coords.walkingTime(currentVillage, coords, 35); // Noble speed
            const launchTime = this.calculateLaunchTime(landingTime, travelTime);
            
            const attack = {
                id: Date.now(),
                target: coords,
                landingTime: landingTime,
                launchTime: launchTime,
                travelTime: travelTime,
                fromVillage: currentVillage,
                villageId: TWUtils.game.getVillageId(),
                status: 'planned',
                createdAt: new Date().toISOString()
            };
            
            this.plannedAttacks.push(attack);
            this.savePlans();
            this.updatePlansList();
            
            // Clear inputs
            coordsInput.value = '';
            timeInput.value = CONFIG.defaultLandingTime;
            
            TWUtils.dom.showNotification(`Attack planned for ${TWUtils.coords.format(coords.x, coords.y)}`, 'success');
        }
        
        // Calculate when to launch attack
        calculateLaunchTime(landingTime, travelTimeMinutes) {
            const [hours, minutes, seconds] = landingTime.split(':').map(Number);
            const landingMinutes = hours * 60 + minutes;
            const launchMinutes = landingMinutes - travelTimeMinutes;
            
            if (launchMinutes < 0) {
                // Launch time is next day
                const adjustedLaunch = launchMinutes + 1440; // Add 24 hours
                const launchHours = Math.floor(adjustedLaunch / 60);
                const launchMins = adjustedLaunch % 60;
                return `${launchHours.toString().padStart(2, '0')}:${launchMins.toString().padStart(2, '0')}:00`;
            } else {
                const launchHours = Math.floor(launchMinutes / 60);
                const launchMins = launchMinutes % 60;
                return `${launchHours.toString().padStart(2, '0')}:${launchMins.toString().padStart(2, '0')}:00`;
            }
        }
        
        // Toggle plans list visibility
        togglePlansList() {
            const list = document.getElementById('planned-attacks-list');
            const button = document.getElementById('toggle-planner');
            
            if (list.style.display === 'none') {
                list.style.display = 'block';
                button.textContent = `Hide Plans (${this.plannedAttacks.length})`;
            } else {
                list.style.display = 'none';
                button.textContent = `Show Plans (${this.plannedAttacks.length})`;
            }
        }
        
        // Update the plans list display
        updatePlansList() {
            const list = document.getElementById('planned-attacks-list');
            const button = document.getElementById('toggle-planner');
            
            if (!list) return;
            
            button.textContent = button.textContent.includes('Hide') ? 
                `Hide Plans (${this.plannedAttacks.length})` : 
                `Show Plans (${this.plannedAttacks.length})`;
            
            if (this.plannedAttacks.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #999;">No attacks planned</div>';
                return;
            }
            
            // Sort by launch time
            const sortedAttacks = [...this.plannedAttacks].sort((a, b) => {
                return a.launchTime.localeCompare(b.launchTime);
            });
            
            list.innerHTML = sortedAttacks.map(attack => {
                const targetCoords = TWUtils.coords.format(attack.target.x, attack.target.y);
                const statusColor = attack.status === 'sent' ? '#7ed321' : attack.status === 'missed' ? '#d0021b' : '#4a90e2';
                
                return `
                    <div style="border: 1px solid #ccc; margin: 5px 0; padding: 5px; border-radius: 3px; background: #fff;">
                        <div style="font-weight: bold;">Target: ${targetCoords}</div>
                        <div>Launch: ${attack.launchTime}</div>
                        <div>Landing: ${attack.landingTime}</div>
                        <div>Travel: ${TWUtils.time.formatDuration(attack.travelTime)}</div>
                        <div style="color: ${statusColor};">Status: ${attack.status}</div>
                        <div style="margin-top: 5px;">
                            <button onclick="attackPlanner.sendAttack('${attack.id}')" style="font-size: 10px; margin-right: 5px;">Send Now</button>
                            <button onclick="attackPlanner.removeAttack('${attack.id}')" style="font-size: 10px; color: #d00;">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Send attack immediately
        sendAttack(attackId) {
            const attack = this.plannedAttacks.find(a => a.id == attackId);
            if (!attack) return;
            
            // Navigate to place screen with target
            const placeUrl = TWUtils.url.build('place', {
                target: TWUtils.coords.format(attack.target.x, attack.target.y)
            });
            
            attack.status = 'sent';
            this.savePlans();
            this.updatePlansList();
            
            window.location.href = placeUrl;
        }
        
        // Remove attack from plan
        removeAttack(attackId) {
            this.plannedAttacks = this.plannedAttacks.filter(a => a.id != attackId);
            this.savePlans();
            this.updatePlansList();
            TWUtils.dom.showNotification('Attack removed from plan', 'info');
        }
        
        // Clear all planned attacks
        clearAllPlans() {
            if (this.plannedAttacks.length === 0) return;
            
            if (confirm(`Remove all ${this.plannedAttacks.length} planned attacks?`)) {
                this.plannedAttacks = [];
                this.savePlans();
                this.updatePlansList();
                TWUtils.dom.showNotification('All plans cleared', 'info');
            }
        }
        
        // Enhance the place screen with timing info
        enhancePlaceScreen() {
            // Add timing calculator to place screen
            const placeTable = document.querySelector('table');
            if (!placeTable) return;
            
            const timingRow = document.createElement('tr');
            timingRow.innerHTML = `
                <td>Landing Time:</td>
                <td>
                    <input type="time" id="desired-landing-time" value="${CONFIG.defaultLandingTime}">
                    <button id="calculate-timing" style="margin-left: 5px;">Calculate Launch</button>
                </td>
            `;
            
            placeTable.appendChild(timingRow);
            
            document.getElementById('calculate-timing').addEventListener('click', () => {
                this.calculateTimingForCurrentAttack();
            });
        }
        
        // Calculate timing for current attack on place screen
        calculateTimingForCurrentAttack() {
            const targetInput = document.querySelector('input[name="x"]');
            const targetInputY = document.querySelector('input[name="y"]');
            const landingTimeInput = document.getElementById('desired-landing-time');
            
            if (!targetInput || !targetInputY || !landingTimeInput) {
                TWUtils.dom.showNotification('Could not find target coordinates', 'error');
                return;
            }
            
            const targetX = parseInt(targetInput.value);
            const targetY = parseInt(targetInputY.value);
            const landingTime = landingTimeInput.value;
            
            if (isNaN(targetX) || isNaN(targetY)) {
                TWUtils.dom.showNotification('Invalid target coordinates', 'error');
                return;
            }
            
            const currentVillage = TWUtils.game.getVillageCoords();
            const target = { x: targetX, y: targetY };
            
            // Get slowest unit speed from form
            const slowestSpeed = this.getSlowestUnitFromForm();
            const travelTime = TWUtils.coords.walkingTime(currentVillage, target, slowestSpeed);
            const launchTime = this.calculateLaunchTime(landingTime, travelTime);
            
            TWUtils.dom.showNotification(
                `Launch at ${launchTime} for ${landingTime} landing (${TWUtils.time.formatDuration(travelTime)} travel)`,
                'info'
            );
        }
        
        // Get the slowest unit speed from the attack form
        getSlowestUnitFromForm() {
            let slowestSpeed = 9; // Spy speed (fastest)
            
            for (const [unit, data] of Object.entries(TWUtils.troops.units)) {
                const input = document.querySelector(`input[name="${unit}"]`);
                if (input && parseInt(input.value) > 0) {
                    if (data.speed > slowestSpeed) {
                        slowestSpeed = data.speed;
                    }
                }
            }
            
            return slowestSpeed;
        }
        
        // Save plans to storage
        savePlans() {
            TWUtils.storage.set('planned_attacks', this.plannedAttacks);
        }
    }
    
    // Initialize when page loads
    let attackPlanner;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            attackPlanner = new AttackPlanner();
            window.attackPlanner = attackPlanner; // Make globally accessible
        });
    } else {
        attackPlanner = new AttackPlanner();
        window.attackPlanner = attackPlanner;
    }
    
})();