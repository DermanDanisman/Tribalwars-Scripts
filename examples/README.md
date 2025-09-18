# Example Configurations

This folder contains example configurations for various scripts in the repository.

## Auto Farmer Configuration

Example configuration for the auto farmer script:

```javascript
const CONFIG = {
    maxFarms: 15,              // Maximum farms per run (default: 10)
    farmDelay: 1500,           // Delay between attacks in ms (default: 2000)
    minDistance: 3,            // Minimum distance to farm (default: 5)
    maxDistance: 25,           // Maximum distance to farm (default: 20)
    troopTemplate: {           // Troops to send per farm
        spear: 0,
        sword: 0,
        axe: 150,              // Increased from 100
        light: 75,             // Increased from 50
        heavy: 0
    },
    onlyBarbarians: true,      // Only attack barbarian villages
    avoidRecent: true,         // Avoid recently farmed villages
    recentThreshold: 3600000   // 1 hour in milliseconds
};
```

## Attack Planner Configuration

Example configuration for attack coordination:

```javascript
const CONFIG = {
    defaultLandingTime: '06:00:00',  // Early morning attacks
    maxPlannedAttacks: 100,          // Increased capacity
    autoCalculateTiming: true,
    attackTypes: {
        fake: { spear: 1 },          // Fake attack template
        clear: { axe: 8000, light: 3000 },  // Clear attack template
        noble: { spear: 1000, sword: 1000, axe: 3000, light: 2000, heavy: 500, nobleman: 1 }
    }
};
```

## Resource Monitor Configuration

Example configuration for resource monitoring:

```javascript
const CONFIG = {
    updateInterval: 30000,     // Update every 30 seconds
    alertThresholds: {
        wood: 15000,           // Lower threshold for active players
        stone: 15000,
        iron: 15000
    },
    trackProduction: true,
    showProjections: true,
    storageAlertThreshold: 90  // Alert at 90% storage capacity
};
```

## Village Templates

### Offensive Village Template
Focus on attack troops and resource production:

```javascript
const OFFENSIVE_VILLAGE = {
    buildings: {
        barracks: 25,
        stable: 20,
        workshop: 15,
        snob: 1,
        smith: 20,
        rally_point: 1
    },
    troopProduction: {
        axe: 50,      // Heavy axe production
        light: 30,    // Light cavalry support
        catapult: 20  // Siege weapons
    }
};
```

### Defensive Village Template
Focus on defense and support:

```javascript
const DEFENSIVE_VILLAGE = {
    buildings: {
        barracks: 25,
        stable: 15,
        wall: 20,
        farm: 30,
        warehouse: 30,
        hide: 10
    },
    troopProduction: {
        spear: 40,    // Anti-cavalry
        sword: 30,    // Infantry defense
        archer: 30    // Ranged defense
    }
};
```

### Farming Village Template
Optimized for resource collection:

```javascript
const FARMING_VILLAGE = {
    buildings: {
        wood: 30,
        stone: 30,
        iron: 30,
        farm: 30,
        warehouse: 30,
        market: 25
    },
    merchants: {
        autoSend: true,
        targetVillage: "500|500",  // Main village coordinates
        keepResources: 5000        // Keep 5k of each resource
    }
};
```

## Farming Route Examples

### Efficient Farming Pattern
Coordinates for systematic farming around a central village:

```javascript
const FARMING_ROUTES = {
    route1: [
        "495|495", "496|495", "497|495", "498|495", "499|495",
        "495|496", "496|496", "497|496", "498|496", "499|496",
        "495|497", "496|497", "497|497", "498|497", "499|497"
    ],
    route2: [
        "500|495", "501|495", "502|495", "503|495", "504|495",
        "500|496", "501|496", "502|496", "503|496", "504|496",
        "500|497", "501|497", "502|497", "503|497", "504|497"
    ]
};
```

## Attack Timing Examples

### Coordinated Attack Schedule
Example for planning multiple village attacks:

```javascript
const ATTACK_SCHEDULE = {
    target: "450|450",
    attacks: [
        { village: "500|500", landingTime: "12:00:00", type: "clear" },
        { village: "501|501", landingTime: "12:00:01", type: "clear" },
        { village: "502|502", landingTime: "12:00:05", type: "noble" },
        { village: "503|503", landingTime: "12:00:10", type: "support" }
    ]
};
```

## Script Combinations

### Full Automation Setup
Configuration for running multiple scripts together:

```javascript
const AUTOMATION_SETUP = {
    farming: {
        enabled: true,
        runInterval: 300000,  // Run every 5 minutes
        nightMode: {
            enabled: true,
            startTime: "23:00",
            endTime: "06:00",
            reducedActivity: true
        }
    },
    resourceMonitor: {
        enabled: true,
        notifications: true,
        autoMerchant: true
    },
    attackPlanner: {
        enabled: true,
        autoCalculate: true,
        reminders: true
    }
};
```

## Safety Settings

### Conservative Configuration
Safer settings for cautious players:

```javascript
const SAFE_CONFIG = {
    delays: {
        minDelay: 5000,       // Minimum 5 second delays
        maxDelay: 15000,      // Maximum 15 second delays
        randomization: true   // Add random delays
    },
    limits: {
        maxActionsPerHour: 100,
        maxFarmsPerDay: 500,
        respectGameLimits: true
    },
    safety: {
        pauseOnError: true,
        logAllActions: true,
        respectMaintenanceMode: true
    }
};
```

## Usage Instructions

1. **Copy relevant configuration**: Choose the configuration that matches your play style
2. **Modify the script**: Open the script in your userscript manager
3. **Replace CONFIG object**: Update the CONFIG object with your chosen settings
4. **Save and test**: Save the script and test in a safe environment
5. **Adjust as needed**: Fine-tune settings based on your experience

## Tips

- **Start conservative**: Use safer settings initially and increase gradually
- **Test thoroughly**: Always test new configurations on less important villages
- **Monitor performance**: Keep an eye on how configurations affect your gameplay
- **Backup settings**: Save working configurations for future use
- **Stay within limits**: Ensure your settings comply with game rules and server limits