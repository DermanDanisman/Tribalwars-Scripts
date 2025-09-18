/*
 * Script Name: Barbs Finder (Persistent Tracking Edition)
 * Version: v2.1.0
 * Last Updated: 2025-09-18
 * Original Author: RedAlert (https://twscripts.dev/)
 * Modifier: DermanDanisman (GitHub: https://github.com/DermanDanisman)
 * Description: Find barbarian villages by radius & points, generate sequential scout helper, persistently track already scouted coords, allow re-inclusion, clear history, radius option 5 added.
 * Notes: Modification of an already approved concept (original Barbs Finder). This variant adds localStorage tracking and small UI changes; re-approval recommended.
 *
 * Mandatory License Clause:
 * By uploading a user-generated mod (script) for use with Tribal Wars, the creator grants InnoGames a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, publicly display, modify, and create derivative works of the mod. This license permits InnoGames to incorporate the mod into any aspect of the game and its related services, including promotional and commercial endeavors, without any requirement for compensation or attribution to the uploader. The uploader represents and warrants that they have the legal right to grant this license and that the mod does not infringe upon any third-party rights.
 */

if (typeof DEBUG !== 'boolean') DEBUG = false;

var scriptConfig = {
    scriptData: {
        prefix: 'barbsFinder',
        name: 'Barbs Finder',
        version: 'v2.1.0',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink: 'https://forum.tribalwars.net/index.php?threads/barb-finder-with-filtering.285289/',
    },
    translations: {
        en_DK: {
            'Barbs Finder': 'Barbs Finder',
            'Min Points:': 'Min Points:',
            'Max Points:': 'Max Points:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbs found:',
            'Coordinates:': 'Coordinates:',
            'Error while fetching "village.txt"!': 'Error while fetching "village.txt"!',
            Coords: 'Coords',
            Points: 'Points',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!': 'No barbarian villages found!',
            'Current Village:': 'Current Village:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Help',
            'There was an error!': 'There was an error!',
            'Include previously scouted': 'Include previously scouted',
            'Clear Scouted History': 'Clear Scouted History',
            'Scouted history cleared.': 'Scouted history cleared.',
            'Invalid village coordinate format (expected xxx|yyy).': 'Invalid village coordinate format (expected xxx|yyy).',
            'Please enter valid numeric values.': 'Please enter valid numeric values.',
            'Min Points cannot exceed Max Points.': 'Min Points cannot exceed Max Points.',
            'Already scouted': 'Already scouted',
            'Stored scouted:': 'Stored scouted:',
        },
    },
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

const currentSrc = (document.currentScript && document.currentScript.src) || location.href;

(function startLoader() {
    function proceed() {
        $.getScript(
            'https://twscripts.dev/scripts/twSDK.js?url=' + encodeURIComponent(currentSrc),
            async function () {
                try {
                    await twSDK.init(scriptConfig);
                } catch (e) {
                    alert('Failed to init twSDK');
                    return;
                }

                const scriptInfo = twSDK.scriptInfo();
                const { villages } = await fetchWorldData();
                if (!villages || !Array.isArray(villages)) {
                    UI.ErrorMessage(twSDK.tt('There was an error!'));
                    console.error(scriptInfo + ' Villages data missing.');
                    return;
                }

                const PLAYER_ID = (window.game_data && game_data.player && game_data.player.id.toString()) || '0';
                const WORLD_KEY = (window.game_data && game_data.world) || 'unknown_world';
                const SCOUT_STORE_KEY = `barbsFinder:scouted:${PLAYER_ID}:${WORLD_KEY}`;

                function loadScouted() {
                    try {
                        return JSON.parse(localStorage.getItem(SCOUT_STORE_KEY)) || {};
                    } catch (e) {
                        return {};
                    }
                }
                function saveScouted(o) {
                    localStorage.setItem(SCOUT_STORE_KEY, JSON.stringify(o));
                }
                function markScouted(arr) {
                    if (!Array.isArray(arr)) return;
                    const store = loadScouted();
                    const now = new Date().toISOString();
                    arr.forEach((c) => (store[c] = now));
                    saveScouted(store);
                    updateScoutedCounter();
                }
                function updateScoutedCounter() {
                    const store = loadScouted();
                    $('#scoutedCount').text(Object.keys(store).length);
                }

                buildUI();
                handleFilterBarbs();
                handleResetFilters();
                handleClearScouted();
                updateScoutedCounter();

                function buildUI() {
                    const content = `
                        <div class="ra-grid ra-grid-4">
                            <div class="ra-mb15">
                                <label for="raCurrentVillage" class="ra-label">${twSDK.tt('Current Village:')}</label>
                                <input type="text" id="raCurrentVillage" value="${game_data.village.coord}" class="ra-input">
                            </div>
                            <div class="ra-mb15">
                                <label for="radius_choser" class="ra-label">${twSDK.tt('Radius:')}</label>
                                <select id="radius_choser" class="ra-input">
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="30">30</option>
                                    <option value="40">40</option>
                                    <option value="50" selected>50</option>
                                    <option value="60">60</option>
                                    <option value="70">70</option>
                                    <option value="80">80</option>
                                    <option value="90">90</option>
                                    <option value="100">100</option>
                                    <option value="110">110</option>
                                    <option value="120">120</option>
                                    <option value="130">130</option>
                                    <option value="140">140</option>
                                    <option value="150">150</option>
                                    <option value="999">999</option>
                                </select>
                            </div>
                            <div class="ra-mb15">
                                <label for="minPoints" class="ra-label">${twSDK.tt('Min Points:')}</label>
                                <input type="text" id="minPoints" value="26" class="ra-input">
                            </div>
                            <div class="ra-mb15">
                                <label for="maxPoints" class="ra-label">${twSDK.tt('Max Points:')}</label>
                                <input type="text" id="maxPoints" value="12154" class="ra-input">
                            </div>
                        </div>
                        <div class="ra-mb10">
                            <label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer;">
                                <input type="checkbox" id="includePrevScouted">
                                <span>${twSDK.tt('Include previously scouted')}</span>
                            </label>
                        </div>
                        <div class="ra-mb10">
                            <a href="javascript:void(0);" id="btnFilterBarbs" class="btn btn-confirm-yes">${twSDK.tt('Filter')}</a>
                            <a href="javascript:void(0);" id="btnResetFilters" class="btn btn-confirm-no">${twSDK.tt('Reset')}</a>
                            <a href="javascript:void(0);" id="btnClearScouted" class="btn">${twSDK.tt('Clear Scouted History')}</a>
                        </div>
                        <div class="ra-mb5">
                            <strong>${twSDK.tt('Barbs found:')}</strong> <span id="barbsCount">0</span>
                            &nbsp; | &nbsp;
                            <strong>${twSDK.tt('Stored scouted:')}</strong> <span id="scoutedCount">0</span>
                        </div>
                        <div class="ra-grid ra-grid-2 ra-mb15">
                            <div>
                                <label for="barbCoordsList" class="ra-label">${twSDK.tt('Coordinates:')}</label>
                                <textarea id="barbCoordsList" class="ra-textarea" readonly></textarea>
                            </div>
                            <div>
                                <label for="barbScoutScript" class="ra-label">${twSDK.tt('Sequential Scout Script:')}</label>
                                <textarea id="barbScoutScript" class="ra-textarea" readonly></textarea>
                            </div>
                        </div>
                        <div id="barbariansTable" style="display:none;" class="ra-table-container ra-mt15"></div>
                    `;
                    const customStyle = `
                        .ra-label{display:block;font-weight:600;margin-bottom:5px}
                        .ra-input{padding:5px;width:100%;display:block;line-height:1;font-size:14px}
                        .ra-grid{display:grid;gap:15px}
                        .ra-grid-2{grid-template-columns:1fr 1fr}
                        .ra-grid-4{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
                        .btn-already-sent{padding:3px}
                        .already-sent-command{opacity:.6}
                        .badge-scouted{background:#999;color:#fff;padding:2px 5px;border-radius:4px;font-size:10px;margin-left:4px}
                    `;
                    twSDK.renderBoxWidget(content, scriptConfig.scriptData.prefix, 'ra-barbs-finder', customStyle);
                }

                function handleFilterBarbs() {
                    $('#btnFilterBarbs').on('click', function (e) {
                        e.preventDefault();
                        const currentVillage = $('#raCurrentVillage').val().trim();
                        if (!/^\d{1,3}\|\d{1,3}$/.test(currentVillage)) {
                            UI.InfoMessage(twSDK.tt('Invalid village coordinate format (expected xxx|yyy).'));
                            return;
                        }
                        const minPoints = Number($('#minPoints').val().trim());
                        const maxPoints = Number($('#maxPoints').val().trim());
                        const radius = Number($('#radius_choser').val());
                        if (Number.isNaN(minPoints) || Number.isNaN(maxPoints) || Number.isNaN(radius)) {
                            UI.InfoMessage(twSDK.tt('Please enter valid numeric values.'));
                            return;
                        }
                        if (minPoints > maxPoints) {
                            UI.InfoMessage(twSDK.tt('Min Points cannot exceed Max Points.'));
                            return;
                        }
                        const includePrev = $('#includePrevScouted').is(':checked');
                        const scoutedMap = loadScouted();

                        const barbarians = villages.filter((v) => parseInt(v[4], 10) === 0);
                        const pointsFiltered = barbarians.filter((b) => {
                            const pts = parseInt(b[5], 10);
                            return pts >= minPoints && pts <= maxPoints;
                        });
                        const distFiltered = pointsFiltered
                            .map((b) => {
                                const coord = `${b[2]}|${b[3]}`;
                                const dist = twSDK.calculateDistance(currentVillage, coord);
                                return { raw: b, dist, coord };
                            })
                            .filter((e) => e.dist <= radius);

                        let finalList = distFiltered;
                        if (!includePrev) {
                            finalList = distFiltered.filter((e) => !scoutedMap[e.coord]);
                        }
                        if (!finalList.length) {
                            $('#btnResetFilters').trigger('click');
                            UI.InfoMessage(twSDK.tt('No barbarian villages found!'));
                            return;
                        }

                        finalList.sort((a, b) => a.dist - b.dist);
                        const coordsList = finalList.map((f) => f.coord).join(' ');
                        $('#barbsCount').text(finalList.length);
                        $('#barbCoordsList').text(coordsList);
                        $('#barbScoutScript').val(buildSequentialScoutScript(coordsList));

                        const tableData = finalList.map((f) => [...f.raw, f.dist]);
                        $('#barbariansTable')
                            .show()
                            .html(generateBarbariansTable(tableData, currentVillage, { scoutedMap }));

                        $('.btn-send-attack').on('click', function () {
                            const coord = $(this).data('coord');
                            if (coord) {
                                markScouted([coord]);
                                $(this).closest('tr').addClass('already-sent-command');
                                $(this).addClass('btn-confirm-yes btn-already-sent');
                                $(this).siblings('.badge-scouted').text(twSDK.tt('Already scouted'));
                            }
                        });
                    });
                }

                function handleResetFilters() {
                    $('#btnResetFilters').on('click', function (e) {
                        e.preventDefault();
                        $('#raCurrentVillage').val(game_data.village.coord);
                        $('#minPoints').val(26);
                        $('#maxPoints').val(12154);
                        $('#radius_choser').val('50');
                        $('#includePrevScouted').prop('checked', false);
                        $('#barbsCount').text('0');
                        $('#barbCoordsList').text('');
                        $('#barbScoutScript').val('');
                        $('#barbariansTable').hide().html('');
                    });
                }

                function handleClearScouted() {
                    $('#btnClearScouted').on('click', function (e) {
                        e.preventDefault();
                        if (confirm(twSDK.tt('Clear Scouted History') + '? This cannot be undone.')) {
                            localStorage.removeItem(SCOUT_STORE_KEY);
                            updateScoutedCounter();
                            UI.InfoMessage(twSDK.tt('Scouted history cleared.'));
                        }
                    });
                }

                function buildSequentialScoutScript(coordsList) {
                    const injectedKey = SCOUT_STORE_KEY.replace(/'/g, "\\'");
                    return (
                        "javascript:(function(){var coords='" +
                        coordsList +
                        "';var doc=document;if(window.frames.length>0&&window.main)doc=window.main.document;var url=doc.URL;if(url.indexOf('screen=place')===-1){alert('Use the script in the rally point page!');return;}var arr=coords.split(' ');var idx=0;var m=document.cookie.match('(^|;) ?farm=([^;]*)(;|$)');if(m)idx=parseInt(m[2],10);if(idx>=arr.length){alert('All villages were extracted, now start from the first!');idx=0;}var c=arr[idx].split('|');idx++;var cd=new Date(2030,1,1);document.cookie='farm='+idx+';expires='+cd.toGMTString();if(doc.forms&&doc.forms[0]){doc.forms[0].x.value=c[0];doc.forms[0].y.value=c[1];var tgt=$('#place_target');if(tgt.length){tgt.find('input').val(c[0]+'|'+c[1]);}doc.forms[0].spy.value=1;}(function(){try{var k='" +
                        injectedKey +
                        "';var s=localStorage.getItem(k);var o={};if(s){o=JSON.parse(s);}o[c[0]+'|'+c[1]]=new Date().toISOString();localStorage.setItem(k,JSON.stringify(o));}catch(e){}})();})();"
                    );
                }

                function generateBarbariansTable(barbs, currentVillage, extras) {
                    if (!barbs.length) return '';
                    const scoutedMap = (extras && extras.scoutedMap) || {};
                    const rows = generateTableRows(barbs, scoutedMap);
                    return `
                        <table class="vis overview_table ra-table" width="100%">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>K</th>
                                    <th>${twSDK.tt('Coords')}</th>
                                    <th>${twSDK.tt('Points')}</th>
                                    <th>${twSDK.tt('Dist.')}</th>
                                    <th>${twSDK.tt('Attack')}</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                }

                function generateTableRows(barbs, scoutedMap) {
                    return barbs
                        .map((barb, i) => {
                            const id = barb[0];
                            const x = barb[2];
                            const y = barb[3];
                            const points = barb[5];
                            const distance = barb[7];
                            const coord = `${x}|${y}`;
                            const continent = x.charAt(0) + y.charAt(0);
                            const already = !!scoutedMap[coord];
                            const scoutedBadge = already
                                ? `<span class="badge-scouted">${twSDK.tt('Already scouted')}</span>`
                                : '';
                            return `
                                <tr class="${already ? 'already-sent-command' : ''}">
                                    <td class="ra-tac">${i + 1}</td>
                                    <td class="ra-tac">K${continent}</td>
                                    <td class="ra-tac">
                                        <a href="game.php?screen=info_village&id=${id}" target="_blank" rel="noopener noreferrer">${coord}</a> ${scoutedBadge}
                                    </td>
                                    <td>${twSDK.formatAsNumber(points)}</td>
                                    <td class="ra-tac">${Number(distance).toFixed(2)}</td>
                                    <td class="ra-tac">
                                        <a href="/game.php?screen=place&target=${id}&spy=1"
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           class="btn btn-send-attack ${already ? 'btn-confirm-yes btn-already-sent' : ''}"
                                           data-coord="${coord}">
                                           ${twSDK.tt('Attack')}
                                        </a>
                                    </td>
                                </tr>
                            `;
                        })
                        .join('');
                }

                async function fetchWorldData() {
                    try {
                        const villages = await twSDK.worldDataAPI('village');
                        return { villages };
                    } catch (error) {
                        UI.ErrorMessage(error);
                        console.error(scriptInfo + ' Error:', error);
                        return { villages: [] };
                    }
                }
            }
        );
    }
    if (typeof $ === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        s.onload = proceed;
        document.head.appendChild(s);
    } else {
        proceed();
    }
})();