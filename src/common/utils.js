/**
 * Common utility functions for Tribal Wars scripts
 * @author DermanDanisman
 * @license MIT
 */

// Tribal Wars utility library
const TWUtils = {
    
    // Game information
    game: {
        // Get current world (server)
        getWorld: function() {
            const hostname = window.location.hostname;
            const match = hostname.match(/^(\w+)\./);
            return match ? match[1] : null;
        },
        
        // Get current player ID
        getPlayerId: function() {
            return window.game_data ? window.game_data.player.id : null;
        },
        
        // Get current village ID
        getVillageId: function() {
            return window.game_data ? window.game_data.village.id : null;
        },
        
        // Get current village coordinates
        getVillageCoords: function() {
            if (!window.game_data || !window.game_data.village) return null;
            return {
                x: parseInt(window.game_data.village.x),
                y: parseInt(window.game_data.village.y)
            };
        }
    },
    
    // Coordinate utilities
    coords: {
        // Parse coordinates from string "XXX|YYY"
        parse: function(coordString) {
            const match = coordString.match(/(\d+)\|(\d+)/);
            return match ? { x: parseInt(match[1]), y: parseInt(match[2]) } : null;
        },
        
        // Format coordinates as string "XXX|YYY"
        format: function(x, y) {
            return `${x}|${y}`;
        },
        
        // Calculate distance between two points
        distance: function(coord1, coord2) {
            const dx = coord1.x - coord2.x;
            const dy = coord1.y - coord2.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        // Calculate walking time between villages
        walkingTime: function(coord1, coord2, speed = 18) {
            const distance = this.distance(coord1, coord2);
            return Math.round(distance * speed); // minutes
        }
    },
    
    // DOM utilities
    dom: {
        // Wait for element to appear
        waitForElement: function(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
                
                const observer = new MutationObserver(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        observer.disconnect();
                        resolve(element);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },
        
        // Create styled button
        createButton: function(text, onClick, styles = {}) {
            const button = document.createElement('button');
            button.textContent = text;
            button.addEventListener('click', onClick);
            
            // Default TW-style button
            const defaultStyles = {
                background: 'linear-gradient(to bottom, #f4e4bc 0%, #e4d09a 100%)',
                border: '1px solid #7d510f',
                borderRadius: '3px',
                color: '#5f4a11',
                cursor: 'pointer',
                fontFamily: 'Verdana, Arial, sans-serif',
                fontSize: '11px',
                padding: '2px 6px'
            };
            
            Object.assign(button.style, defaultStyles, styles);
            return button;
        },
        
        // Create notification
        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.textContent = message;
            
            const colors = {
                info: '#4a90e2',
                success: '#7ed321',
                warning: '#f5a623',
                error: '#d0021b'
            };
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type] || colors.info};
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10001;
                font-family: Verdana, Arial, sans-serif;
                font-size: 12px;
                max-width: 300px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    },
    
    // Storage utilities (localStorage wrapper)
    storage: {
        prefix: 'tw_scripts_',
        
        set: function(key, value) {
            try {
                localStorage.setItem(this.prefix + key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set failed:', e);
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(this.prefix + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get failed:', e);
                return defaultValue;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(this.prefix + key);
                return true;
            } catch (e) {
                console.error('Storage remove failed:', e);
                return false;
            }
        }
    },
    
    // Time utilities
    time: {
        // Format duration in minutes to human readable
        formatDuration: function(minutes) {
            if (minutes < 60) {
                return `${minutes}m`;
            } else if (minutes < 1440) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
            } else {
                const days = Math.floor(minutes / 1440);
                const hours = Math.floor((minutes % 1440) / 60);
                return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
            }
        },
        
        // Parse server time to Date object
        parseServerTime: function(timeString) {
            // Assumes format like "today at 12:34:56" or "Dec 20, 2023 12:34:56"
            const now = new Date();
            if (timeString.includes('today')) {
                const timeMatch = timeString.match(/(\d+):(\d+):(\d+)/);
                if (timeMatch) {
                    now.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), parseInt(timeMatch[3]));
                }
                return now;
            }
            return new Date(timeString);
        }
    },
    
    // Troop utilities
    troops: {
        // Unit data with stats
        units: {
            spear: { attack: 10, defense: 15, defenseCavalry: 45, speed: 18, capacity: 25 },
            sword: { attack: 25, defense: 50, defenseCavalry: 15, speed: 22, capacity: 15 },
            axe: { attack: 40, defense: 10, defenseCavalry: 5, speed: 18, capacity: 10 },
            archer: { attack: 15, defense: 50, defenseCavalry: 40, speed: 18, capacity: 10 },
            spy: { attack: 0, defense: 2, defenseCavalry: 1, speed: 9, capacity: 0 },
            light: { attack: 130, defense: 30, defenseCavalry: 40, speed: 10, capacity: 80 },
            marcher: { attack: 120, defense: 40, defenseCavalry: 50, speed: 10, capacity: 50 },
            heavy: { attack: 150, defense: 200, defenseCavalry: 80, speed: 11, capacity: 50 },
            ram: { attack: 2, defense: 20, defenseCavalry: 80, speed: 30, capacity: 0 },
            catapult: { attack: 100, defense: 20, defenseCavalry: 10, speed: 30, capacity: 0 },
            nobleman: { attack: 30, defense: 100, defenseCavalry: 50, speed: 35, capacity: 0 }
        },
        
        // Calculate total attack power
        calculateAttack: function(troops) {
            let total = 0;
            for (const [unit, count] of Object.entries(troops)) {
                if (this.units[unit] && count > 0) {
                    total += this.units[unit].attack * count;
                }
            }
            return total;
        },
        
        // Calculate carrying capacity
        calculateCapacity: function(troops) {
            let total = 0;
            for (const [unit, count] of Object.entries(troops)) {
                if (this.units[unit] && count > 0) {
                    total += this.units[unit].capacity * count;
                }
            }
            return total;
        },
        
        // Get slowest unit speed
        getSlowestSpeed: function(troops) {
            let slowest = 0;
            for (const [unit, count] of Object.entries(troops)) {
                if (this.units[unit] && count > 0) {
                    const speed = this.units[unit].speed;
                    if (speed > slowest) {
                        slowest = speed;
                    }
                }
            }
            return slowest;
        }
    },
    
    // URL utilities
    url: {
        // Build TW URL with parameters
        build: function(screen, params = {}) {
            const base = `${window.location.origin}${window.location.pathname}?screen=${screen}`;
            const queryParams = new URLSearchParams(params);
            return queryParams.toString() ? `${base}&${queryParams.toString()}` : base;
        },
        
        // Navigate to screen
        go: function(screen, params = {}) {
            window.location.href = this.build(screen, params);
        },
        
        // Get current screen name
        getCurrentScreen: function() {
            const params = new URLSearchParams(window.location.search);
            return params.get('screen') || 'overview';
        }
    },
    
    // Debug utilities
    debug: {
        log: function(message, data = null) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[TWScripts ${timestamp}] ${message}`, data || '');
        },
        
        error: function(message, error = null) {
            const timestamp = new Date().toLocaleTimeString();
            console.error(`[TWScripts ${timestamp}] ERROR: ${message}`, error || '');
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TWUtils;
} else if (typeof window !== 'undefined') {
    window.TWUtils = TWUtils;
}