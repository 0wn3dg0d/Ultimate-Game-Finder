// ==UserScript==
// @name         Ultimate Game Finder
// @namespace    https://www.zoneofgames.ru/
// @version      1.0
// @description  Ищет по выделенному тексту: информацию об игре в Steam, русификаторы на ZOG и цены в магазинах
// @author       0wn3df1x
// @license      MIT
// @icon         https://forum.zoneofgames.ru/favicon.ico
// @icon64       https://forum.zoneofgames.ru/favicon.ico
// @match        *://*/*
// @connect      zoneofgames.ru
// @connect      store.steampowered.com
// @connect      steamcommunity.com
// @connect      api.steampowered.com
// @connect      cdn.akamai.steamstatic.com
// @connect      shared.fastly.steamstatic.com
// @connect      raw.githubusercontent.com
// @connect      gist.githubusercontent.com
// @connect      community.akamai.steamstatic.com
// @connect      community.cloudflare.steamstatic.com
// @connect      community.fastly.steamstatic.com
// @connect      shared.akamai.steamstatic.com
// @connect      shared.cloudflare.steamstatic.com
// @connect      umadb.ro
// @connect      api.github.com
// @connect      api.digiseller.com
// @connect      plati.market
// @connect      digiseller.mycdn.ink
// @connect      steambuy.com
// @connect      steammachine.ru
// @connect      playo.ru
// @connect      steampay.com
// @connect      gabestore.ru
// @connect      static.gabestore.ru
// @connect      gamersbase.store
// @connect      coreplatform.blob.core.windows.net
// @connect      cdn-contentprod.azureedge.net
// @connect      cdn-resize.enaza.games
// @connect      cdn-static.enaza.games
// @connect      www.igromagaz.ru
// @connect      gamesforfarm.com
// @connect      i.imgur.com
// @connect      zaka-zaka.com
// @connect      images.zaka-zaka.com
// @connect      gamazavr.ru
// @connect      gameray.ru
// @connect      shop.buka.ru
// @connect      upload.wikimedia.org
// @connect      keysforgamers.com
// @connect      api4.ggsel.com
// @connect      ggsel.net
// @connect      cdn.ggsel.com
// @connect      explorer.kupikod.com
// @connect      rushbe.ru
// @connect      igm.gg
// @connect      sous-buy.ru
// @connect      cdn.jsdelivr.net
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        #ugf-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.85); z-index: 999999; display: flex;
            justify-content: center; align-items: center; font-family: 'Motiva Sans', 'Arial', sans-serif;
            color: #acb2b8; --steam-blue: #1b2838; --steam-dark-blue: #171a21;
            --steam-light-blue: #66c0f4; --steam-grey: #c7d5e0;
        }
        #ugf-modal * { box-sizing: border-box; text-align: left; }
        .ugf-content {
            background-color: var(--steam-dark-blue); border: 1px solid #000;
            width: 90%; max-width: 1040px; max-height: 95vh; display: flex;
            flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.8);
        }
        .ugf-header {
            background-color: var(--steam-blue); padding: 10px 20px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .ugf-header h2 { margin: 0; color: #fff; font-size: 20px; font-weight: 300; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ugf-close { cursor: pointer; color: #fff; font-size: 28px; font-weight: bold; line-height: 1; }
        .ugf-body { padding: 20px; overflow-y: auto; flex-grow: 1; scrollbar-width: thin; scrollbar-color: var(--steam-light-blue) var(--steam-blue);}
        .ugf-body::-webkit-scrollbar { width: 8px; }
        .ugf-body::-webkit-scrollbar-track { background: var(--steam-blue); }
        .ugf-body::-webkit-scrollbar-thumb { background-color: var(--steam-light-blue); border-radius: 4px; border: 2px solid var(--steam-blue); }
        .ugf-loader { text-align: center; font-size: 18px; padding: 40px; }
        .ugf-search-results-container { display: flex; gap: 20px; }
        .ugf-search-column { flex: 1; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
        .ugf-search-column h3 { color: var(--steam-light-blue); border-bottom: 1px solid var(--steam-light-blue); padding-bottom: 5px; margin-top:0; }
        .ugf-search-item { padding: 8px; margin-bottom: 5px; background: rgba(255,255,255,0.05); cursor: pointer; border-radius: 3px; display: flex; align-items: center; gap: 10px; border-left: 3px solid transparent; transition: all 0.2s ease; }
        .ugf-search-item:hover, .ugf-search-item.selected { background: rgba(102, 192, 244, 0.2); border-left-color: var(--steam-light-blue); }
        .ugf-search-item img { width: 120px; height: 45px; object-fit: cover; border-radius: 2px; }
        .ugf-search-item-info { display: flex; flex-direction: column; overflow: hidden; }
        .ugf-search-item-title { font-size: 14px; color: var(--steam-grey); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ugf-search-item-percent { font-size: 12px; color: #fff; opacity: 0.7; }
        .ugf-footer { padding: 10px 20px; text-align: right; background-color: var(--steam-blue); }
        .ugf-button { padding: 8px 15px; background: var(--steam-light-blue); border: none; color: var(--steam-dark-blue); cursor: pointer; border-radius: 3px; font-weight: bold; }
        .ugf-button:disabled { opacity: 0.5; cursor: not-allowed; }

        .ugf-final-info-layout { display: flex; gap: 20px; }
        .ugf-final-info-left { flex-shrink: 0; width: 320px; }
        .ugf-final-info-left > img { width: 100%; height: auto; margin-bottom: 10px; }
        .ugf-final-info-links a { display: block; padding: 8px; margin-bottom: 5px; background-color: rgba(0,0,0,0.2); color: var(--steam-grey); text-decoration: none; text-align: center; border-radius: 3px; font-size: 14px; }
        .ugf-final-info-links a:hover { background-color: var(--steam-light-blue); color: var(--steam-dark-blue); }
        .ugf-final-info-right { flex-grow: 1; min-width: 0; }
        .ugf-game-meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin: 0 0 15px 0; }
        .ugf-meta-item { background: rgba(0,0,0,0.2); padding: 8px; border-radius: 3px; font-size: 14px; }
        .ugf-meta-item strong { color: var(--steam-light-blue); display: block; margin-bottom: 3px; font-size: 12px; }
        .ugf-game-description { margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.2); border-left: 3px solid var(--steam-light-blue); font-size: 14px; line-height: 1.6; max-height: 200px; overflow-y: auto; }

        #ugf-media-strip-container { margin-top: 15px; position: relative; }
        #ugf-media-strip { display: flex; overflow-x: auto; gap: 5px; padding-bottom: 10px; scrollbar-width: thin; scrollbar-color: var(--steam-light-blue) var(--steam-blue); }
        #ugf-media-strip::-webkit-scrollbar { height: 8px; }
        #ugf-media-strip::-webkit-scrollbar-track { background: var(--steam-blue); }
        #ugf-media-strip::-webkit-scrollbar-thumb { background-color: var(--steam-light-blue); border-radius: 4px; }
        .ugf-media-thumb { cursor: pointer; flex-shrink: 0; width: 116px; height: 65px; border: 2px solid transparent; position: relative; background-color:#000; }
        .ugf-media-thumb:hover { border-color: var(--steam-light-blue); }
        .ugf-media-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ugf-media-thumb .ugf-play-icon-small { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; background: rgba(0,0,0,0.5) url('https://store.akamai.steamstatic.com/public/images/bigpicture/play_button.png') center center no-repeat; background-size: 50%; border-radius: 50%; }

        .ugf-rus-section-container { margin-top: 20px; }
        .ugf-rus-section h4 { color: var(--steam-light-blue); margin-top: 20px; border-bottom: 1px solid #3a3f4b; padding-bottom: 5px; }
        .ugf-rus-list { list-style: none; padding: 0; }
        .ugf-rus-list li { background: rgba(0,0,0,0.2); padding: 10px; margin-bottom: 5px; border-radius: 3px; font-size: 13px; }
        .ugf-rus-list a { color: #fff; text-decoration: none; }
        .ugf-rus-list a:hover { color: var(--steam-light-blue); }
        .ugf-guide-meta { display: block; font-size: 11px; color: #8f98a0; margin-top: 4px; }
        .ugf-guide-keyword { margin-left: 8px; }
        .ugf-review-count { opacity: 0.8; font-size: 0.9em; margin-left: 5px; }
        .ugf-review-positive { color: #66c0f4; }
        .ugf-review-mixed { color: #a38b51; }
        .ugf-review-negative { color: #c44c2c; }
        .ugf-review-none { color: #8f98a0; }

        #ugf-lightbox {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1000000;
            display: none;
            display: grid;
            place-items: center;
        }
        #ugf-lightbox-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            display: grid;
            place-items: center;
        }
        #ugf-lightbox-content img, #ugf-lightbox-content video {
            max-width: 100%;
            max-height: 100%;
            min-width: 0;
            min-height: 0;
            display: block;
            border: 2px solid #fff;
            object-fit: contain;
            background-color: #000;
        }
        .ugf-lightbox-close {
            position: absolute; top: 15px; right: 25px;
            color: #fff; font-size: 40px; font-weight: bold;
            cursor: pointer; z-index: 1000001; text-shadow: 0 0 5px #000;
        }
        .ugf-lightbox-nav {
            cursor: pointer; position: absolute; top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.5);
            color: white; padding: 16px; font-size: 30px;
            user-select: none; z-index: 1000001; border-radius: 5px;
        }
        .ugf-lightbox-prev { left: 15px; }
        .ugf-lightbox-next { right: 15px; }
        .ugf-header-controls { display: flex; align-items: center; gap: 15px; }
        .ugf-header-button { padding: 6px 12px; font-size: 14px; background-color: #4b6f9c; color: #fff; }
        .ugf-header-button:hover { background-color: #67c1f5; color: #1b2838; }

        .ugf-warning-message {
            background-color: rgba(102, 192, 244, 0.2); /* ← ИСПРАВЛЕНА ПРОЗРАЧНОСТЬ */
            border: 1px solid #66c0f4;
            color: #66c0f4;
            padding: 10px 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
        }
    `);

    function getReviewDescription(percent, count) {
        if (count === 0 || percent === null || typeof percent === 'undefined') return 'Нет обзоров';
        if (percent >= 95) return 'Крайне положительные';
        if (percent >= 80) return 'Очень положительные';
        if (percent >= 70) return 'В основном положительные';
        if (percent >= 40) return 'Смешанные';
        if (percent >= 20) return 'В основном отрицательные';
        return 'Крайне отрицательные';
    }

    function getReviewClass(percent, count) {
        if (count === 0 || percent === null || typeof percent === 'undefined') return 'ugf-review-none';
        if (percent >= 70) return 'ugf-review-positive';
        if (percent >= 40) return 'ugf-review-mixed';
        return 'ugf-review-negative';
    }

    function normalizeTitle(title) {
        return title
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\b(the|a|an)\b/gi, '')
            .replace(/[^a-zа-яё0-9 _'\-!]/gi, '')
            .toLowerCase()
            .trim();
    }

    function levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array.from({
            length: m + 1
        }, () => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) {
            for (let j = 0; j <= n; j++) {
                if (i === 0) dp[i][j] = j;
                else if (j === 0) dp[i][j] = i;
                else dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + (str1[i - 1] === str2[j - 1] ? 0 : 1),
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1
                );
            }
        }
        return dp[m][n];
    }

    function calculateSimilarity(str1, str2) {
        const len = Math.max(str1.length, str2.length);
        if (len === 0) return 100;
        const distance = levenshteinDistance(str1, str2);
        return Math.round(((len - distance) / len) * 100);
    }

    function findPossibleMatches(gameName, data) {
        const cleanGameName = normalizeTitle(gameName);
        return data
            .map(item => {
                const cleanItemName = normalizeTitle(item.title);
                const similarity = calculateSimilarity(cleanGameName, cleanItemName);
                const startsWith = cleanItemName.startsWith(cleanGameName);
                return {
                    item: item,
                    percentage: similarity,
                    startsWith: startsWith
                };
            })
            .filter(match => match.percentage > 15 || match.startsWith)
            .sort((a, b) => {
                if (a.startsWith && !b.startsWith) return -1;
                if (!a.startsWith && b.startsWith) return 1;
                return b.percentage - a.percentage;
            })
            .slice(0, 15);
    }

    async function findGamesOnZog(gameName) {
        const isRussian = /[а-яё]/i.test(gameName);
        const alphabetMap = {
            'a': 1,
            'b': 2,
            'c': 3,
            'd': 4,
            'e': 5,
            'f': 6,
            'g': 7,
            'h': 8,
            'i': 9,
            'j': 10,
            'k': 11,
            'l': 12,
            'm': 13,
            'n': 14,
            'o': 15,
            'p': 16,
            'q': 17,
            'r': 18,
            's': 19,
            't': 20,
            'u': 21,
            'v': 22,
            'w': 23,
            'x': 24,
            'y': 25,
            'z': 26,
            '#': 0
        };
        const russianAlphabetMap = {
            'а': 1,
            'б': 2,
            'в': 3,
            'г': 4,
            'д': 5,
            'е': 6,
            'ё': 6,
            'ж': 7,
            'з': 8,
            'и': 9,
            'й': 9,
            'к': 10,
            'л': 11,
            'м': 12,
            'н': 13,
            'о': 14,
            'п': 15,
            'р': 16,
            'с': 17,
            'т': 18,
            'у': 19,
            'ф': 20,
            'х': 21,
            'ц': 22,
            'ч': 23,
            'ш': 24,
            'щ': 25,
            'э': 26,
            'ю': 27,
            'я': 28
        };
        const activeMap = isRussian ? russianAlphabetMap : alphabetMap;
        const articles = ['the', 'a', 'an'];
        const words = gameName.toLowerCase().split(' ');
        const searchLetters = new Set();
        if (!isRussian && articles.includes(words[0]) && words.length > 1) {
            searchLetters.add(words[0][0]);
            if (activeMap[words[1][0]]) searchLetters.add(words[1][0]);
        } else {
            let firstChar = gameName.toLowerCase().charAt(0);
            searchLetters.add(activeMap.hasOwnProperty(firstChar) ? firstChar : '#');
        }
        const allGamesFound = [];
        const uniquePaths = new Set();
        for (const letter of searchLetters) {
            const isNonAlpha = letter === '#';
            const pageNum = activeMap[letter];
            if (pageNum === undefined) continue;
            const baseUrl = isNonAlpha ? 'https://www.zoneofgames.ru/games/eng/' : (isRussian ? 'https://www.zoneofgames.ru/games/rus/' : 'https://www.zoneofgames.ru/games/eng/');
            const url = `${baseUrl}${pageNum}/`;
            try {
                const response = await new Promise((resolve, reject) => GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    onload: resolve,
                    onerror: reject
                }));
                const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                doc.querySelectorAll('td.gameinfoblock a').forEach(link => {
                    const path = link.getAttribute('href');
                    if (path && !uniquePaths.has(path)) {
                        const rawTitle = link.textContent.trim();
                        const articleMatch = rawTitle.match(/,\s+(The|An|A)$/i);
                        let title = articleMatch ? `${articleMatch[1]} ${rawTitle.replace(articleMatch[0], '').trim()}` : rawTitle;
                        allGamesFound.push({
                            title,
                            path
                        });
                        uniquePaths.add(path);
                    }
                });
            } catch (e) {
                console.error(`Ошибка при загрузке страницы '${url}':`, e);
            }
        }
        return allGamesFound;
    }

    async function findGamesOnSteam(term) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://store.steampowered.com/search/suggest?term=${encodeURIComponent(term)}&f=games&cc=US&l=english&realm=1&use_store_query=1&use_search_spellcheck=1`,
                onload: function(response) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, "text/html");
                        const games = Array.from(doc.querySelectorAll('.match')).map(match => ({
                            appId: match.dataset.dsAppid || '0',
                            title: match.querySelector('.match_name')?.textContent || 'Без названия',
                            img: match.querySelector('img')?.src || ''
                        }));
                        resolve(games);
                    } catch (e) {
                        resolve([]);
                    }
                },
                onerror: function(error) {
                    resolve([]);
                }
            });
        });
    }

    async function getZogRusifiers(zogPath) {
        const response = await new Promise((resolve, reject) => GM_xmlhttpRequest({
            method: 'GET',
            url: `https://www.zoneofgames.ru${zogPath}`,
            onload: resolve,
            onerror: reject
        }));
        const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
        const translationsBlock = Array.from(doc.querySelectorAll('td.blockstyle')).find(td => td.textContent.includes('Переводы:'));
        if (!translationsBlock) return [];
        return Array.from(translationsBlock.querySelectorAll('a[href^="/games/"]')).map(a => ({
            title: a.textContent.trim().replace(/(\s)-(\s)/g, ' — '),
            url: `https://www.zoneofgames.ru${a.getAttribute('href')}`
        }));
    }

    async function getSteamData(appid) {
        return new Promise((resolve, reject) => {
            const inputJson = {
                ids: [{
                    appid
                }],
                context: {
                    language: "russian",
                    country_code: "US",
                    steam_realm: 1
                },
                data_request: {
                    include_basic_info: true,
                    include_assets: true,
                    include_release: true,
                    include_platforms: true,
                    include_reviews: true,
                    include_supported_languages: true,
                    include_trailers: true,
                    include_screenshots: true
                }
            };
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=${encodeURIComponent(JSON.stringify(inputJson))}`,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const storeItem = data.response?.store_items?.[0];
                        if (storeItem) {
                            const getReleaseDate = (releaseData) => {
                                const ts = releaseData?.original_release_date || releaseData?.steam_release_date || 0;
                                return ts ? new Date(ts * 1000).toLocaleDateString('ru-RU') : 'Н/Д';
                            };
                            let russianLang = "Отсутствует";
                            const ruLangData = storeItem.supported_languages?.find(l => l.elanguage === 8);
                            if (ruLangData) {
                                const parts = [];
                                if (ruLangData.supported) parts.push("Интерфейс");
                                if (ruLangData.full_audio) parts.push("Озвучка");
                                if (ruLangData.subtitles) parts.push("Субтитры");
                                russianLang = parts.length > 0 ? parts.join(', ') : 'Базовая поддержка';
                            }

                            const highlightVideos = [];
                            const processedTrailerIds = new Set();
                            if (storeItem.trailers?.highlights) {
                                storeItem.trailers.highlights.forEach(t => {
                                    if (processedTrailerIds.has(t.trailer_base_id)) return;
                                    const videoFile = (t.trailer_max || []).find(f => f.type === 'video/webm') ||
                                        (t.trailer_max || []).find(f => f.type === 'video/mp4') ||
                                        (t.trailer_480p || []).find(f => f.type === 'video/webm') ||
                                        (t.trailer_480p || []).find(f => f.type === 'video/mp4');
                                    if (videoFile && t.screenshot_medium) {
                                        highlightVideos.push({
                                            type: 'movie',
                                            thumb_url: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${t.screenshot_medium}`,
                                            full_url: `https://cdn.akamai.steamstatic.com/steam/apps/${videoFile.filename}`,
                                            poster_url: t.screenshot_full ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${t.screenshot_full}` : ''
                                        });
                                        processedTrailerIds.add(t.trailer_base_id);
                                    }
                                });
                            }

                            const screenshots = [];
                            if (storeItem.screenshots?.all_ages_screenshots) {
                                storeItem.screenshots.all_ages_screenshots.forEach(s => {
                                    screenshots.push({
                                        type: 'screenshot',
                                        thumb_url: `https://shared.fastly.steamstatic.com/store_item_assets/${s.filename.replace('.jpg', '.116x65.jpg')}`,
                                        full_url: `https://shared.fastly.steamstatic.com/store_item_assets/${s.filename}`
                                    });
                                });
                            }

                            const media = [];
                            if (highlightVideos.length > 0) {
                                media.push(highlightVideos.shift());
                            }
                            media.push(...screenshots);
                            media.push(...highlightVideos);

                            resolve({
                                name: storeItem.name,
                                header_image: storeItem.assets?.header ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/${storeItem.assets.header}` : '',
                                developers: storeItem.basic_info?.developers?.map(d => d.name).join(', '),
                                publishers: storeItem.basic_info?.publishers?.map(p => p.name).join(', '),
                                release_date: getReleaseDate(storeItem.release),
                                description: storeItem.basic_info?.short_description,
                                reviews_percent: storeItem.reviews?.summary_filtered?.percent_positive,
                                reviews_count: storeItem.reviews?.summary_filtered?.review_count,
                                series: storeItem.basic_info?.franchises?.[0]?.name || 'Нет',
                                early_access: storeItem.is_early_access ? 'Да' : 'Нет',
                                russian: russianLang,
                                media: media,
                            });
                        } else {
                            reject(new Error('Invalid API response from Steam'));
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    async function fetchGuides(appid, query) {
        return new Promise(resolve => {
            const extractGuideId = (url) => {
                try {
                    return parseInt(new URL(url).searchParams.get('id'), 10) || 0;
                } catch {
                    return 0;
                }
            };
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://steamcommunity.com/app/${appid}/guides/?searchText=${encodeURIComponent(query)}&browsefilter=trend&requiredtags[]=-1`,
                onload: function(response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");
                    const guides = Array.from(doc.querySelectorAll('.workshopItemCollection')).map(guide => ({
                        id: extractGuideId(guide.href),
                        title: guide.querySelector('.workshopItemTitle')?.textContent?.trim() || 'Без названия',
                        author: guide.querySelector('.workshopItemAuthorName')?.textContent?.trim() || 'Неизвестный автор',
                        url: guide.href || '#',
                        keyword: query
                    }));
                    resolve(guides);
                },
                onerror: () => resolve([])
            });
        });
    }

    function filterUniqueGuides(mainGuides, secondaryGuides) {
        const mainUrls = new Set(mainGuides.map(g => g.url));
        return secondaryGuides.filter(g => !mainUrls.has(g.url));
    }

    function createModal() {
        const modal = $(`
            <div id="ugf-modal">
                <div class="ugf-content">
                    <div class="ugf-header">
                        <h2>Поиск игры</h2>
                        <div class="ugf-header-controls">
                            <button class="ugf-button ugf-header-button" id="ugf-price-aggregator-btn" style="display: none;">Агрегатор</button>
                            <span class="ugf-close">&times;</span>
                        </div>
                    </div>
                    <div class="ugf-body">
                        <div class="ugf-loader">Загрузка...</div>
                    </div>
                </div>
            </div>`);

        const ugf_handleKeyDown = function(event) {
            if (event.key === 'Enter') {
                const continueBtn = modal.find('#ugf-continueBtn:not(:disabled)');
                if (continueBtn.length > 0) {
                    event.preventDefault();
                    continueBtn.click();
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                modal.find('.ugf-close').click();
            }
        };

        $('body').append(modal);

        modal.find('.ugf-close').on('click', () => {
            $('#ugf-lightbox').remove();
            $(document).off('keydown.ugf-lightbox');
            $(document).off('keydown', ugf_handleKeyDown);
            modal.remove();
        });

        $(document).on('keydown', ugf_handleKeyDown);

        return modal;
    }

    async function main() {
        let ugf_getSelectedSteamData = () => null;

        if (window.self !== window.top) {
            return;
        }

        const selectedText = window.getSelection().toString().trim();
        if (!selectedText) {
            alert('Пожалуйста, выделите название игры.');
            return;
        }

        const modal = createModal();

        modal.find('#ugf-price-aggregator-btn').on('click', function() {
            const selectedSteam = ugf_getSelectedSteamData();
            displayPriceAggregator(selectedText, selectedSteam);
        });

        modal.find('h2').text(`Результаты по запросу: "${selectedText}"`);

        const [zogResults, steamResults] = await Promise.all([
            findGamesOnZog(selectedText).catch(() => []),
            findGamesOnSteam(selectedText).catch(() => [])
        ]);

        const processedZog = findPossibleMatches(selectedText, zogResults);
        const processedSteam = findPossibleMatches(selectedText, steamResults);
        let selectedZog = null,
            selectedSteam = null;

        ugf_getSelectedSteamData = () => selectedSteam;

        modal.find('.ugf-body').html(`
            <div class="ugf-search-results-container">
                <div class="ugf-search-column" id="ugf-zog-column"><h3>Результаты с Zone of Games</h3><div id="ugf-zog-results"></div></div>
                <div class="ugf-search-column" id="ugf-steam-column"><h3>Результаты из Steam</h3><div id="ugf-steam-results"></div></div>
            </div>
            <div class="ugf-footer"><button class="ugf-button" id="ugf-continueBtn"></button></div>`);

        function updateContinueButtonState() {
            const btn = $('#ugf-continueBtn');
            if (selectedZog && selectedSteam) {
                btn.text('Продолжить');
            } else if (selectedZog) {
                btn.text('Продолжить с ZOG');
            } else if (selectedSteam) {
                btn.text('Продолжить со Steam');
            } else {
                btn.text('Продолжить без выбора');
            }
        }

        processedZog.forEach(m => $('#ugf-zog-results').append(`<div class="ugf-search-item" data-path="${m.item.path}"><div class="ugf-search-item-info"><div class="ugf-search-item-title">${m.item.title}</div><span class="ugf-search-item-percent">Совпадение: ${m.percentage}%</span></div></div>`));
        processedSteam.forEach(m => $('#ugf-steam-results').append(`<div class="ugf-search-item" data-appid="${m.item.appId}"><img src="${m.item.img}"/><div class="ugf-search-item-info"><div class="ugf-search-item-title">${m.item.title}</div><span class="ugf-search-item-percent">Совпадение: ${m.percentage}%</span></div></div>`));

        updateContinueButtonState();

        $('#ugf-zog-results .ugf-search-item').on('click', function() {
            selectedZog = {
                path: $(this).data('path')
            };
            $('#ugf-zog-results .ugf-search-item').removeClass('selected');
            $(this).addClass('selected');
            updateContinueButtonState();
        });
        $('#ugf-steam-results .ugf-search-item').on('click', function() {
            selectedSteam = {
                appId: $(this).data('appid'),
                title: $(this).find('.ugf-search-item-title').text()
            };
            $('#ugf-steam-results .ugf-search-item').removeClass('selected');
            $(this).addClass('selected');
            updateContinueButtonState();
        });

        $('#ugf-continueBtn').on('click', async function() {
            $(this).prop('disabled', true).text('Загрузка...');
            modal.find('.ugf-body').html('<div class="ugf-loader">Получение информации...</div>');

            const [zogData, steamData, ruGuides, rusGuides] = await Promise.all([
                selectedZog ? getZogRusifiers(selectedZog.path).catch(() => []) : Promise.resolve([]),
                selectedSteam ? getSteamData(selectedSteam.appId).catch(() => null) : Promise.resolve(null),
                selectedSteam ? fetchGuides(selectedSteam.appId, 'русификатор').catch(() => []) : Promise.resolve([]),
                selectedSteam ? fetchGuides(selectedSteam.appId, 'русский').catch(() => []) : Promise.resolve([])
            ]);

            const steamGuides = [...ruGuides, ...filterUniqueGuides(ruGuides, rusGuides)];
            steamGuides.sort((a, b) => b.id - a.id);

            displayFinalResults(modal, steamData, zogData, steamGuides, selectedZog, selectedSteam);
        });
    }

    function displayFinalResults(modal, steamData, zogData, steamGuides, selZog, selSteam) {
        modal.find('h2').text(steamData ? steamData.name : (selZog ? 'Информация с ZOG' : (selSteam?.title || 'Информация об игре')));
        $('#ugf-price-aggregator-btn').show();

        let html = '';

        if (!steamData) {
            html += `<div class="ugf-warning-message">Внимание, игра не выбрана из списка Steam, агрегатор не сможет показать цену в Steam (Все остальные магазины работают).</div>`;
        }

        if (steamData || selZog) {
            html += '<div class="ugf-final-info-layout">';

            html += '<div class="ugf-final-info-left">';
            if (steamData) {
                html += `<img src="${steamData.header_image}" alt="${steamData.name}">`;
            }
            html += '<div class="ugf-final-info-links">';
            if (selSteam) {
                html += `<a href="https://store.steampowered.com/app/${selSteam.appId}" target="_blank">Страница в Steam</a>`;
            }
            if (selZog) {
                html += `<a href="https://www.zoneofgames.ru${selZog.path}" target="_blank">Страница на ZOG</a>`;
            }
            html += '</div>';
            html += '</div>';

            if (steamData) {
                const reviewDescription = getReviewDescription(steamData.reviews_percent, steamData.reviews_count);
                const reviewClass = getReviewClass(steamData.reviews_percent, steamData.reviews_count);
                const reviewCountText = steamData.reviews_count > 0 ? `(${steamData.reviews_percent}% из ${steamData.reviews_count} обзоров)` : '';

                html += `
                <div class="ugf-final-info-right">
                    <div class="ugf-game-meta-grid">
                        <div class="ugf-meta-item"><strong>Разработчик:</strong> ${steamData.developers || 'Н/Д'}</div>
                        <div class="ugf-meta-item"><strong>Издатель:</strong> ${steamData.publishers || 'Н/Д'}</div>
                        <div class="ugf-meta-item"><strong>Серия:</strong> ${steamData.series}</div>
                        <div class="ugf-meta-item"><strong>Дата выхода:</strong> ${steamData.release_date}</div>
                        <div class="ugf-meta-item"><strong>Русский язык:</strong> ${steamData.russian}</div>
                        <div class="ugf-meta-item"><strong>Отзывы:</strong> <span class="${reviewClass}">${reviewDescription}</span> <span class="ugf-review-count">${reviewCountText}</span></div>
                        <div class="ugf-meta-item"><strong>Ранний доступ:</strong> ${steamData.early_access}</div>
                    </div>
                    <div class="ugf-game-description">${steamData.description || 'Описание отсутствует.'}</div>
                </div>`;
            }
            html += '</div>';

            if (steamData && steamData.media && steamData.media.length > 0) {
                html += `<div id="ugf-media-strip-container"><div id="ugf-media-strip">`;
                steamData.media.forEach((item, index) => {
                    html += `
                        <div class="ugf-media-thumb" data-index="${index}">
                            <img src="${item.thumb_url}">
                            ${item.type === 'movie' ? '<div class="ugf-play-icon-small"></div>' : ''}
                        </div>`;
                });
                html += `</div></div>`;
            }
        }

        html += '<div class="ugf-rus-section-container">';
        if (zogData && zogData.length > 0) {
            html += `<div class="ugf-rus-section"><h4>Русификаторы с Zone of Games</h4><ul class="ugf-rus-list">${zogData.map(r => `<li><a href="${r.url}" target="_blank">${r.title}</a></li>`).join('')}</ul></div>`;
        }
        if (selSteam) {
            html += `<div class="ugf-rus-section"><h4>Руководства в Steam</h4><ul class="ugf-rus-list">${steamGuides.length > 0 ? steamGuides.map(g => `<li><a href="${g.url}" target="_blank">${g.title}</a><span class="ugf-guide-meta">Автор: ${g.author}<span class="ugf-guide-keyword">(слово: ${g.keyword})</span></span></li>`).join('') : '<li>Не найдено</li>'}</ul></div>`;
        }
        html += '</div>';

        modal.find('.ugf-body').html(html);

        if (steamData && steamData.media && steamData.media.length > 0) {
            initLightboxGallery(steamData.media);
        }
    }

    function initLightboxGallery(mediaItems) {
        let currentLightboxIndex = 0;

        function showLightbox(startIndex) {
            currentLightboxIndex = startIndex;
            $('#ugf-lightbox').remove();

            $('body').append(`
                <div id="ugf-lightbox">
                    <span class="ugf-lightbox-close">&times;</span>
                    <span class="ugf-lightbox-nav ugf-lightbox-prev">&#10094;</span>
                    <div id="ugf-lightbox-content"></div>
                    <span class="ugf-lightbox-nav ugf-lightbox-next">&#10095;</span>
                </div>
            `);
            updateLightboxContent();
            $('#ugf-lightbox').fadeIn(200);

            $('#ugf-lightbox .ugf-lightbox-close').on('click', closeLightbox);
            $('#ugf-lightbox .ugf-lightbox-next').on('click', showNextMedia);
            $('#ugf-lightbox .ugf-lightbox-prev').on('click', showPrevMedia);
            $(document).on('keydown.ugf-lightbox', function(e) {
                if (e.key === "ArrowRight") showNextMedia();
                if (e.key === "ArrowLeft") showPrevMedia();
                if (e.key === "Escape") closeLightbox();
            });
        }

        function closeLightbox() {
            $('#ugf-lightbox').fadeOut(200, () => {
                $('#ugf-lightbox').remove();
                $(document).off('keydown.ugf-lightbox');
            });
        }

        function updateLightboxContent() {
            const item = mediaItems[currentLightboxIndex];
            const content = $('#ugf-lightbox-content');
            content.fadeOut(100, function() {
                content.empty();
                if (item.type === 'movie') {
                    content.html(`<video src="${item.full_url}" poster="${item.poster_url}" controls autoplay preload="auto"></video>`);
                } else {
                    content.html(`<img src="${item.full_url}" />`);
                }
                content.fadeIn(100);
            });
        }

        function showNextMedia() {
            currentLightboxIndex = (currentLightboxIndex + 1) % mediaItems.length;
            updateLightboxContent();
        }

        function showPrevMedia() {
            currentLightboxIndex = (currentLightboxIndex - 1 + mediaItems.length) % mediaItems.length;
            updateLightboxContent();
        }

        $('.ugf-media-thumb').on('click', function() {
            const index = $(this).data('index');
            showLightbox(index);
        });
    }

    GM_registerMenuCommand('Найти игру', main);


    function displayPriceAggregator(gameName, selectedSteam = null) {
        if (document.getElementById('findMasterModal')) {
            document.getElementById('findMasterModal').remove();
        }
        fm_main(gameName, selectedSteam);
    }

    const fm_main = (function() {
        'use strict';

        const FM_STORAGE_PREFIX = 'findMaster_v1_';
        const FM_EXCLUSION_STORAGE_KEY = FM_STORAGE_PREFIX + 'exclusions';
        const FM_FILTER_STORAGE_KEY = FM_STORAGE_PREFIX + 'filters';
        const FM_SORT_STORAGE_KEY = FM_STORAGE_PREFIX + 'sort';
        const FM_FILTER_DEBOUNCE_MS = 500;
        const FM_REQUEST_TIMEOUT_MS = 15000;

        let fm_currentResults = [];
        let fm_stores = {};
        let fm_activeRequests = 0;
        let fm_currentSort = GM_getValue(FM_SORT_STORAGE_KEY, {
            field: 'price',
            direction: 'asc'
        });
        let fm_exclusionKeywords = GM_getValue(FM_EXCLUSION_STORAGE_KEY, []);
        let fm_currentFilters = GM_getValue(FM_FILTER_STORAGE_KEY, {
            priceMin: '',
            priceMax: '',
            discountPercentMin: '',
            discountPercentMax: '',
            discountAmountMin: '',
            discountAmountMax: '',
            hasDiscount: false,
            stores: {}
        });
        let fm_filterDebounceTimeout;

        const FM_CURRENCY_MODE_STORAGE_KEY = FM_STORAGE_PREFIX + 'currencyMode';
        let fm_currentCurrencyMode = GM_getValue(FM_CURRENCY_MODE_STORAGE_KEY, 'RUB');
        let fm_exchangeRates = {};

        let fm_modal, fm_closeBtn, fm_searchBtn;
        let fm_resultsContainer, fm_resultsDiv, fm_statusDiv;
        let fm_filtersPanel, fm_exclusionTagsDiv, fm_exclusionTagsListDiv, fm_excludeInput, fm_addExcludeBtn;
        let fm_sortButtonsContainer;
        let fm_filterStoreCheckboxesContainer;
        let fm_gameNameForSearch = '';
        let fm_selectedSteamData = null;

        function fm_parsePrice(priceStr) {
            if (!priceStr) return null;
            const cleaned = String(priceStr).replace(/[^0-9.,]/g, '').replace(',', '.');
            const price = parseFloat(cleaned);
            return isNaN(price) ? null : price;
        }

        function fm_parsePercent(percentStr) {
            if (!percentStr) return null;
            const cleaned = String(percentStr).replace(/[^\d.]/g, '');
            const percent = parseFloat(cleaned);
            return isNaN(percent) ? null : percent;
        }

        async function fm_processItemCurrency(itemData, priceString) {
            if (!priceString || typeof priceString !== 'string') {
                itemData.currency = 'RUB';
                return itemData;
            }

            if (priceString.includes('$') || itemData.currency?.toUpperCase() === 'USD' || itemData.currency?.toUpperCase() === 'CIS') {
                itemData.currency = 'USD';
                const usdToRubRate = fm_exchangeRates?.usd?.rub;
                if (usdToRubRate) {
                    itemData.currentPrice = itemData.currentPrice * usdToRubRate;
                } else {
                    const rubToUsdRate = fm_exchangeRates?.rub?.usd;
                    if (rubToUsdRate) {
                        itemData.currentPrice = itemData.currentPrice / rubToUsdRate;
                    } else {
                        fm_logError(itemData.storeName, 'Нет курсов для конвертации USD в RUB');
                        return null;
                    }
                }
            } else if (priceString.includes('₸') || itemData.currency?.toUpperCase() === 'KZT') {
                itemData.currency = 'KZT';
                const kztToRubRate = fm_exchangeRates?.kzt?.rub;
                if (kztToRubRate) {
                    itemData.currentPrice = itemData.currentPrice * kztToRubRate;
                } else {
                    fm_logError(itemData.storeName, 'Нет курсов для конвертации KZT в RUB');
                    return null;
                }
            } else {
                itemData.currency = 'RUB';
            }
            itemData.currency = 'RUB';
            return itemData;
        }

        function fm_calculateMissingValues(item) {
            const price = item.currentPrice;
            let original = item.originalPrice;
            let percent = item.discountPercent;
            let amount = item.discountAmount;

            if (price === null) return item;

            if (price !== null && percent !== null && original === null) {
                if (percent > 0 && percent < 100) {
                    original = price / (1 - percent / 100);
                } else {
                    original = price;
                }
            }

            if (price !== null && original !== null && percent === null && original > price) {
                percent = ((original - price) / original) * 100;
            } else if (price !== null && original !== null && percent === null && original <= price) {
                percent = 0;
            }

            if (price !== null && amount !== null && original === null) {
                original = price + amount;
            }
            if (price !== null && amount !== null && percent === null && original !== null && original > 0) {
                percent = (amount / original) * 100;
            }

            if (price !== null && original !== null && amount === null && original > price) {
                amount = original - price;
            } else if (price !== null && original !== null && amount === null && original <= price) {
                amount = 0;
            }

            item.originalPrice = original !== null ? parseFloat(original.toFixed(2)) : null;
            item.discountPercent = percent !== null ? parseFloat(percent.toFixed(1)) : null;
            item.discountAmount = amount !== null ? parseFloat(amount.toFixed(2)) : null;

            if (item.discountPercent !== null && item.discountPercent <= 0) {
                item.discountPercent = 0;
                item.discountAmount = 0;
                if (item.originalPrice === null && item.currentPrice !== null) {
                    item.originalPrice = item.currentPrice;
                }
            }
            if (item.originalPrice === null && item.currentPrice !== null) {
                item.originalPrice = item.currentPrice;
                item.discountPercent = 0;
                item.discountAmount = 0;
            }
            return item;
        }

        function fm_logError(storeName, message, error = null) {
            console.error(`[FindMaster][${storeName}] ${message}`, error || '');
        }

        function fm_debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        async function fm_fetchExchangeRates(baseCurrency) {
            const lowerBase = baseCurrency.toLowerCase();
            if (fm_exchangeRates[lowerBase] && Object.keys(fm_exchangeRates[lowerBase]).length > 0) {
                return fm_exchangeRates[lowerBase];
            }

            const apiUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${lowerBase}.json`;
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: apiUrl,
                    responseType: 'json',
                    timeout: FM_REQUEST_TIMEOUT_MS / 2,
                    onload: (response) => {
                        if (response.status >= 200 && response.status < 400 && response.response) {
                            const rates = response.response[lowerBase];
                            if (rates && typeof rates === 'object') {
                                fm_exchangeRates[lowerBase] = rates;
                                resolve(rates);
                            } else {
                                reject(new Error(`Не найдены курсы для ${baseCurrency} в ответе API`));
                            }
                        } else {
                            reject(new Error(`Ошибка API валют: статус ${response.status}`));
                        }
                    },
                    onerror: (error) => reject(new Error('Сетевая ошибка API валют')),
                    ontimeout: () => reject(new Error('Таймаут запроса API валют'))
                });
            });
        }

        function fm_addStyles() {
            GM_addStyle(`
                #findMasterModal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(20, 20, 25, 0.9); backdrop-filter: blur(3px);
                    z-index: 1000001; display: none; color: #c6d4df;
                    font-family: "Motiva Sans", Sans-serif, Arial;
                }
                #findMasterModal * { box-sizing: border-box; }
                #findMasterContainer {
                    padding-top: 0; height: 100%; display: flex; flex-direction: column;
                }
                #findMasterCloseBtn {
                    position: fixed; top: 15px; right: 20px; font-size: 35px;
                    color: #aaa; background: none; border: none; cursor: pointer;
                    line-height: 1; z-index: 10002; padding: 5px;
                    transition: color 0.2s, transform 0.2s;
                }
                #findMasterCloseBtn:hover { color: #fff; transform: scale(1.1); }
                #findMasterHeader {
                    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
                    position: relative; z-index: 1001; background-color: rgba(27, 40, 56, 0.95);
                    backdrop-filter: blur(5px); padding: 10px 15px;
                    border-bottom: 1px solid #3a4f6a; border-radius: 0;
                    margin-left: 0; margin-right: 0;
                    transition: padding-left 0.2s ease-out, padding-right 0.2s ease-out;
                    flex-shrink: 0;
                }
                #findMasterHeaderStatus {
                    text-align: left; font-size: 14px; color: #aaa; padding: 0 10px 0 0;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    display: flex; align-items: center; justify-content: flex-start;
                    min-height: 36px; flex-shrink: 0;
                }
                #findMasterHeaderStatus .spinner { margin-left: 8px; }
                #fmTitleFilterInput {
                    width: 250px; height: 36px; padding: 6px 12px; font-size: 14px;
                    background-color: rgba(10, 10, 15, 0.7); border: 1px solid #3a4f6a;
                    color: #c6d4df; border-radius: 3px; outline: none;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); margin-left: 5px;
                    flex-shrink: 0;
                }
                #fmTitleFilterInput:focus { border-color: #67c1f5; background-color: rgba(0, 0, 0, 0.8); }
                #fmTitleFilterInput::placeholder { color: #777; font-style: italic; font-size: 13px; }
                .fmInsertTitleBtn { padding: 0 10px; font-size: 12px; }
                #findMasterSortButtons { display: flex; gap: 5px; align-items: center; margin-left: 10px; }
                .findMasterBtn {
                    padding: 0 12px; font-size: 13px; color: #c6d4df;
                    border: 1px solid #4b6f9c; border-radius: 3px; cursor: pointer;
                    white-space: nowrap; height: 36px; display: inline-flex;
                    align-items: center; justify-content: center; flex-shrink: 0;
                    background-color: rgba(42, 71, 94, 0.8);
                    transition: background-color 0.2s, border-color 0.2s;
                    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
                }
                .findMasterBtn:hover:not(:disabled) { background-color: rgba(67, 103, 133, 0.9); border-color: #67c1f5; }
                .findMasterBtn:disabled {
                    opacity: 0.6; cursor: default; background-color: rgba(42, 71, 94, 0.5);
                    border-color: #3a4f6a;
                }
                #findMasterSearchGoBtn { background-color: rgba(77, 136, 255, 0.8); border-color: #4D88FF; }
                #findMasterSearchGoBtn:hover:not(:disabled) { background-color: rgba(51, 102, 204, 0.9); }
                .findMasterBtn.sortBtn.active { background-color: rgba(0, 123, 255, 0.8); border-color: #007bff; }
                .findMasterBtn.sortBtn.active:hover { background-color: rgba(0, 86, 179, 0.9); }
                .sortBtn span { margin-left: 5px; font-size: 12px; line-height: 1; }
                #findMasterResetSortBtn { background-color: rgba(119, 119, 119, 0.8); border-color: #777; padding: 0 8px; }
                #findMasterResetSortBtn:hover { background-color: rgba(136, 136, 136, 0.9); }
                #findMasterResetSortBtn svg { width: 14px; height: 14px; fill: currentColor; }
                #findMasterResetSortBtn.active { background-color: rgba(0, 123, 255, 0.8); border-color: #007bff; }
                #findMasterFiltersPanel, #findMasterExclusionTags {
                    position: fixed; top: 60px; max-height: calc(100vh - 80px);
                    overflow-y: auto; z-index: 1000; padding: 15px;
                    scrollbar-width: thin; scrollbar-color: #555 #2a2a30;
                    background-color: transparent; backdrop-filter: none;
                    border-radius: 6px; box-shadow: none; border: none;
                    transition: top 0.2s ease-in-out, max-height 0.2s ease-in-out;
                    visibility: hidden;
                }
                #findMasterFiltersPanel::before, #findMasterExclusionTags::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(23, 26, 33, 0.85); backdrop-filter: blur(4px);
                    border-radius: 6px; z-index: -1;
                }
                #findMasterFiltersPanel::-webkit-scrollbar, #findMasterExclusionTags::-webkit-scrollbar { width: 5px; }
                #findMasterFiltersPanel::-webkit-scrollbar-track, #findMasterExclusionTags::-webkit-scrollbar-track { background: rgba(42, 42, 48, 0.5); border-radius: 3px; }
                #findMasterFiltersPanel::-webkit-scrollbar-thumb, #findMasterExclusionTags::-webkit-scrollbar-thumb { background-color: rgba(85, 85, 85, 0.7); border-radius: 3px; }
                #findMasterFiltersPanel { left: 15px; width: 240px; }
                #findMasterExclusionTags { right: 15px; width: 260px; }
                .fmFilterGroup { margin-bottom: 20px; }
                .fmFilterGroup h4 {
                    font-size: 15px; color: #67c1f5; margin-bottom: 10px; padding-bottom: 5px;
                    display: flex; justify-content: space-between; align-items: center;
                    font-weight: 500; border-bottom: 1px solid #3a4f6a;
                }
                .fmFilterResetBtn {
                    font-size: 12px; color: #8f98a0; background: none; border: none;
                    cursor: pointer; padding: 0 3px; line-height: 1;
                }
                .fmFilterResetBtn:hover { color: #c6d4df; }
                .fmFilterResetBtn svg { width: 14px; height: 14px; vertical-align: middle; fill: currentColor; }
                .fmFilterRangeInputs { display: flex; gap: 8px; align-items: center; }
                .fmFilterRangeInputs input[type="number"] {
                    width: calc(50% - 4px); padding: 8px 10px; font-size: 14px;
                    background-color: rgba(10, 10, 15, 0.7); border: 1px solid #3a4f6a;
                    color: #c6d4df; border-radius: 3px; height: 34px; text-align: center;
                    -moz-appearance: textfield; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
                    outline: none;
                }
                .fmFilterRangeInputs input[type="number"]:focus { border-color: #67c1f5; background-color: rgba(0, 0, 0, 0.8); }
                .fmFilterRangeInputs input[type="number"]::-webkit-outer-spin-button, .fmFilterRangeInputs input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .fmFilterRangeInputs input[type="number"]::placeholder { color: #777; font-size: 12px; text-align: center; }
                .fmFilterCheckbox { margin-bottom: 10px; }
                .fmFilterCheckbox label { display: flex; align-items: center; font-size: 14px; cursor: pointer; color: #c6d4df; }
                .fmFilterCheckbox input[type="checkbox"] { margin-right: 8px; width: 18px; height: 18px; accent-color: #67c1f5; cursor: pointer; flex-shrink: 0; }
                .fmFilterCheckbox.fm-store-error label { background-color: rgba(139, 0, 0, 0.35); border: 1px solid rgba(255, 100, 100, 0.3); border-radius: 3px; padding: 1px 4px; margin: -1px -4px; }
                #fmFilterStoreCheckboxes { max-height: 315px; padding-right: 5px; overflow-y: auto; }
                #fmResetAllFiltersBtn {
                    width: 100%; margin-top: 15px; padding: 10px 15px; height: auto;
                    font-size: 14px; background-color: rgba(108, 117, 125, 0.6);
                    border: 1px solid #5a6268; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
                    color: #c6d4df;
                }
                #fmResetAllFiltersBtn:hover { background-color: rgba(90, 98, 104, 0.8); border-color: #8f98a0; }
                .fmExclusionInputGroup {
                    display: flex; align-items: stretch; border: 1px solid #3a4f6a;
                    border-radius: 4px; background-color: rgba(10, 10, 15, 0.7);
                    overflow: hidden; height: 36px; flex-shrink: 0;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); margin-bottom: 10px;
                }
                #findMasterExcludeInput {
                    padding: 6px 12px; font-size: 14px; background-color: transparent;
                    border: none; color: #c6d4df; outline: none; border-radius: 0;
                    flex-grow: 1; width: auto; height: auto;
                }
                #findMasterExcludeInput:focus { box-shadow: none; }
                #findMasterAddExcludeBtn {
                    display: flex; align-items: center; justify-content: center; width: 36px;
                    background-color: #4b6f9c; border: none; border-left: 1px solid #3a4f6a;
                    cursor: pointer; border-radius: 0; color: #c6d4df; height: auto;
                }
                #findMasterAddExcludeBtn:hover { background-color: #67c1f5; color: #fff; }
                #findMasterAddExcludeBtn svg { width: 16px; height: 16px; fill: currentColor; }
                #findMasterExclusionTagsList { display: flex; flex-direction: row; flex-wrap: wrap; align-content: flex-start; gap: 10px; overflow-y: auto; flex-grow: 1; }
                .fmExclusionTag {
                    display: inline-block; background-color: rgba(75, 111, 156, 0.7); color: #c6d4df;
                    padding: 6px 12px; border-radius: 15px; font-size: 14px; cursor: pointer;
                    transition: background-color 0.2s; border: 1px solid #4b6f9c;
                    white-space: nowrap; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
                }
                .fmExclusionTag:hover { background-color: rgba(220, 53, 69, 0.8); border-color: rgba(255, 80, 90, 0.9); color: #fff; }
                .fmExclusionTag::after { content: ' ×'; font-weight: bold; margin-left: 4px; font-size: 12px; }
                .fmExclusionActions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #3a4f6a; }
                .fmExclusionActionBtn { padding: 0 8px; height: 30px; width: 40px; background-color: rgba(75, 111, 156, 0.7); border-color: #4b6f9c; font-size: 14px; font-weight: bold; line-height: 1; }
                #fmImportModal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.7); z-index: 1000003;
                    display: flex; align-items: center; justify-content: center;
                }
                .fmImportModalContent {
                    background-color: #1b2838; padding: 25px; border-radius: 5px;
                    border: 1px solid #67c1f5; width: 90%; max-width: 500px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                }
                .fmImportModalContent h4 { margin-top: 0; margin-bottom: 15px; color: #67c1f5; font-size: 16px; text-align: center; }
                .fmImportModalContent p { margin-bottom: 10px; font-size: 14px; color: #c6d4df; }
                #fmImportTextarea {
                    width: 100%; padding: 10px; font-size: 14px;
                    background-color: rgba(10, 10, 15, 0.7); border: 1px solid #3a4f6a;
                    color: #c6d4df; border-radius: 3px; margin-bottom: 20px;
                    min-height: 100px; resize: vertical; outline: none;
                }
                #fmImportTextarea:focus { border-color: #67c1f5; }
                .fmImportModalActions { display: flex; justify-content: flex-end; gap: 10px; }
                .fmImportModalActions .findMasterBtn { padding: 8px 20px; height: auto; font-size: 14px; }
                #fmImportAcceptBtn { background-color: rgba(77, 136, 255, 0.8); border-color: #4D88FF; }
                #fmImportAcceptBtn:hover { background-color: rgba(51, 102, 204, 0.9); }
                #fmImportCancelBtn { background-color: rgba(108, 117, 125, 0.6); border: 1px solid #5a6268; }
                #fmImportCancelBtn:hover { background-color: rgba(90, 98, 104, 0.8); border-color: #8f98a0; }
                #findMasterExclusionTagsList { margin-top: 0; }
                #findMasterResultsContainer {
                    position: relative; flex-grow: 1; padding-top: 15px;
                    transition: padding-left 0.2s ease-out, padding-right 0.2s ease-out;
                    overflow-y: auto; scrollbar-color: #4b6f9c #17202d;
                    scrollbar-width: thin;
                }
                #findMasterResultsContainer::-webkit-scrollbar { width: 8px; }
                #findMasterResultsContainer::-webkit-scrollbar-track { background: #17202d; border-radius: 4px; }
                #findMasterResultsContainer::-webkit-scrollbar-thumb { background-color: #4b6f9c; border-radius: 4px; border: 2px solid #17202d; }
                #findMasterResultsContainer::-webkit-scrollbar-thumb:hover { background-color: #67c1f5; }
                #findMasterResultsStatus { display: none !important; }
                #findMasterResults {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
                    gap: 20px; padding-top: 15px; padding-bottom: 20px;
                }
                .findMasterItem.hidden-by-filter { display: none !important; }
                .findMasterItem {
                    background-color: rgba(42, 46, 51, 0.85); backdrop-filter: blur(4px);
                    border-radius: 4px; padding: 15px; display: flex; flex-direction: column;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4); position: relative;
                    color: #c6d4df; font-size: 14px; min-height: 380px;
                    border: 1px solid #333941;
                }
                .findMasterItem:hover {
                    transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
                    background-color: rgba(50, 55, 61, 0.9); border-color: #67c1f5;
                }

        .findMasterItem.steam-page-offer {
            background-color: #202c24;
            border: 1px solid #354f3a;
        }
        .findMasterItem.steam-page-offer:hover {
            background-color: #304035;
            border-color: #4a784d;
        }
        .findMasterItem.steam-page-offer .fm-buyButton {
            background-color: #5c9d4f;
            color: #1a2f1f;
        }
        .findMasterItem.steam-page-offer .fm-buyButton:hover {
            background-color: #6ebf5f;
            color: #0f1a0f;
        }

                .findMasterItem a { text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; }
                .fm-card-image-wrapper {
                    position: relative; width: 100%; aspect-ratio: 16 / 9;
                    margin-bottom: 12px; background-color: #111; border-radius: 3px;
                    overflow: hidden; display: flex; align-items: center;
                    justify-content: center; border: 1px solid #333941;
                }
                .fm-card-image-wrapper img {
                    display: block; max-width: 100%; max-height: 100%;
                    width: auto; height: auto; object-fit: contain; border-radius: 3px;
                }
                .fm-price-container {
                    display: flex; flex-wrap: wrap; align-items: baseline;
                    gap: 5px 10px; margin-bottom: 10px; min-height: 26px;
                }
                .fm-current-price { font-size: 18px; font-weight: 700; color: #66c0f4; line-height: 1; }
                .fm-original-price { font-size: 14px; color: #8f98a0; text-decoration: line-through; line-height: 1; }
                .fm-discount-badge {
                    background-color: #e2004b; color: white; padding: 3px 7px;
                    font-size: 13px; border-radius: 3px; font-weight: 600; line-height: 1;
                }
                .fm-title {
                    font-size: 15px; font-weight: 500; line-height: 1.4;
                    height: 4.2em; overflow: hidden; text-overflow: ellipsis;
                    margin-bottom: 10px; color: #e5e5e5; display: -webkit-box;
                    -webkit-line-clamp: 3; -webkit-box-orient: vertical;
                }
                .fm-store-info-container {
                    margin-top: auto; padding-top: 10px; text-align: right;
                    display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
                }
                .fm-store-name { font-size: 12px; color: #8f98a0; text-align: right; }
                .fmStoreSelectAllControls { margin-top: -5px; margin-bottom: 10px; padding-top: 5px; border-bottom: 1px solid #3a4f6a; text-align: center; }
                .fmStoreSelectAllLink { font-size: 12px; color: #8f98a0; cursor: pointer; text-decoration: none; transition: color 0.2s; padding: 0 5px; }
                .fmStoreSelectAllLink:hover { color: #c6d4df; text-decoration: underline; }
                .fmStoreSelectSeparator { color: #5a6268; margin: 0 3px; font-size: 12px; }
                .fm-seller-link {
                    font-size: 12px; color: #8f98a0; text-align: right; display: block;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    text-decoration: none; transition: color 0.2s;
                }
                .fm-seller-link:not(.no-link):hover { color: #c6d4df; text-decoration: underline; }
                .fm-buyButton {
                    display: block; text-align: center; padding: 10px; margin-top: 12px;
                    background-color: #67c1f5; color: #1b2838; border-radius: 3px;
                    font-size: 14px; font-weight: 600; transition: background-color 0.2s, color 0.2s;
                    margin-top: auto; border: none;
                }
                .fm-buyButton:hover { background-color: #8ad3f7; color: #0e141b; }
                @media (max-width: 1400px) { #findMasterResults { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); } }
                @media (max-width: 1100px) { #findMasterResults { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } #fmTitleFilterInput { max-width: 200px; } }
                @media (max-width: 850px) {
                    #findMasterFiltersPanel, #findMasterExclusionTags { display: none; }
                    #findMasterHeader, #findMasterResultsContainer { padding-left: 15px; padding-right: 15px; }
                    #findMasterResults { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
                    #findMasterHeader { justify-content: space-between; }
                    #fmTitleFilterInput { max-width: 180px; margin-left: 5px; margin-right: 5px; }
                    .fmInsertTitleBtn { display: none; }
                }
                @media (max-width: 600px) {
                    #findMasterContainer { width: 95%; margin: 10px auto; min-height: calc(100vh - 20px); }
                    #findMasterHeader { flex-direction: column; align-items: stretch; padding-bottom: 5px; }
                    #findMasterHeaderStatus { order: -2; min-height: 25px; padding: 5px 0; font-size: 13px; max-width: 100%; text-align: center; justify-content: center; margin-bottom: 5px; }
                    #fmTitleFilterInput { order: -1; max-width: 100%; margin: 0 0 10px 0; }
                    .fmInsertTitleBtn { display: block; order: -1; margin: 0 0 5px 0; width: 100%; }
                    #findMasterSortButtons { width: 100%; justify-content: space-around; margin-top: 5px; margin-left: 0; }
                    .findMasterBtn { flex-grow: 1; font-size: 13px; padding: 8px 5px; height: 36px; }
                    #findMasterResetSortBtn { flex-grow: 0; width: auto; padding: 0 8px; }
                    #findMasterResults { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
                    .findMasterItem { min-height: 320px; font-size: 13px; }
                    .fm-current-price { font-size: 15px; }
                    .fm-title { font-size: 13px; height: 3.9em; -webkit-line-clamp: 3; }
                    .fm-store-name { font-size: 11px; }
                    .fm-buyButton { font-size: 13px; padding: 8px; }
                }
                @keyframes findMasterSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spinner {
                    border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%;
                    border-top-color: #fff; width: 1em; height: 1em;
                    animation: findMasterSpin 1s linear infinite; display: inline-block;
                    vertical-align: middle; margin-left: 5px; line-height: 1;
                }
            `);
        }

        function fm_updateCurrencyToggleButton() {
            const toggleBtn = document.getElementById('fmCurrencyToggleBtn');
            if (!toggleBtn) return;
            if (fm_currentCurrencyMode === 'USD') {
                toggleBtn.textContent = 'RUB';
                toggleBtn.title = 'Переключиться на рубли';
            } else {
                toggleBtn.textContent = 'USD';
                toggleBtn.title = 'Переключиться на доллары США';
            }
        }

        function fm_showUsdSwitchConfirmation() {
            const hideWarning = GM_getValue('findMaster_hideUsdWarning', false);
            if (hideWarning) {
                fm_switchToUsdMode();
                return;
            }

            const dialog = document.createElement('div');
            dialog.id = 'fmUsdConfirmDialog';
            Object.assign(dialog.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#1f2c3a',
                color: '#c6d4df',
                padding: '25px',
                borderRadius: '5px',
                boxShadow: '0 0 20px rgba(0,0,0,0.7)',
                zIndex: '1000005',
                textAlign: 'left',
                border: '1px solid #FFB300',
                maxWidth: '450px'
            });
            dialog.innerHTML = `
                <h4 style="margin-top:0; color:#FFB300;">Переключение в режим USD</h4>
                <p style="margin-bottom:20px; line-height:1.6;">Цены из всех магазинов будут конвертированы и отображены в долларах США (USD). Это может быть полезно для сравнения цен в международном контексте.<br><br>Продолжить?</p>
                <div style="margin-bottom: 20px;"><label><input type="checkbox" id="fmDontShowAgainUsd" style="margin-right:8px;">Больше не показывать</label></div>
                <div style="text-align:right;">
                    <button id="fmConfirmYes" class="findMasterBtn" style="background-color:#FFB300; color:#1b2838; margin-right:10px;">Да</button>
                    <button id="fmConfirmNo" class="findMasterBtn">Отмена</button>
                </div>
            `;
            document.body.appendChild(dialog);

            document.getElementById('fmConfirmYes').onclick = () => {
                if (document.getElementById('fmDontShowAgainUsd').checked) {
                    GM_setValue('findMaster_hideUsdWarning', true);
                }
                fm_switchToUsdMode();
                dialog.remove();
            };
            document.getElementById('fmConfirmNo').onclick = () => dialog.remove();
        }

        function fm_switchToUsdMode() {
            fm_currentCurrencyMode = 'USD';
            GM_setValue(FM_CURRENCY_MODE_STORAGE_KEY, 'USD');
            fm_updateCurrencyToggleButton();
            fm_applySort(fm_currentSort.field, fm_currentSort.direction);
            fm_renderResults();
            fm_updateFilterPlaceholders();
            fm_applyFilters();
            fm_updateSortButtonsState();
        }

        function fm_switchToRubMode() {
            fm_currentCurrencyMode = 'RUB';
            GM_setValue(FM_CURRENCY_MODE_STORAGE_KEY, 'RUB');
            fm_updateCurrencyToggleButton();
            fm_applySort(fm_currentSort.field, fm_currentSort.direction);
            fm_renderResults();
            fm_updateFilterPlaceholders();
            fm_applyFilters();
            fm_updateSortButtonsState();
        }

        function fm_handleCurrencyToggle() {
            if (fm_currentCurrencyMode === 'RUB') {
                fm_showUsdSwitchConfirmation();
            } else {
                fm_switchToRubMode();
            }
        }

        function fm_createModal() {
            const existingModal = document.querySelector('#findMasterModal');
            if (existingModal) existingModal.remove();

            fm_modal = document.createElement('div');
            fm_modal.id = 'findMasterModal';

            const container = document.createElement('div');
            container.id = 'findMasterContainer';

            const header = document.createElement('div');
            header.id = 'findMasterHeader';

            fm_searchBtn = document.createElement('button');
            fm_searchBtn.textContent = 'Обновить %';
            fm_searchBtn.id = 'findMasterSearchGoBtn';
            fm_searchBtn.className = 'findMasterBtn';
            fm_searchBtn.title = 'Запросить цены с магазинов';
            fm_searchBtn.onclick = fm_triggerSearch;
            header.appendChild(fm_searchBtn);

            const headerStatusDiv = document.createElement('div');
            headerStatusDiv.id = 'findMasterHeaderStatus';
            header.appendChild(headerStatusDiv);

            const spacer = document.createElement('div');
            spacer.style.flexGrow = '1';
            header.appendChild(spacer);

            const rightControls = document.createElement('div');
            rightControls.style.display = 'flex';
            rightControls.style.alignItems = 'center';
            rightControls.style.gap = '10px';

            const insertTitleBtn = document.createElement('button');
            insertTitleBtn.id = 'fmInsertTitleBtn';
            insertTitleBtn.className = 'findMasterBtn fmInsertTitleBtn';
            insertTitleBtn.textContent = 'Подставить название >';
            insertTitleBtn.title = 'Подставить название текущей игры в фильтр';
            insertTitleBtn.onclick = () => {
                const filterInput = document.getElementById('fmTitleFilterInput');
                if (fm_gameNameForSearch && filterInput) {
                    filterInput.value = fm_gameNameForSearch;
                    fm_applyFilters();
                    filterInput.focus();
                }
            };
            rightControls.appendChild(insertTitleBtn);

            const titleFilterInput = document.createElement('input');
            titleFilterInput.type = 'text';
            titleFilterInput.id = 'fmTitleFilterInput';
            titleFilterInput.placeholder = 'Фильтр по названию (слова через ;)';
            titleFilterInput.addEventListener('input', fm_debounce(fm_applyFilters, FM_FILTER_DEBOUNCE_MS));
            rightControls.appendChild(titleFilterInput);

            const currencyToggleBtn = document.createElement('button');
            currencyToggleBtn.id = 'fmCurrencyToggleBtn';
            currencyToggleBtn.className = 'findMasterBtn';
            currencyToggleBtn.onclick = fm_handleCurrencyToggle;
            rightControls.appendChild(currencyToggleBtn);

            fm_sortButtonsContainer = document.createElement('div');
            fm_sortButtonsContainer.id = 'findMasterSortButtons';
            rightControls.appendChild(fm_sortButtonsContainer);

            const resetSortBtn = document.createElement('button');
            resetSortBtn.id = 'findMasterResetSortBtn';
            resetSortBtn.className = 'findMasterBtn';
            resetSortBtn.title = 'Сбросить сортировку (По Цене)';
            resetSortBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8Z"/></svg>`;
            resetSortBtn.onclick = () => fm_resetSort(true);
            fm_sortButtonsContainer.appendChild(resetSortBtn);

            fm_createSortButton('price', 'Цена');
            fm_createSortButton('discountPercent', '% Скидки');
            fm_createSortButton('discountAmount', 'Скидка');
            fm_createSortButton('name', 'Название');

            header.appendChild(rightControls);
            container.appendChild(header);

            fm_resultsContainer = document.createElement('div');
            fm_resultsContainer.id = 'findMasterResultsContainer';
            fm_resultsContainer.style.paddingTop = '0';
            fm_resultsDiv = document.createElement('div');
            fm_resultsDiv.id = 'findMasterResults';
            fm_resultsContainer.appendChild(fm_resultsDiv);
            container.appendChild(fm_resultsContainer);
            fm_filtersPanel = document.createElement('div');
            fm_filtersPanel.id = 'findMasterFiltersPanel';
            fm_filtersPanel.innerHTML = `
                <div class="fmFilterGroup"><h4>Цена, ${fm_getCurrencySymbol()} ${fm_createResetButtonHTML('price')}</h4><div class="fmFilterRangeInputs"><input type="number" id="fmFilterPriceMin" placeholder="от" min="0"><input type="number" id="fmFilterPriceMax" placeholder="до" min="0"></div></div>
                <div class="fmFilterGroup"><h4>Скидка, % ${fm_createResetButtonHTML('discountPercent')}</h4><div class="fmFilterRangeInputs"><input type="number" id="fmFilterDiscountPercentMin" placeholder="от" min="0" max="100"><input type="number" id="fmFilterDiscountPercentMax" placeholder="до" min="0" max="100"></div></div>
                <div class="fmFilterGroup"><h4>Скидка, ${fm_getCurrencySymbol()} ${fm_createResetButtonHTML('discountAmount')}</h4><div class="fmFilterRangeInputs"><input type="number" id="fmFilterDiscountAmountMin" placeholder="от" min="0"><input type="number" id="fmFilterDiscountAmountMax" placeholder="до" min="0"></div></div>
                <div class="fmFilterGroup"><h4>Опции ${fm_createResetButtonHTML('options')}</h4><div class="fmFilterCheckbox"><label><input type="checkbox" id="fmFilterHasDiscount"> Только со скидкой</label></div></div>
                <div class="fmFilterGroup">
                    <h4>Магазины ${fm_createResetButtonHTML('stores')}</h4>
                    <div class="fmStoreSelectAllControls">
                        <span class="fmStoreSelectAllLink" id="fmSelectAllStores">Отметить всё</span>
                        <span class="fmStoreSelectSeparator">|</span>
                        <span class="fmStoreSelectAllLink" id="fmDeselectAllStores">Снять всё</span>
                    </div>
                    <div id="fmFilterStoreCheckboxes"></div>
                </div>
                <button id="fmResetAllFiltersBtn" class="findMasterBtn">Сбросить все фильтры</button>
            `;
            fm_modal.appendChild(fm_filtersPanel);
            fm_exclusionTagsDiv = document.createElement('div');
            fm_exclusionTagsDiv.id = 'findMasterExclusionTags';
            const exclusionInputGroup = document.createElement('div');
            exclusionInputGroup.className = 'fmExclusionInputGroup';
            fm_excludeInput = document.createElement('input');
            fm_excludeInput.type = 'text';
            fm_excludeInput.id = 'findMasterExcludeInput';
            fm_excludeInput.placeholder = 'Исключить слово';
            fm_excludeInput.onkeydown = (e) => {
                if (e.key === 'Enter') fm_addExclusionKeyword();
            };
            fm_addExcludeBtn = document.createElement('button');
            fm_addExcludeBtn.id = 'findMasterAddExcludeBtn';
            fm_addExcludeBtn.innerHTML = `<svg viewBox="0 0 20 20"><path fill="currentColor" d="M10 2.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6a.75.75 0 0 1 .75-.75Z" /></svg>`;
            fm_addExcludeBtn.onclick = fm_addExclusionKeyword;
            exclusionInputGroup.appendChild(fm_excludeInput);
            exclusionInputGroup.appendChild(fm_addExcludeBtn);
            fm_exclusionTagsDiv.appendChild(exclusionInputGroup);
            const exclusionActionsDiv = document.createElement('div');
            exclusionActionsDiv.className = 'fmExclusionActions';
            const exportBtn = document.createElement('button');
            exportBtn.id = 'fmExportExclusionsBtn';
            exportBtn.className = 'findMasterBtn fmExclusionActionBtn';
            exportBtn.title = 'Экспорт списка исключений';
            exportBtn.innerHTML = '←'
            exportBtn.onclick = fm_exportExclusions;
            exclusionActionsDiv.appendChild(exportBtn);
            const importBtn = document.createElement('button');
            importBtn.id = 'fmImportExclusionsBtn';
            importBtn.className = 'findMasterBtn fmExclusionActionBtn';
            importBtn.title = 'Импорт списка исключений';
            importBtn.innerHTML = '→';
            importBtn.onclick = fm_showImportModal;
            exclusionActionsDiv.appendChild(importBtn);
            fm_exclusionTagsDiv.appendChild(exclusionActionsDiv);
            fm_exclusionTagsListDiv = document.createElement('div');
            fm_exclusionTagsListDiv.id = 'findMasterExclusionTagsList';
            fm_exclusionTagsDiv.appendChild(fm_exclusionTagsListDiv);
            fm_modal.appendChild(fm_exclusionTagsDiv);
            fm_closeBtn = document.createElement('button');
            fm_closeBtn.id = 'findMasterCloseBtn';
            fm_closeBtn.innerHTML = '&times;';
            fm_closeBtn.onclick = fm_hideModal;
            fm_modal.appendChild(fm_closeBtn);
            fm_modal.appendChild(container);
            document.body.appendChild(fm_modal);

            document.getElementById('fmSelectAllStores')?.addEventListener('click', fm_selectAllStores);
            document.getElementById('fmDeselectAllStores')?.addEventListener('click', fm_deselectAllStores);

            fm_setupFilterEventListeners();
            fm_applyLoadedFiltersToUI();
            fm_renderExclusionTags();
            fm_renderStoreCheckboxes();
            fm_updateSortButtonsState();
            fm_positionSidePanels();

            function handleEsc(event) {
                if (event.key === 'Escape') {
                    const importModal = document.getElementById('fmImportModal');
                    if (importModal) {
                        importModal.remove();
                    } else {
                        fm_hideModal();
                    }
                }
            }
            document.addEventListener('keydown', handleEsc);
            fm_modal._escHandler = handleEsc;
        }

        function fm_exportExclusions() {
            const keywordsString = fm_exclusionKeywords.join(',');
            if (!keywordsString) {
                alert('Список исключений пуст.');
                return;
            }
            try {
                navigator.clipboard.writeText(keywordsString).then(() => {
                    const exportBtn = document.getElementById('fmExportExclusionsBtn');
                    if (exportBtn) {
                        const originalContent = exportBtn.innerHTML;
                        exportBtn.innerHTML = 'Скопировано!';
                        exportBtn.disabled = true;
                        setTimeout(() => {
                            exportBtn.innerHTML = originalContent;
                            exportBtn.disabled = false;
                        }, 1500);
                    }
                }, (err) => {
                    console.error('[FindMaster] Не удалось скопировать в буфер обмена:', err);
                    prompt('Не удалось скопировать автоматически. Скопируйте вручную:', keywordsString);
                });
            } catch (err) {
                console.error('[FindMaster] Ошибка доступа к буферу обмена:', err);
                prompt('Не удалось скопировать автоматически. Скопируйте вручную:', keywordsString);
            }
        }

        function fm_showImportModal() {
            const existingModal = document.getElementById('fmImportModal');
            if (existingModal) existingModal.remove();

            const importModal = document.createElement('div');
            importModal.id = 'fmImportModal';
            importModal.innerHTML = `
                <div class="fmImportModalContent">
                    <h4>Импорт списка исключений</h4>
                    <p>Вставьте список слов, разделенных запятыми:</p>
                    <textarea id="fmImportTextarea" rows="6"></textarea>
                    <div class="fmImportModalActions">
                        <button id="fmImportAcceptBtn" class="findMasterBtn">Принять</button>
                        <button id="fmImportCancelBtn" class="findMasterBtn">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(importModal);

            document.getElementById('fmImportAcceptBtn').onclick = fm_handleImport;
            document.getElementById('fmImportCancelBtn').onclick = () => importModal.remove();
            document.getElementById('fmImportTextarea').focus();
        }

        function fm_handleImport() {
            const textarea = document.getElementById('fmImportTextarea');
            const importModal = document.getElementById('fmImportModal');
            if (!textarea || !importModal) return;

            const text = textarea.value.trim();
            if (text) {
                const importedKeywords = text.split(',')
                    .map(k => k.trim().toLowerCase())
                    .filter(k => k.length > 0);
                fm_exclusionKeywords = [...new Set(importedKeywords)];
                GM_setValue(FM_EXCLUSION_STORAGE_KEY, fm_exclusionKeywords);
                fm_renderExclusionTags();
                fm_applyFilters();
                console.log('[FindMaster] Список исключений импортирован.');
            } else {
                alert("Поле ввода пустое. Импорт не выполнен.");
            }
            importModal.remove();
        }

        function fm_highlightErrorStores() {
            if (!fm_filterStoreCheckboxesContainer) return;

            fm_storeModules.filter(store => store && store.id).forEach(store => {
                const checkboxContainer = fm_filterStoreCheckboxesContainer.querySelector(`#fmStoreFilter-${store.id}`)?.closest('.fmFilterCheckbox');
                if (checkboxContainer) {
                    const storeStatus = fm_stores[store.id]?.status;
                    if (storeStatus === 'error') {
                        checkboxContainer.classList.add('fm-store-error');
                    } else {
                        checkboxContainer.classList.remove('fm-store-error');
                    }
                }
            });
        }

        function fm_selectAllStores() {
            const storeCheckboxes = document.querySelectorAll('#fmFilterStoreCheckboxes input[type="checkbox"]');
            if (!storeCheckboxes || storeCheckboxes.length === 0) return;

            let changed = false;
            storeCheckboxes.forEach(cb => {
                if (!cb.checked) {
                    cb.checked = true;
                    if (cb.dataset.storeId) {
                        fm_currentFilters.stores[cb.dataset.storeId] = true;
                    }
                    changed = true;
                }
            });

            if (changed) {
                GM_setValue(FM_FILTER_STORAGE_KEY, fm_currentFilters);
                fm_applyFilters();
            }
        }

        function fm_deselectAllStores() {
            const storeCheckboxes = document.querySelectorAll('#fmFilterStoreCheckboxes input[type="checkbox"]');
            if (!storeCheckboxes || storeCheckboxes.length === 0) return;

            let changed = false;
            storeCheckboxes.forEach(cb => {
                if (cb.checked) {
                    cb.checked = false;
                    if (cb.dataset.storeId) {
                        fm_currentFilters.stores[cb.dataset.storeId] = false;
                    }
                    changed = true;
                }
            });

            if (changed) {
                GM_setValue(FM_FILTER_STORAGE_KEY, fm_currentFilters);
                fm_applyFilters();
            }
        }

        function fm_positionSidePanels() {
            requestAnimationFrame(() => {
                const header = document.getElementById('findMasterHeader');
                const resultsContainer = document.getElementById('findMasterResultsContainer');
                if (!header || !resultsContainer || !fm_filtersPanel || !fm_exclusionTagsDiv) return;

                const headerRect = header.getBoundingClientRect();
                const headerHeight = header.offsetHeight;
                const topOffset = headerRect.top + headerHeight + 15;
                const bottomOffset = 20;
                const availableHeight = `calc(100vh - ${topOffset}px - ${bottomOffset}px)`;

                fm_filtersPanel.style.position = 'fixed';
                fm_filtersPanel.style.left = `15px`;
                fm_filtersPanel.style.top = `${topOffset}px`;
                fm_filtersPanel.style.maxHeight = availableHeight;
                fm_filtersPanel.style.visibility = 'visible';

                fm_exclusionTagsDiv.style.position = 'fixed';
                fm_exclusionTagsDiv.style.right = `15px`;
                fm_exclusionTagsDiv.style.top = `${topOffset}px`;
                fm_exclusionTagsDiv.style.maxHeight = availableHeight;
                fm_exclusionTagsDiv.style.visibility = 'visible';

                const filterPanelWidth = fm_filtersPanel.offsetWidth;
                const exclusionPanelWidth = fm_exclusionTagsDiv.offsetWidth;
                const contentSidePadding = 25;

                header.style.paddingLeft = `${filterPanelWidth + contentSidePadding}px`;
                header.style.paddingRight = `${exclusionPanelWidth + contentSidePadding}px`;

                resultsContainer.style.paddingLeft = `${filterPanelWidth + contentSidePadding}px`;
                resultsContainer.style.paddingRight = `${exclusionPanelWidth + contentSidePadding}px`;
                resultsContainer.style.paddingTop = `0`;
                resultsContainer.style.paddingBottom = `20px`;
                resultsContainer.style.height = `calc(100% - ${headerHeight}px)`;
                resultsContainer.style.overflowY = 'auto';
                resultsContainer.style.scrollbarColor = '#4b6f9c #17202d';
                resultsContainer.style.scrollbarWidth = 'thin';
            });
        }

        function fm_createSortButton(field, text) {
            const btn = document.createElement('button');
            btn.className = 'findMasterBtn sortBtn';
            btn.dataset.sort = field;
            btn.textContent = text;
            btn.onclick = () => fm_handleSort(field);
            fm_sortButtonsContainer.appendChild(btn);
        }

        function fm_createResetButtonHTML(filterKey) {
            return `<button class="fmFilterResetBtn" title="Сбросить фильтр" data-filter-key="${filterKey}"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg></button>`;
        }

        function fm_renderStoreCheckboxes() {
            fm_filterStoreCheckboxesContainer = document.getElementById('fmFilterStoreCheckboxes');
            if (!fm_filterStoreCheckboxesContainer) return;
            fm_filterStoreCheckboxesContainer.innerHTML = '';

            fm_storeModules.filter(store => store && typeof store.id === 'string').forEach(store => {
                const div = document.createElement('div');
                div.className = 'fmFilterCheckbox';
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `fmStoreFilter-${store.id}`;
                checkbox.dataset.storeId = store.id;
                checkbox.checked = fm_currentFilters.stores[store.id] !== false;
                checkbox.addEventListener('change', fm_handleStoreFilterChange);

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${store.name}`));

                if (store.id === 'igmgg') {
                    const settingsBtn = document.createElement('span');
                    settingsBtn.innerHTML = '⚙️';
                    settingsBtn.className = 'fm-store-settings-btn';
                    settingsBtn.title = 'Настройки подписки IGM.gg';

                    settingsBtn.style.cssText = `
                        margin-left: 8px; cursor: pointer; opacity: 0.6;
                        transition: opacity 0.2s;
                    `;
                    settingsBtn.onmouseover = () => settingsBtn.style.opacity = '1';
                    settingsBtn.onmouseout = () => settingsBtn.style.opacity = '0.6';

                    settingsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fm_showIgmSubscriptionModal();
                    });
                    label.appendChild(settingsBtn);
                } else if (store.id === 'steam') {
                    const settingsBtn = document.createElement('span');
                    settingsBtn.innerHTML = '⚙️';
                    settingsBtn.className = 'fm-store-settings-btn';
                    settingsBtn.title = 'Настройки регионов Steam';

                    settingsBtn.style.cssText = `
                        margin-left: 8px; cursor: pointer; opacity: 0.6;
                        transition: opacity 0.2s;
                    `;
                    settingsBtn.onmouseover = () => settingsBtn.style.opacity = '1';
                    settingsBtn.onmouseout = () => settingsBtn.style.opacity = '0.6';

                    settingsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fm_showSteamSettingsModal();
                    });
                    label.appendChild(settingsBtn);
                } else if (store.id === 'steam') {
                    const settingsBtn = document.createElement('span');
                    settingsBtn.innerHTML = '⚙️';
                    settingsBtn.className = 'fm-store-settings-btn';
                    settingsBtn.title = 'Настройки регионов Steam';

                    settingsBtn.style.cssText = `
                        margin-left: 8px; cursor: pointer; opacity: 0.6;
                        transition: opacity 0.2s;
                    `;
                    settingsBtn.onmouseover = () => settingsBtn.style.opacity = '1';
                    settingsBtn.onmouseout = () => settingsBtn.style.opacity = '0.6';

                    settingsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fm_showSteamSettingsModal();
                    });
                    label.appendChild(settingsBtn);

                    if (!fm_selectedSteamData || !fm_selectedSteamData.appId) {
                        checkbox.disabled = true;
                        div.style.opacity = '0.5';
                        div.title = 'Для поиска в Steam сначала выберите игру на предыдущем шаге.';
                    }
                }


                div.appendChild(label);
                fm_filterStoreCheckboxesContainer.appendChild(div);
            });
        }

        function fm_showIgmSubscriptionModal() {
            const modalId = 'fmIgmSubscriptionModal';
            if (document.getElementById(modalId)) return;

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0,0,0,0.7); z-index: 1000006;
                display: flex; align-items: center; justify-content: center;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background-color: #1f2c3a; color: #c6d4df; padding: 25px;
                border-radius: 5px; border: 1px solid #67c1f5;
                width: 90%; max-width: 450px; text-align: center;
            `;

            const useSubscription = GM_getValue('fm_igmgg_use_subscription_price', false);

            content.innerHTML = `
                <h4 style="margin-top:0; color:#67c1f5;">Настройки IGM.gg</h4>
                <p style="margin-bottom:20px; line-height:1.5;">Включите этот параметр, если у вас есть активная подписка на IGM.gg, чтобы видеть цены с учётом подписочной скидки.</p>
                <label style="display:inline-flex; align-items:center; cursor:pointer; font-size: 15px;">
                    <input type="checkbox" id="fmIgmSubscriptionCheckbox" style="width:18px; height:18px; margin-right:10px;" ${useSubscription ? 'checked' : ''}>
                    Учитывать скидку по подписке
                </label>
                <div style="margin-top:25px;">
                    <button id="fmIgmSubSave" class="findMasterBtn">Сохранить и закрыть</button>
                </div>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            const closeModal = () => {
                const useSub = document.getElementById('fmIgmSubscriptionCheckbox').checked;
                const oldValue = GM_getValue('fm_igmgg_use_subscription_price', false);

                if (useSub !== oldValue) {
                    GM_setValue('fm_igmgg_use_subscription_price', useSub);
                    if (fm_currentResults.some(r => r.storeId === 'igmgg')) {
                        fm_renderResults();
                    }
                }
                modal.remove();
            };

            document.getElementById('fmIgmSubSave').onclick = closeModal;

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        function fm_handleStoreFilterChange(event) {
            const storeId = event.target.dataset.storeId;
            const isChecked = event.target.checked;
            fm_currentFilters.stores[storeId] = isChecked;
            GM_setValue(FM_FILTER_STORAGE_KEY, fm_currentFilters);
            fm_applyFilters();
        }

        async function fm_showModal() {
            if (!fm_modal) fm_createModal();

            try {
                fm_updateStatus('Загрузка курсов валют...', true);
                await fm_fetchExchangeRates('rub');
                fm_updateStatus('Нажмите "Обновить %" для поиска цен...');
            } catch (e) {
                fm_updateStatus('Ошибка загрузки курсов валют!', false);
                console.error("[FindMaster] Не удалось загрузить курсы валют при открытии модального окна:", e);
            }

            if (fm_currentResults.length > 0 || fm_resultsDiv.innerHTML !== '') {
                fm_resultsDiv.innerHTML = '';
                fm_currentResults = [];
            }
            const titleFilterInput = document.getElementById('fmTitleFilterInput');
            if (titleFilterInput) titleFilterInput.value = '';

            document.body.style.overflow = 'hidden';
            fm_modal.style.display = 'block';
            fm_modal.scrollTop = 0;

            fm_renderExclusionTags();
            fm_applyLoadedFiltersToUI();
            fm_updateSortButtonsState();
            fm_renderStoreCheckboxes();
            fm_positionSidePanels();
            fm_updateCurrencyToggleButton();

            fm_applyFilters();
            fm_triggerSearch();
        }

        function fm_hideModal() {
            if (fm_modal) {
                fm_modal.style.display = 'none';
                if (fm_modal._escHandler) {
                    document.removeEventListener('keydown', fm_modal._escHandler);
                    delete fm_modal._escHandler;
                }
                fm_modal.remove();
                fm_modal = null;
            }
            document.body.style.overflow = '';
        }

        function fm_updateStatus(message, isLoading = false) {
            const headerStatusDiv = document.getElementById('findMasterHeaderStatus');
            if (headerStatusDiv) {
                headerStatusDiv.innerHTML = message + (isLoading ? ' <span class="spinner"></span>' : '');
            }
            if (fm_searchBtn) {
                if (isLoading) {
                    fm_searchBtn.disabled = true;
                } else {
                    fm_searchBtn.disabled = false;
                    fm_searchBtn.textContent = 'Обновить %';
                }
            }
        }

        async function fm_triggerSearch() {
            try {
                fm_updateStatus('Загрузка курсов валют...', true);
                await Promise.all([
                    fm_fetchExchangeRates('usd'),
                    fm_fetchExchangeRates('kzt')
                ]);
            } catch (e) {
                fm_logError("Core", "Не удалось загрузить все необходимые курсы валют", e);
            }

            const gameName = fm_gameNameForSearch;
            if (!gameName) {
                fm_updateStatus('Не удалось определить название игры.');
                return;
            }

            const titleFilterInput = document.getElementById('fmTitleFilterInput');
            if (titleFilterInput) titleFilterInput.value = '';

            fm_currentResults = [];
            fm_resultsDiv.innerHTML = '';
            fm_stores = {};
            fm_highlightErrorStores();
            fm_updateStatus(`Поиск "${gameName}"...`, true);
            fm_activeRequests = 0;

            const promises = [];
            let totalStoresToCheck = 0;

            fm_storeModules.filter(m => m && typeof m.fetch === 'function').forEach(storeModule => {
                if (fm_currentFilters.stores[storeModule.id] !== false) {
                    totalStoresToCheck++;
                    fm_activeRequests++;
                    fm_stores[storeModule.id] = {
                        name: storeModule.name,
                        status: 'pending',
                        error: null
                    };
                    promises.push(
                        storeModule.fetch(gameName)
                        .then(results => {
                            fm_stores[storeModule.id].status = 'success';
                            return results;
                        })
                        .catch(error => {
                            fm_stores[storeModule.id].status = 'error';
                            fm_stores[storeModule.id].error = error.message || 'Неизвестная ошибка';
                            fm_logError(storeModule.name, `Ошибка при запросе: ${fm_stores[storeModule.id].error}`, error);
                            return [];
                        })
                        .finally(() => {
                            fm_activeRequests--;
                            fm_updateLoadingProgress(totalStoresToCheck);
                        })
                    );
                } else {
                    fm_stores[storeModule.id] = {
                        name: storeModule.name,
                        status: 'skipped',
                        error: null
                    };
                }
            });

            if (promises.length === 0) {
                fm_updateStatus('Нет активных магазинов для поиска.');
                return;
            }

            const resultsArrays = await Promise.all(promises);
            fm_currentResults = resultsArrays.flat();

            const autoInsertTitle = true;
            if (autoInsertTitle) {
                const filterInput = document.getElementById('fmTitleFilterInput');
                if (gameName && filterInput) {
                    filterInput.value = gameName;
                }
            }

            fm_updateLoadingProgress(totalStoresToCheck);
            if (fm_currentResults.length > 0) {
                fm_applySort(fm_currentSort.field, fm_currentSort.direction);
                fm_renderResults();
                fm_updateFilterPlaceholders();
            } else {
                fm_applyFilters();
            }
        }

        function fm_updateLoadingProgress(totalStores) {
            const completedStores = Object.values(fm_stores).filter(s => s.status !== 'pending').length;
            const skippedStores = Object.values(fm_stores).filter(s => s.status === 'skipped').length;
            const errorStores = Object.values(fm_stores).filter(s => s.status === 'error');
            const searchedCompletedCount = completedStores - skippedStores;

            if (fm_activeRequests > 0) {
                fm_updateStatus(`Загрузка... (${searchedCompletedCount}/${totalStores})`, true);
            } else {
                let statusMessage = '';
                if (fm_currentResults.length > 0) {
                    statusMessage = `Найдено ${fm_currentResults.length} предложений. `;
                } else {
                    statusMessage = `Предложений не найдено. `;
                }
                if (errorStores.length > 0) {
                    statusMessage += `Ошибки в магазинах: ${errorStores.map(s => s.name).join(', ')}.`;
                }
                fm_updateStatus(statusMessage.trim(), false);
                fm_highlightErrorStores();
                fm_applyFilters();
            }
        }

        function fm_handleSort(field) {
            const defaultDirections = {
                price: 'asc',
                discountPercent: 'desc',
                discountAmount: 'desc',
                name: 'asc'
            };
            let newDirection;

            if (fm_currentSort.field === field) {
                newDirection = fm_currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                newDirection = defaultDirections[field] || 'asc';
            }

            fm_currentSort.field = field;
            fm_currentSort.direction = newDirection;
            GM_setValue(FM_SORT_STORAGE_KEY, fm_currentSort);

            fm_applySort(field, newDirection);
            fm_renderResults();
            fm_updateSortButtonsState();
        }

        function fm_applySort(field, direction) {
            const dirMultiplier = direction === 'asc' ? 1 : -1;
            fm_currentResults.sort((a, b) => {
                let valA, valB;
                switch (field) {
                    case 'price':
                        valA = a.currentPrice ?? (direction === 'asc' ? Infinity : -Infinity);
                        valB = b.currentPrice ?? (direction === 'asc' ? Infinity : -Infinity);
                        break;
                    case 'discountPercent':
                        valA = a.discountPercent ?? -1;
                        valB = b.discountPercent ?? -1;
                        break;
                    case 'discountAmount':
                        const amountA = a.discountAmount;
                        const amountB = b.discountAmount;
                        if (amountA === null && amountB === null) valA = valB = 0;
                        else if (amountA === null) valA = direction === 'desc' ? -Infinity : Infinity;
                        else if (amountB === null) valB = direction === 'desc' ? -Infinity : Infinity;
                        else {
                            valA = amountA;
                            valB = amountB;
                        }
                        break;
                    case 'name':
                        valA = a.productName?.toLowerCase() || '';
                        valB = b.productName?.toLowerCase() || '';
                        return valA.localeCompare(valB) * dirMultiplier;
                    default:
                        return 0;
                }
                let comparisonResult = 0;
                if (valA < valB) comparisonResult = -1;
                else if (valA > valB) comparisonResult = 1;
                comparisonResult *= dirMultiplier;
                if (comparisonResult === 0 && field !== 'price') {
                    const priceA = a.currentPrice ?? Infinity;
                    const priceB = b.currentPrice ?? Infinity;
                    if (priceA < priceB) return -1;
                    if (priceA > priceB) return 1;
                }
                if (comparisonResult === 0 && field !== 'name') {
                    return (a.productName?.toLowerCase() || '').localeCompare(b.productName?.toLowerCase() || '');
                }
                return comparisonResult;
            });
        }

        function fm_updateSortButtonsState() {
            if (!fm_sortButtonsContainer) return;
            const buttons = fm_sortButtonsContainer.querySelectorAll('.sortBtn');
            buttons.forEach(btn => {
                const btnField = btn.dataset.sort;
                let baseText = '';
                switch (btnField) {
                    case 'price':
                        baseText = 'Цена';
                        break;
                    case 'discountPercent':
                        baseText = '% Скидки';
                        break;
                    case 'discountAmount':
                        baseText = `Скидка ${fm_getCurrencySymbol()}`;
                        break;
                    case 'name':
                        baseText = 'Название';
                        break;
                }
                if (btnField === fm_currentSort.field) {
                    const arrow = fm_currentSort.direction === 'asc' ? ' ▲' : ' ▼';
                    btn.classList.add('active');
                    btn.textContent = baseText + arrow;
                } else {
                    btn.classList.remove('active');
                    btn.textContent = baseText;
                }
            });
            const resetBtn = fm_sortButtonsContainer.querySelector('#findMasterResetSortBtn');
            if (resetBtn) {
                if (fm_currentSort.field === 'price' && fm_currentSort.direction === 'asc') {
                    resetBtn.classList.add('active');
                } else {
                    resetBtn.classList.remove('active');
                }
            }
        }

        function fm_resetSort(render = true) {
            fm_currentSort = {
                field: 'price',
                direction: 'asc'
            };
            GM_setValue(FM_SORT_STORAGE_KEY, fm_currentSort);
            fm_updateSortButtonsState();
            if (render) {
                fm_applySort(fm_currentSort.field, fm_currentSort.direction);
                fm_renderResults();
            }
        }

        function fm_saveFilter(key, value) {
            fm_currentFilters[key] = value;
            GM_setValue(FM_FILTER_STORAGE_KEY, fm_currentFilters);
        }

        function fm_applyLoadedFiltersToUI() {
            if (!fm_filtersPanel) return;
            document.getElementById('fmFilterPriceMin').value = fm_currentFilters.priceMin || '';
            document.getElementById('fmFilterPriceMax').value = fm_currentFilters.priceMax || '';
            document.getElementById('fmFilterDiscountPercentMin').value = fm_currentFilters.discountPercentMin || '';
            document.getElementById('fmFilterDiscountPercentMax').value = fm_currentFilters.discountPercentMax || '';
            document.getElementById('fmFilterDiscountAmountMin').value = fm_currentFilters.discountAmountMin || '';
            document.getElementById('fmFilterDiscountAmountMax').value = fm_currentFilters.discountAmountMax || '';
            document.getElementById('fmFilterHasDiscount').checked = fm_currentFilters.hasDiscount || false;

            if (fm_filterStoreCheckboxesContainer) {
                fm_filterStoreCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    const storeId = cb.dataset.storeId;
                    cb.checked = fm_currentFilters.stores[storeId] !== false;
                });
            }
            fm_updateFilterPlaceholders();
        }

        function fm_setupFilterEventListeners() {
            if (!fm_filtersPanel) return;
            const debouncedApply = fm_debounce(fm_applyFilters, FM_FILTER_DEBOUNCE_MS);

            ['fmFilterPriceMin', 'fmFilterPriceMax', 'fmFilterDiscountPercentMin', 'fmFilterDiscountPercentMax', 'fmFilterDiscountAmountMin', 'fmFilterDiscountAmountMax'].forEach(id => {
                const input = document.getElementById(id);
                const filterKey = id.replace('fmFilter', '').charAt(0).toLowerCase() + id.replace('fmFilter', '').slice(1);
                if (input) {
                    input.addEventListener('input', (e) => {
                        fm_saveFilter(filterKey, e.target.value);
                        debouncedApply();
                    });
                }
            });

            const hasDiscountCheckbox = document.getElementById('fmFilterHasDiscount');
            if (hasDiscountCheckbox) {
                hasDiscountCheckbox.addEventListener('change', (e) => {
                    fm_saveFilter('hasDiscount', e.target.checked);
                    fm_applyFilters();
                });
            }

            const resetAllBtn = document.getElementById('fmResetAllFiltersBtn');
            if (resetAllBtn) resetAllBtn.addEventListener('click', () => fm_resetAllFilters(true));

            fm_filtersPanel.querySelectorAll('.fmFilterResetBtn').forEach(btn => {
                btn.addEventListener('click', (event) => fm_handleFilterReset(event));
            });
        }

        function fm_handleFilterReset(event) {
            const filterKey = event.currentTarget.dataset.filterKey;
            fm_resetFilterByKey(filterKey, true);
        }

        function fm_resetFilterByKey(key, apply = true) {
            const defaults = {
                priceMin: '',
                priceMax: '',
                discountPercentMin: '',
                discountPercentMax: '',
                discountAmountMin: '',
                discountAmountMax: '',
                hasDiscount: false,
                stores: {}
            };
            switch (key) {
                case 'price':
                    fm_saveFilter('priceMin', defaults.priceMin);
                    if (document.getElementById('fmFilterPriceMin')) document.getElementById('fmFilterPriceMin').value = defaults.priceMin;
                    fm_saveFilter('priceMax', defaults.priceMax);
                    if (document.getElementById('fmFilterPriceMax')) document.getElementById('fmFilterPriceMax').value = defaults.priceMax;
                    break;
                case 'discountPercent':
                    fm_saveFilter('discountPercentMin', defaults.discountPercentMin);
                    if (document.getElementById('fmFilterDiscountPercentMin')) document.getElementById('fmFilterDiscountPercentMin').value = defaults.discountPercentMin;
                    fm_saveFilter('discountPercentMax', defaults.discountPercentMax);
                    if (document.getElementById('fmFilterDiscountPercentMax')) document.getElementById('fmFilterDiscountPercentMax').value = defaults.discountPercentMax;
                    break;
                case 'discountAmount':
                    fm_saveFilter('discountAmountMin', defaults.discountAmountMin);
                    if (document.getElementById('fmFilterDiscountAmountMin')) document.getElementById('fmFilterDiscountAmountMin').value = defaults.discountAmountMin;
                    fm_saveFilter('discountAmountMax', defaults.discountAmountMax);
                    if (document.getElementById('fmFilterDiscountAmountMax')) document.getElementById('fmFilterDiscountAmountMax').value = defaults.discountAmountMax;
                    break;
                case 'options':
                    fm_saveFilter('hasDiscount', defaults.hasDiscount);
                    if (document.getElementById('fmFilterHasDiscount')) document.getElementById('fmFilterHasDiscount').checked = defaults.hasDiscount;
                    break;
                case 'stores':
                    const storeCheckboxes = document.querySelectorAll('#fmFilterStoreCheckboxes input[type="checkbox"]');
                    let updatedStores = {};
                    storeCheckboxes.forEach(cb => {
                        cb.checked = true;
                        updatedStores[cb.dataset.storeId] = true;
                    });
                    fm_currentFilters.stores = updatedStores;
                    GM_setValue(FM_FILTER_STORAGE_KEY, fm_currentFilters);
                    break;
            }
            if (apply) fm_applyFilters();
        }

        function fm_resetAllFilters(apply = true) {
            const filterKeys = ['price', 'discountPercent', 'discountAmount', 'options', 'stores'];
            filterKeys.forEach(key => fm_resetFilterByKey(key, false));
            if (apply) fm_applyFilters();
        }

        function fm_getCurrencySymbol() {
            return fm_currentCurrencyMode === 'USD' ? '$' : '₽';
        }

        function fm_updateFilterPlaceholders() {
            if (!fm_filtersPanel) return;
            const currencySymbol = fm_getCurrencySymbol();
            const resultsToScan = fm_currentResults || [];

            const priceHeader = fm_filtersPanel.querySelector('.fmFilterGroup h4:first-child');
            if (priceHeader) priceHeader.innerHTML = `Цена, ${currencySymbol} ${fm_createResetButtonHTML('price')}`;
            const amountHeader = fm_filtersPanel.querySelector('.fmFilterGroup:nth-child(3) h4');
            if (amountHeader) amountHeader.innerHTML = `Скидка, ${currencySymbol} ${fm_createResetButtonHTML('discountAmount')}`;
            fm_filtersPanel.querySelectorAll('.fmFilterResetBtn').forEach(btn => {
                btn.removeEventListener('click', fm_handleFilterReset);
                btn.addEventListener('click', fm_handleFilterReset);
            });

            if (resultsToScan.length === 0) {
                ['fmFilterPriceMin', 'fmFilterPriceMax', 'fmFilterDiscountPercentMin', 'fmFilterDiscountPercentMax', 'fmFilterDiscountAmountMin', 'fmFilterDiscountAmountMax'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.placeholder = '-';
                });
                return;
            }

            let minPrice = Infinity,
                maxPrice = -Infinity;
            let minDiscountPercent = 101,
                maxDiscountPercent = -1;
            let minDiscountAmount = Infinity,
                maxDiscountAmount = -Infinity;
            const rubToUsdRate = fm_exchangeRates?.rub?.usd || null;
            const isUsdMode = fm_currentCurrencyMode === 'USD';

            resultsToScan.forEach(item => {
                let currentPrice = item.currentPrice;
                let discountAmount = item.discountAmount;
                if (isUsdMode && rubToUsdRate) {
                    if (currentPrice !== null) currentPrice *= rubToUsdRate;
                    if (discountAmount !== null) discountAmount *= rubToUsdRate;
                }
                if (currentPrice !== null) {
                    if (currentPrice < minPrice) minPrice = currentPrice;
                    if (currentPrice > maxPrice) maxPrice = currentPrice;
                }
                if (item.discountPercent !== null) {
                    if (item.discountPercent < minDiscountPercent) minDiscountPercent = item.discountPercent;
                    if (item.discountPercent > maxDiscountPercent) maxDiscountPercent = item.discountPercent;
                }
                if (discountAmount !== null) {
                    if (discountAmount < minDiscountAmount) minDiscountAmount = discountAmount;
                    if (discountAmount > maxDiscountAmount) maxDiscountAmount = discountAmount;
                }
            });

            const setPlaceholder = (id, prefix, value, suffix = '', formatFn = Math.round) => {
                const el = document.getElementById(id);
                if (el) {
                    el.placeholder = (value === Infinity || value === -Infinity || value === 101 || value === -1) ? '-' : `${prefix} ${formatFn(value)}${suffix}`;
                }
            };

            setPlaceholder('fmFilterPriceMin', 'от', minPrice, '', Math.floor);
            setPlaceholder('fmFilterPriceMax', 'до', maxPrice, '', Math.ceil);
            setPlaceholder('fmFilterDiscountPercentMin', 'от', minDiscountPercent, '%', v => Math.max(0, Math.floor(v)));
            setPlaceholder('fmFilterDiscountPercentMax', 'до', maxDiscountPercent, '%', v => Math.min(100, Math.ceil(v)));
            setPlaceholder('fmFilterDiscountAmountMin', 'от', minDiscountAmount, '', Math.floor);
            setPlaceholder('fmFilterDiscountAmountMax', 'до', maxDiscountAmount, '', Math.ceil);
        }

        function fm_applyFilters() {
            if (!fm_resultsDiv || !fm_currentResults) return;
            const titleFilterInput = document.getElementById('fmTitleFilterInput');
            const rawTitleFilterText = titleFilterInput ? titleFilterInput.value.trim() : '';
            const titleFilterTerms = rawTitleFilterText.split(';').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
            const keywords = fm_exclusionKeywords.map(k => k.toLowerCase());
            const pMin = parseFloat(fm_currentFilters.priceMin) || 0;
            const pMax = parseFloat(fm_currentFilters.priceMax) || Infinity;
            const dpMin = parseFloat(fm_currentFilters.discountPercentMin) || 0;
            const dpMax = parseFloat(fm_currentFilters.discountPercentMax) || 100;
            const daMin = parseFloat(fm_currentFilters.discountAmountMin) || 0;
            const daMax = parseFloat(fm_currentFilters.discountAmountMax) || Infinity;
            const hasDiscountFilter = fm_currentFilters.hasDiscount || false;
            const activeStoreFilters = fm_currentFilters.stores;
            let visibleCount = 0;
            const items = fm_resultsDiv.querySelectorAll('.findMasterItem');

            items.forEach(itemElement => {
                const index = Array.from(fm_resultsDiv.children).indexOf(itemElement);
                if (index < 0 || index >= fm_currentResults.length) {
                    itemElement.classList.add('hidden-by-filter');
                    return;
                }
                const itemData = fm_currentResults[index];
                if (!itemData) {
                    itemElement.classList.add('hidden-by-filter');
                    return;
                }
                const titleElement = itemElement.querySelector('.fm-title');
                const itemTitle = titleElement ? titleElement.textContent.trim().toLowerCase() : '';
                let hideByTitleFilter = false;
                if (titleFilterTerms.length > 0 && !titleFilterTerms.some(term => itemTitle.includes(term))) {
                    hideByTitleFilter = true;
                }
                let shouldHide = false;
                if (activeStoreFilters[itemData.storeId] === false) {
                    shouldHide = true;
                }
                if (!shouldHide && keywords.length > 0) {
                    let textToSearch = itemTitle;
                    if (itemData.storeId === 'platimarket' && itemData.sellerName) {
                        textToSearch += ' ' + itemData.sellerName.toLowerCase();
                    }
                    if (keywords.some(keyword => textToSearch.includes(keyword))) {
                        shouldHide = true;
                    }
                }
                if (!shouldHide && itemData.currentPrice !== null) {
                    if (itemData.currentPrice < pMin || itemData.currentPrice > pMax) {
                        shouldHide = true;
                    }
                } else if (!shouldHide && itemData.currentPrice === null && (pMin > 0 || pMax < Infinity)) {
                    if (!(pMin === 0 && pMax === Infinity)) {
                        shouldHide = true;
                    }
                }
                if (!shouldHide) {
                    const discountP = itemData.discountPercent ?? 0;
                    if (discountP < dpMin || discountP > dpMax) {
                        shouldHide = true;
                    }
                }
                if (!shouldHide) {
                    const discountA = itemData.discountAmount ?? 0;
                    if (discountA < daMin || discountA > daMax) {
                        shouldHide = true;
                    }
                }
                if (!shouldHide && hasDiscountFilter) {
                    if (!itemData.discountPercent || itemData.discountPercent <= 0) {
                        shouldHide = true;
                    }
                }
                if (shouldHide || hideByTitleFilter) {
                    itemElement.classList.add('hidden-by-filter');
                } else {
                    itemElement.classList.remove('hidden-by-filter');
                    visibleCount++;
                }
            });

            const totalLoadedCount = fm_currentResults.length;
            const anyFilterActive = pMin > 0 || pMax < Infinity || dpMin > 0 || dpMax < 100 || daMin > 0 || daMax < Infinity || hasDiscountFilter || keywords.length > 0 || Object.values(activeStoreFilters).some(v => v === false) || titleFilterTerms.length > 0;
            const errorStoresCount = Object.values(fm_stores).filter(s => s.status === 'error').length;
            let statusMessage = '';
            if (fm_activeRequests === 0) {
                if (totalLoadedCount > 0) {
                    if (anyFilterActive) {
                        statusMessage = `Показано ${visibleCount} из ${totalLoadedCount} предложений. `;
                    } else {
                        statusMessage = `Найдено ${totalLoadedCount} предложений. `;
                    }
                } else {
                    statusMessage = `Предложений не найдено. `;
                }
                if (errorStoresCount > 0) {
                    statusMessage += `(${errorStoresCount} маг. с ошибками).`;
                }
                fm_updateStatus(statusMessage.trim(), false);
            }
            if (visibleCount === 0 && totalLoadedCount > 0 && anyFilterActive && fm_activeRequests === 0) {
                const statusDivInHeader = document.getElementById('findMasterHeaderStatus');
                if (statusDivInHeader) {
                    let currentStatus = statusDivInHeader.textContent.replace(' Нет товаров, соответствующих фильтрам.', '');
                    statusDivInHeader.textContent = currentStatus.trim() + ' Нет товаров, соответствующих фильтрам.';
                }
            }
        }

        function fm_addExclusionKeyword() {
            const keyword = fm_excludeInput.value.trim().toLowerCase();
            if (keyword && !fm_exclusionKeywords.includes(keyword)) {
                fm_exclusionKeywords.push(keyword);
                GM_setValue(FM_EXCLUSION_STORAGE_KEY, fm_exclusionKeywords);
                fm_excludeInput.value = '';
                fm_renderExclusionTags();
                fm_applyFilters();
            }
        }

        function fm_removeExclusionKeyword(keywordToRemove) {
            fm_exclusionKeywords = fm_exclusionKeywords.filter(k => k !== keywordToRemove);
            GM_setValue(FM_EXCLUSION_STORAGE_KEY, fm_exclusionKeywords);
            fm_renderExclusionTags();
            fm_applyFilters();
        }

        function fm_renderExclusionTags() {
            if (!fm_exclusionTagsListDiv) return;
            fm_exclusionTagsListDiv.innerHTML = '';
            fm_exclusionKeywords.forEach(keyword => {
                const tag = document.createElement('span');
                tag.className = 'fmExclusionTag';
                tag.textContent = keyword;
                tag.title = `Удалить "${keyword}"`;
                tag.onclick = () => fm_removeExclusionKeyword(keyword);
                fm_exclusionTagsListDiv.appendChild(tag);
            });
        }

        function fm_renderResults() {
            if (!fm_resultsDiv) return;
            fm_resultsDiv.innerHTML = '';
            if (fm_currentResults.length === 0 && fm_activeRequests === 0) {
                fm_applyFilters();
                return;
            }
            const fragment = document.createDocumentFragment();
            const isUsdMode = fm_currentCurrencyMode === 'USD';
            const rubToUsdRate = fm_exchangeRates['rub']?.usd || null;
            if (isUsdMode && !rubToUsdRate) {
                fm_updateStatus('Не удалось загрузить курс RUB/USD для конвертации.', false);
            }
            fm_currentResults.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'findMasterItem';
                itemDiv.dataset.store = item.storeId;
                if (item.storeId === 'steam') itemDiv.classList.add('steam-page-offer');
                const link = document.createElement('a');
                link.href = item.productUrl || item.storeUrl || '#';
                link.target = '_blank';
                link.rel = 'noopener noreferrer nofollow';
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'fm-card-image-wrapper';
                const img = document.createElement('img');
                let imgSrc = item.imageUrl;
                if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('//')) {
                    try {
                        const storeBaseUrl = new URL(item.storeUrl || fm_storeModules.find(s => s.id === item.storeId)?.baseUrl || window.location.origin);
                        imgSrc = new URL(imgSrc, storeBaseUrl.origin).href;
                    } catch (e) {
                        imgSrc = 'https://via.placeholder.com/230x108?text=No+Image';
                    }
                } else if (!imgSrc) {
                    imgSrc = 'https://via.placeholder.com/230x108?text=No+Image';
                }
                img.src = imgSrc;
                img.alt = item.productName || 'Изображение товара';
                img.loading = 'lazy';
                img.onerror = function() {
                    this.onerror = null;
                    this.src = 'https://via.placeholder.com/230x108?text=Load+Error';
                    this.style.objectFit = 'contain';
                };
                imageWrapper.appendChild(img);
                link.appendChild(imageWrapper);
                const priceDiv = document.createElement('div');
                priceDiv.className = 'fm-price-container';
                const currentPriceSpan = document.createElement('span');
                currentPriceSpan.className = 'fm-current-price';
                if (isUsdMode) {
                    if (item.currentPrice !== null && rubToUsdRate) {
                        const usdPrice = item.currentPrice * rubToUsdRate;
                        currentPriceSpan.textContent = `$${usdPrice.toFixed(2)}`;
                    } else {
                        currentPriceSpan.textContent = item.currentPrice === null ? 'Нет цены' : 'Нет курса';
                    }
                } else {
                    currentPriceSpan.textContent = item.currentPrice !== null ? `${parseFloat(item.currentPrice).toFixed(0).toLocaleString('ru-RU')} ₽` : 'Нет цены';
                }
                priceDiv.appendChild(currentPriceSpan);
                if (item.discountPercent && item.discountPercent > 0) {
                    const discountBadge = document.createElement('span');
                    discountBadge.className = 'fm-discount-badge';
                    discountBadge.textContent = `-${Math.round(item.discountPercent)}%`;
                    priceDiv.appendChild(discountBadge);
                    if (item.originalPrice !== null) {
                        const originalPriceSpan = document.createElement('span');
                        originalPriceSpan.className = 'fm-original-price';
                        if (isUsdMode && rubToUsdRate) {
                            const usdOriginalPrice = item.originalPrice * rubToUsdRate;
                            originalPriceSpan.textContent = `$${usdOriginalPrice.toFixed(2)}`;
                        } else {
                            originalPriceSpan.textContent = `${parseFloat(item.originalPrice).toFixed(0).toLocaleString('ru-RU')} ₽`;
                        }
                        priceDiv.appendChild(originalPriceSpan);
                    }
                }
                link.appendChild(priceDiv);
                const titleDiv = document.createElement('div');
                titleDiv.className = 'fm-title';
                titleDiv.textContent = item.productName || 'Без названия';
                titleDiv.title = item.productName || 'Без названия';
                link.appendChild(titleDiv);
                const storeInfoContainer = document.createElement('div');
                storeInfoContainer.className = 'fm-store-info-container';
                const storeDiv = document.createElement('div');
                storeDiv.className = 'fm-store-name';
                storeDiv.textContent = item.storeName || 'Неизвестный магазин';
                storeDiv.title = `Магазин: ${item.storeName}`;
                storeInfoContainer.appendChild(storeDiv);
                if ((item.storeId === 'platimarket' || item.storeId === 'ggsel') && item.sellerId && item.sellerName) {
                    const sellerLink = document.createElement('a');
                    sellerLink.className = 'fm-seller-link';
                    sellerLink.textContent = `Продавец: ${item.sellerName}`;
                    sellerLink.title = `Перейти к продавцу: ${item.sellerName}`;
                    try {
                        if (item.storeId === 'platimarket') {
                            const safeSellerName = encodeURIComponent(item.sellerName.replace(/[^a-zA-Z0-9_\-.~]/g, '-')).replace(/%2F/g, '/');
                            sellerLink.href = `https://plati.market/seller/${safeSellerName}/${item.sellerId}`;
                        } else {
                            sellerLink.href = `https://ggsel.net/sellers/${item.sellerId}`;
                        }
                        sellerLink.target = '_blank';
                        sellerLink.rel = 'noopener noreferrer nofollow';
                        sellerLink.onclick = (e) => {
                            e.stopPropagation();
                        };
                        storeInfoContainer.appendChild(sellerLink);
                    } catch (e) {
                        const sellerText = document.createElement('div');
                        sellerText.className = 'fm-seller-link no-link';
                        sellerText.textContent = `Продавец: ${item.sellerName}`;
                        storeInfoContainer.appendChild(sellerText);
                    }
                }
                link.appendChild(storeInfoContainer);
                const buyButtonDiv = document.createElement('div');
                buyButtonDiv.className = 'fm-buyButton';
                buyButtonDiv.textContent = 'Перейти';
                link.appendChild(buyButtonDiv);
                itemDiv.appendChild(link);
                fragment.appendChild(itemDiv);
            });
            fm_resultsDiv.appendChild(fragment);
            fm_applyFilters();
        }

        function fm_showSteamSettingsModal() {
            const modalId = 'fmSteamSettingsModal';
            if (document.getElementById(modalId)) return;

            const STEAM_REGIONS = {
                'RU': {
                    name: 'Российский рубль'
                },
                'KZ': {
                    name: 'Казахстанский тенге'
                },
                'AZ': {
                    name: 'СНГ - Доллар США'
                },
                'US': {
                    name: 'Доллар США'
                },
                'AU': {
                    name: 'Австралийский доллар'
                },
                'BR': {
                    name: 'Бразильский реал'
                },
                'GB': {
                    name: 'Британский фунт'
                },
                'VN': {
                    name: 'Вьетнамский донг'
                },
                'HK': {
                    name: 'Гонконгский доллар'
                },
                'AE': {
                    name: 'Дирхам ОАЭ'
                },
                'EU': {
                    name: 'Евро'
                },
                'IL': {
                    name: 'Израильский новый шекель'
                },
                'IN': {
                    name: 'Индийская рупия'
                },
                'ID': {
                    name: 'Индонезийская рупия'
                },
                'CA': {
                    name: 'Канадский доллар'
                },
                'QA': {
                    name: 'Катарский риал'
                },
                'CN': {
                    name: 'Китайский юань'
                },
                'CO': {
                    name: 'Колумбийское песо'
                },
                'CR': {
                    name: 'Коста-риканский колон'
                },
                'KW': {
                    name: 'Кувейтский динар'
                },
                'AR': {
                    name: 'Лат. Ам. - Доллар США'
                },
                'MY': {
                    name: 'Малазийский ринггит'
                },
                'TR': {
                    name: 'MENA - Доллар США'
                },
                'MX': {
                    name: 'Мексиканское песо'
                },
                'NZ': {
                    name: 'Новозеландский доллар'
                },
                'NO': {
                    name: 'Норвежская крона'
                },
                'PE': {
                    name: 'Перуанский соль'
                },
                'PL': {
                    name: 'Польский злотый'
                },
                'SA': {
                    name: 'Саудовский риал'
                },
                'SG': {
                    name: 'Сингапурский доллар'
                },
                'TW': {
                    name: 'Тайваньский доллар'
                },
                'TH': {
                    name: 'Тайский бат'
                },
                'UA': {
                    name: 'Украинская гривна'
                },
                'UY': {
                    name: 'Уругвайское песо'
                },
                'PH': {
                    name: 'Филиппинское песо'
                },
                'CL': {
                    name: 'Чилийское песо'
                },
                'CH': {
                    name: 'Швейцарский франк'
                },
                'PK': {
                    name: 'Юж. Азия - Доллар США'
                },
                'ZA': {
                    name: 'Южноафриканский рэнд'
                },
                'KR': {
                    name: 'Южнокорейская вона'
                },
                'JP': {
                    name: 'Японская иена'
                }
            };

            const createSelect = (id, label, selectedValue) => {
                let optionsHtml = `<option value="">- Нет -</option>`;
                for (const code in STEAM_REGIONS) {
                    optionsHtml += `<option value="${code}" ${code === selectedValue ? 'selected' : ''}>${STEAM_REGIONS[code].name} (${code})</option>`;
                }
                return `
                    <div style="margin-bottom: 15px;">
                        <label for="${id}" style="display: block; margin-bottom: 5px; color: #acb2b8;">${label}:</label>
                        <select id="${id}" style="width: 100%; padding: 8px; background-color: #334; color: #fff; border: 1px solid #556; border-radius: 3px;">
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            };

            const primaryRegion = GM_getValue(FM_STORAGE_PREFIX + 'steam_primary_region', 'RU');
            const fallback1 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_1', 'KZ');
            const fallback2 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_2', 'AZ');
            const fallback3 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_3', 'US');

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0,0,0,0.7); z-index: 1000006;
                display: flex; align-items: center; justify-content: center;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background-color: #1f2c3a; color: #c6d4df; padding: 25px;
                border-radius: 5px; border: 1px solid #67c1f5;
                width: 90%; max-width: 450px; text-align: left;
            `;

            content.innerHTML = `
                <h4 style="margin-top:0; color:#67c1f5;">Настройки регионов Steam</h4>
                <p style="margin-bottom:20px; line-height:1.5; font-size: 14px;">Выберите основной и запасные регионы для получения цен. Если цена недоступна в основном регионе, скрипт попробует получить её из запасных по порядку.</p>
                ${createSelect('fmSteamPrimaryRegion', 'Основной регион', primaryRegion)}
                ${createSelect('fmSteamFallback1', 'Запасной регион 1', fallback1)}
                ${createSelect('fmSteamFallback2', 'Запасной регион 2', fallback2)}
                ${createSelect('fmSteamFallback3', 'Запасной регион 3', fallback3)}
                <div style="margin-top:25px; text-align: right;">
                    <button id="fmSteamSettingsSave" class="findMasterBtn">Сохранить и закрыть</button>
                </div>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            const closeModal = () => {
                GM_setValue(FM_STORAGE_PREFIX + 'steam_primary_region', document.getElementById('fmSteamPrimaryRegion').value);
                GM_setValue(FM_STORAGE_PREFIX + 'steam_fallback_1', document.getElementById('fmSteamFallback1').value);
                GM_setValue(FM_STORAGE_PREFIX + 'steam_fallback_2', document.getElementById('fmSteamFallback2').value);
                GM_setValue(FM_STORAGE_PREFIX + 'steam_fallback_3', document.getElementById('fmSteamFallback3').value);
                modal.remove();
            };

            document.getElementById('fmSteamSettingsSave').onclick = closeModal;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // --- Модули магазинов ---
        const fm_storeModules = [

            { // --- Модуль Steam ---
                id: 'steam',
                name: 'Steam',
                baseUrl: 'https://store.steampowered.com',
                isEnabled: true,
                fetch: async function(query) {
                    const storeModule = this;
                    if (!fm_selectedSteamData || !fm_selectedSteamData.appId) {
                        fm_logError(storeModule.name, 'AppID не найден. Поиск в Steam пропущен.');
                        return [];
                    }

                    const primaryRegion = GM_getValue(FM_STORAGE_PREFIX + 'steam_primary_region', 'RU');
                    const fallback1 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_1', 'KZ');
                    const fallback2 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_2', 'AZ');
                    const fallback3 = GM_getValue(FM_STORAGE_PREFIX + 'steam_fallback_3', 'US');

                    const regionsToTry = [...new Set([primaryRegion, fallback1, fallback2, fallback3].filter(Boolean))];
                    let priceData = null;

                    for (const regionCode of regionsToTry) {
                        const inputJson = {
                            ids: [{
                                appid: parseInt(fm_selectedSteamData.appId, 10)
                            }],
                            context: {
                                language: "russian",
                                country_code: regionCode,
                                steam_realm: 1
                            },
                            data_request: {
                                include_basic_info: true,
                                include_assets: true,
                                include_all_purchase_options: true
                            }
                        };
                        const url = `https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=${encodeURIComponent(JSON.stringify(inputJson))}`;

                        try {
                            const response = await new Promise((resolve, reject) => {
                                GM_xmlhttpRequest({
                                    method: 'GET',
                                    url,
                                    responseType: 'json',
                                    timeout: FM_REQUEST_TIMEOUT_MS,
                                    onload: resolve,
                                    onerror: reject,
                                    ontimeout: reject
                                });
                            });

                            const storeItem = response.response?.response?.store_items?.[0];
                            if (storeItem && storeItem.success === 1 && storeItem.visible && storeItem.purchase_options && storeItem.purchase_options.length > 0) {
                                priceData = {
                                    storeItem,
                                    region: regionCode
                                };
                                break;
                            } else {
                                fm_logError(storeModule.name, `Нет данных о цене для региона ${regionCode}. Ответ:`, storeItem);
                            }
                        } catch (e) {
                            fm_logError(storeModule.name, `Ошибка запроса для региона ${regionCode}`, e);
                        }
                    }

                    if (!priceData) {
                        fm_logError(storeModule.name, 'Не удалось получить цены ни для одного из регионов.');
                        return [];
                    }

                    return storeModule.parseApiResponse(priceData.storeItem, priceData.region, storeModule);
                },
                parseApiResponse: async function(storeItem, region, storeModule) {
                    const results = [];
                    const countryToCurrency = {
                        'RU': 'RUB',
                        'KZ': 'KZT',
                        'UA': 'UAH',
                        'GB': 'GBP',
                        'EU': 'EUR',
                        'JP': 'JPY',
                        'CN': 'CNY',
                        'IN': 'INR',
                        'BR': 'BRL',
                        'CA': 'CAD',
                        'AU': 'AUD',
                        'CH': 'CHF',
                        'NO': 'NOK',
                        'PL': 'PLN',
                        'NZ': 'NZD',
                        'MX': 'MXN',
                        'SG': 'SGD',
                        'HK': 'HKD',
                        'KR': 'KRW',
                        'ZA': 'ZAR',
                        'AE': 'AED',
                        'CL': 'CLP',
                        'CO': 'COP',
                        'CR': 'CRC',
                        'PE': 'PEN',
                        'UY': 'UYU',
                        'VN': 'VND',
                        'PH': 'PHP',
                        'MY': 'MYR',
                        'ID': 'IDR',
                        'TH': 'THB',
                        'SA': 'SAR',
                        'QA': 'QAR',
                        'KW': 'KWD',
                        'IL': 'ILS',
                        'TW': 'TWD',
                        'US': 'USD',
                        'AZ': 'USD',
                        'AR': 'USD',
                        'PK': 'USD',
                        'TR': 'USD'
                    };

                    for (const option of (storeItem.purchase_options || [])) {
                        try {
                            const productName = option.purchase_option_name;
                            const currentPriceInCents = option.final_price_in_cents ? parseInt(option.final_price_in_cents, 10) : null;
                            const originalPriceInCents = option.original_price_in_cents ? parseInt(option.original_price_in_cents, 10) : currentPriceInCents;

                            if (!productName || currentPriceInCents === null) continue;

                            let currencyCode = countryToCurrency[region] || 'USD';
                            let currentPrice = parseFloat((currentPriceInCents / 100).toFixed(2));
                            let originalPrice = parseFloat((originalPriceInCents / 100).toFixed(2));

                            if (currencyCode.toUpperCase() !== 'RUB') {
                                try {
                                    const rates = await fm_fetchExchangeRates(currencyCode.toLowerCase());
                                    const rate = rates['rub'];
                                    if (rate) {
                                        currentPrice = parseFloat((currentPrice * rate).toFixed(2));
                                        originalPrice = parseFloat((originalPrice * rate).toFixed(2));
                                    } else {
                                        fm_logError(storeModule.name, `Не найден курс для ${currencyCode} -> RUB`);
                                        continue;
                                    }
                                } catch (e) {
                                    fm_logError(storeModule.name, `Ошибка получения курса для ${currencyCode}`, e);
                                    continue;
                                }
                            }

                            let data = {
                                storeId: storeModule.id,
                                storeName: `${storeModule.name} (${region})`,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: `${storeModule.baseUrl}/app/${storeItem.appid}`,
                                imageUrl: storeItem.assets?.header ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${storeItem.appid}/${storeItem.assets.header}` : null,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: option.discount_pct || null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch(e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга purchase_option', e);
                        }
                    }
                    return results;
                }
            }, // --- Конец модуля Steam ---
            { // --- Модуль SteamBuy ---
                id: 'steambuy',
                name: 'SteamBuy',
                baseUrl: 'https://steambuy.com',
                searchUrlTemplate: 'https://steambuy.com/ajax/_get.php?a=search&q={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            responseType: 'json',
                            headers: {
                                'Accept': 'application/json, text/javascript, */*; q=0.01',
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400 && response.response) {
                                    const data = response.response;
                                    if (data.status === 'success' && typeof data.html === 'string') {
                                        resolve(this.parseHtml(data.html, this));
                                    } else if (data.status === 'false' && data.message && data.message.includes("ничего не найдено")) {
                                        resolve([]);
                                    } else if (data.status === 'empty') {
                                        resolve([]);
                                    } else if (data.status === 'success' && !data.html) {
                                        resolve([]);
                                    } else {
                                        reject(new Error(`API вернул неожиданный ответ: Статус ${data.status}, Сообщение: ${data.message || 'Нет сообщения'}`));
                                    }
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.search-result__item');

                    items.forEach(item => {
                        try {
                            const linkElement = item.querySelector('.search-result__link');
                            const imgElement = item.querySelector('.search-result__img img');
                            const titleElement = item.querySelector('.search-result__title');
                            const priceElement = item.querySelector('.search-result__cost');
                            const discountElement = item.querySelector('.search-result__discount');

                            const productName = titleElement?.textContent?.trim() || null;
                            const productUrlRaw = linkElement?.getAttribute('href') || null;
                            const currentPriceText = priceElement?.innerHTML.replace(/<span[^>]*>.*<\/span>/i, '').replace('р', '').trim();
                            const currentPrice = fm_parsePrice(currentPriceText);

                            let discountPercent = 0;
                            const discountText = discountElement?.textContent?.trim();
                            if (discountText && discountText !== '&nbsp;') {
                                const parsedPercent = fm_parsePercent(discountText);
                                if (parsedPercent !== null) {
                                    discountPercent = parsedPercent;
                                }
                            }

                            const imageUrl = imgElement?.getAttribute('src') || null;

                            if (productName && productUrlRaw && currentPrice !== null) {
                                const fullProductUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                                const productUrl = fullProductUrl + '?partner=234029';

                                let data = {
                                    storeId: storeModule.id,
                                    storeName: storeModule.name,
                                    storeUrl: storeModule.baseUrl,
                                    productName: productName,
                                    productUrl: productUrl,
                                    imageUrl: imageUrl,
                                    currentPrice: currentPrice,
                                    originalPrice: null,
                                    discountPercent: discountPercent,
                                    discountAmount: null,
                                    currency: 'RUB',
                                    isAvailable: true
                                };
                                results.push(fm_calculateMissingValues(data));
                            } else {}
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента из AJAX HTML', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля SteamBuy ---

            { // --- Модуль Playo ---
                id: 'playo',
                name: 'Playo',
                baseUrl: 'https://playo.ru',
                searchUrlTemplate: 'https://playo.ru/search/{query}/?search={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const urlEncodedQuery = encodeURIComponent(query).replace(/%20/g, '+');
                    const pathEncodedQuery = encodeURIComponent(query);
                    const searchUrl = this.searchUrlTemplate
                        .replace('{query}', pathEncodedQuery)
                        .replace('{query}', urlEncodedQuery);

                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.preview_list .preview_it');

                    items.forEach(item => {
                        try {
                            const linkElement = item.querySelector('a.link_preview');
                            const imgElement = item.querySelector('.img_prev img');
                            const titleElement = item.querySelector('.inf');
                            const priceElement = item.querySelector('.price');
                            const oldPriceElement = item.querySelector('.old_price');
                            const discountPercentElement = item.querySelector('.gmlst_dscnt_lbl');
                            const discountAmountElement = item.querySelector('.gmlst_dsnt_val_text');

                            const productUrlRaw = linkElement ? linkElement.getAttribute('href') : null;
                            const imageUrlRaw = imgElement ? imgElement.getAttribute('src') : null;
                            let productName = null;
                            if (titleElement) {
                                const clonedTitle = titleElement.cloneNode(true);
                                const economySpan = clonedTitle.querySelector('.gmlst_dsnt_val_text');
                                if (economySpan) economySpan.remove();
                                productName = clonedTitle.textContent.replace(/\s+/g, ' ').trim();
                            }

                            const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                            const originalPrice = oldPriceElement ? fm_parsePrice(oldPriceElement.textContent) : null;
                            const discountPercent = discountPercentElement ? fm_parsePercent(discountPercentElement.textContent) : null;
                            const discountAmount = discountAmountElement ? fm_parsePrice(discountAmountElement.textContent) : null;

                            if (productName && productUrlRaw && currentPrice !== null) {
                                const fullProductUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                                const productUrl = fullProductUrl + '?s=n3j6y08f';
                                const imageUrl = imageUrlRaw.startsWith('/') ? storeModule.baseUrl + imageUrlRaw : imageUrlRaw;

                                let data = {
                                    storeId: storeModule.id,
                                    storeName: storeModule.name,
                                    storeUrl: storeModule.baseUrl,
                                    productName: productName,
                                    productUrl: productUrl,
                                    imageUrl: imageUrl,
                                    currentPrice: currentPrice,
                                    originalPrice: originalPrice,
                                    discountPercent: discountPercent,
                                    discountAmount: discountAmount,
                                    currency: 'RUB',
                                    isAvailable: true
                                };
                                results.push(fm_calculateMissingValues(data));
                            }
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            },

            { // --- Модуль SteamPay ---
                id: 'steampay',
                name: 'SteamPay',
                baseUrl: 'https://steampay.com',
                searchUrlTemplate: 'https://steampay.com/search?q={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: async function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.catalog-item');

                    await fm_fetchExchangeRates('usd').catch(e => fm_logError(storeModule.name, "Не удалось загрузить курсы USD", e));

                    for (const item of items) {
                        try {
                            const priceSpanElement = item.querySelector('.catalog-item__price-span');
                            const currentPriceText = priceSpanElement?.textContent?.trim();
                            const currentPrice = fm_parsePrice(currentPriceText);
                            if (currentPrice === null) continue;

                            const nameElement = item.querySelector('.catalog-item__name');
                            let productName = null;
                            if (nameElement) {
                                const nameClone = nameElement.cloneNode(true);
                                nameClone.querySelector('.catalog-item__info')?.remove();
                                productName = nameClone.textContent?.trim();
                            }

                            const productUrl = item?.getAttribute('href');
                            const imageUrl = item.querySelector('.catalog-item__img img')?.getAttribute('src');
                            const discountPercent = fm_parsePercent(item.querySelector('.catalog-item__discount')?.textContent);

                            if (productName && productUrl) {
                                let data = {
                                    storeId: storeModule.id,
                                    storeName: storeModule.name,
                                    storeUrl: storeModule.baseUrl,
                                    productName: productName,
                                    productUrl: productUrl.startsWith('/') ? storeModule.baseUrl + productUrl : productUrl,
                                    imageUrl: imageUrl?.startsWith('/') ? storeModule.baseUrl + imageUrl : imageUrl,
                                    currentPrice: currentPrice,
                                    originalPrice: null,
                                    discountPercent: discountPercent,
                                    discountAmount: null,
                                    currency: 'RUB',
                                    isAvailable: true
                                };

                                const processedData = await fm_processItemCurrency(data, currentPriceText);
                                if (processedData) {
                                    results.push(fm_calculateMissingValues(processedData));
                                }
                            }
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    }
                    return results;
                }
            }, // --- Конец модуля SteamPay ---

            { // --- Модуль Gabestore ---
                id: 'gabestore',
                name: 'Gabestore',
                baseUrl: 'https://gabestore.ru',
                searchUrlTemplate: 'https://gabestore.ru/result?ProductFilter%5Bsearch%5D={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const itemsContainer = doc.querySelector('.js-load-container');
                    const items = itemsContainer ? itemsContainer.querySelectorAll('.shop-item') : [];

                    items.forEach(item => {
                        try {
                            const nameLinkElement = item.querySelector('a.shop-item__name');
                            const imageLinkElement = item.querySelector('a.shop-item__image');
                            const imgElement = imageLinkElement?.querySelector('img');
                            const priceElement = item.querySelector('.shop-item__price-current');
                            const discountElement = item.querySelector('.shop-item__price-discount');

                            const productName = nameLinkElement?.textContent?.trim();
                            const productUrlRaw = nameLinkElement?.getAttribute('href') || imageLinkElement?.getAttribute('href');
                            const imageUrl = imgElement?.getAttribute('src');
                            const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                            const discountPercent = discountElement ? fm_parsePercent(discountElement.textContent) : 0;

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            const fullOriginalUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                            const referralPrefix = 'https://codeaven.com/g/om6s6jfc50c1442ace4b215ab801b9/?erid=2bL9aMPo2e49hMef4peVT3sy3u&ulp=';
                            const productUrl = referralPrefix + encodeURIComponent(fullOriginalUrl);

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: null,
                                discountPercent: discountPercent,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: !item.querySelector('.btn--empty-item')
                            };

                            if (data.isAvailable) {
                                results.push(fm_calculateMissingValues(data));
                            }

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Gabestore ---

            { // --- Модуль GamerBase ---
                id: 'gamerbase',
                name: 'GamersBase',
                baseUrl: 'https://gamersbase.store',
                searchUrlTemplate: 'https://gamersbase.store/ru/search/?isFullTextSearch=true&searchQuery={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const storeModule = this;
                    const searchUrl = storeModule.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(storeModule.parseHtml(response.responseText, storeModule));
                                } else {
                                    reject(new Error(`[Fallback] HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('[Fallback] Сетевая ошибка')),
                            ontimeout: () => reject(new Error('[Fallback] Таймаут запроса'))
                        });
                    });
                },
                parseHtml: async function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.js-products-container .ui.cover');

                    await fm_fetchExchangeRates('usd').catch(e => fm_logError(storeModule.name, "Не удалось загрузить курсы USD", e));
                    await fm_fetchExchangeRates('kzt').catch(e => fm_logError(storeModule.name, "Не удалось загрузить курсы KZT", e));


                    for (const item of items) {
                        try {
                            const linkElement = item.querySelector('a.cover-holder');
                            const buyButton = item.querySelector('.js-add-product');
                            const productDataJson = linkElement?.dataset.product || buyButton?.dataset.product;
                            if (!productDataJson) continue;

                            const productData = JSON.parse(productDataJson);
                            if (!productData?.name || !productData?.priceData) continue;

                            const productName = productData.name;
                            const productUrlRaw = linkElement?.getAttribute('href');
                            const imageUrl = item.querySelector('.image img')?.getAttribute('src');
                            const currentPrice = fm_parsePrice(productData.priceData.actualPriceFormatted);
                            const originalPrice = fm_parsePrice(productData.priceData.standardPriceFormatted);
                            const discountPercent = productData.priceData.discountPercent || 0;
                            const currency = productData.priceData.currency || 'RUB';
                            const isAvailable = item.querySelector('.js-add-product.available-true') !== null;

                            if (productName && productUrlRaw && currentPrice !== null && isAvailable) {
                                let fullOriginalUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                                const urlObject = new URL(fullOriginalUrl);
                                if (urlObject.pathname.startsWith('/ru/')) {
                                    urlObject.pathname = urlObject.pathname.substring(3);
                                    fullOriginalUrl = urlObject.toString();
                                }
                                const referralPrefix = 'https://lsuix.com/g/nzstwno2sac1442ace4bb0de1ddd64/?erid=2bL9aMPo2e49hMef4pfVDVxtYh&ulp=';
                                const productUrl = referralPrefix + encodeURIComponent(fullOriginalUrl);

                                let data = {
                                    storeId: storeModule.id,
                                    storeName: storeModule.name,
                                    storeUrl: storeModule.baseUrl,
                                    productName: productName,
                                    productUrl: productUrl,
                                    imageUrl: imageUrl,
                                    currentPrice: currentPrice,
                                    originalPrice: originalPrice,
                                    discountPercent: discountPercent,
                                    discountAmount: null,
                                    currency: currency,
                                    isAvailable: true
                                };

                                const processedData = await fm_processItemCurrency(data, productData.priceData.actualPriceFormatted);
                                if (processedData) {
                                    results.push(fm_calculateMissingValues(processedData));
                                }
                            }
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента или JSON в data-product', e);
                        }
                    }
                    return results;
                }
            }, // --- Конец модуля GamerBase ---

            { // --- Модуль Igromagaz ---
                id: 'igromagaz',
                name: 'Igromagaz',
                baseUrl: 'https://www.igromagaz.ru',
                searchUrlTemplate: 'https://www.igromagaz.ru/search/?q={query}&quantity_in=Y',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.product-card');

                    items.forEach(item => {
                        try {
                            const notAvailableElement = item.querySelector('.product-availability--not-available');
                            const notifyButton = item.querySelector('.button-notify-js');
                            if (notAvailableElement || notifyButton) {
                                return;
                            }

                            const titleLinkElement = item.querySelector('a.product-title');
                            const imageLinkElement = item.querySelector('a.product-img');
                            const imgElement = imageLinkElement?.querySelector('img');
                            const priceElement = item.querySelector('.product-price__standart');
                            const oldPriceElement = item.querySelector('.product-price__fail');
                            const discountElement = item.querySelector('.sale-label');

                            const productName = titleLinkElement?.textContent?.trim();
                            const productUrl = titleLinkElement?.getAttribute('href') || imageLinkElement?.getAttribute('href');
                            const imageUrl = imgElement?.getAttribute('src');
                            const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                            const originalPrice = oldPriceElement ? fm_parsePrice(oldPriceElement.textContent) : null;
                            const discountPercent = discountElement ? fm_parsePercent(discountElement.textContent) : null;

                            if (!productName || !productUrl || currentPrice === null) {
                                return;
                            }

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl.startsWith('/') ? storeModule.baseUrl + productUrl : productUrl,
                                imageUrl: imageUrl?.startsWith('/') ? storeModule.baseUrl + imageUrl : imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: discountPercent,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Igromagaz ---

            { // --- Модуль GamesForFarm ---
                id: 'gamesforfarm',
                name: 'GamesForFarm',
                baseUrl: 'https://gamesforfarm.com',
                searchUrlTemplate: 'https://gamesforfarm.com/?search={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const container = doc.querySelector('#gamesCatalog');
                    if (!container) return results;

                    const items = container.querySelectorAll('.product__item');

                    items.forEach(item => {
                        try {
                            const linkElement = item.querySelector('.product__box-title a');
                            const imgElement = item.querySelector('.product__box-image img');
                            const priceElement = item.querySelector('.product__box-price');
                            const discountElement = item.querySelector('.product__box-prop.prop--discount');

                            let currentPrice = null;
                            if (priceElement) {
                                const priceClone = priceElement.cloneNode(true);
                                const currencySpan = priceClone.querySelector('span.sc-ru3bl');
                                if (currencySpan) currencySpan.remove();
                                currentPrice = fm_parsePrice(priceClone.textContent);
                            }

                            const productName = linkElement?.textContent?.trim();
                            const productUrl = linkElement?.getAttribute('href');
                            const imageUrl = imgElement?.dataset.src || imgElement?.getAttribute('src');
                            const discountPercent = discountElement ? fm_parsePercent(discountElement.textContent) : 0;

                            if (!productName || !productUrl || currentPrice === null) {
                                return;
                            }

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl.startsWith('/') ? storeModule.baseUrl + productUrl : productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: null,
                                discountPercent: discountPercent,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля GamesForFarm ---

            { // --- Модуль Gamazavr ---
                id: 'gamazavr',
                name: 'Gamazavr',
                baseUrl: 'https://gamazavr.ru',
                searchUrlTemplate: 'https://gamazavr.ru/search/?query={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const container = doc.querySelector('.productsList');
                    if (!container) {
                        return results;
                    }

                    const items = container.querySelectorAll('.item');

                    items.forEach(item => {
                        try {
                            const descriptionLink = item.querySelector('.description a');
                            const imageLink = item.querySelector('a.img');
                            const imgElement = imageLink?.querySelector('img');
                            const priceElement = item.querySelector('.price');
                            const currentPriceElement = priceElement?.querySelector('b');
                            const originalPriceElement = priceElement?.querySelector('s');

                            const productName = descriptionLink?.querySelector('b')?.textContent?.trim();
                            const productUrlRaw = descriptionLink?.getAttribute('href');
                            const imageUrlRaw = imgElement?.getAttribute('src');

                            const currentPrice = currentPriceElement ? fm_parsePrice(currentPriceElement.textContent) : null;
                            const originalPrice = originalPriceElement ? fm_parsePrice(originalPriceElement.textContent) : null;

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            const fullProductUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                            const productUrl = fullProductUrl + '?partner=8293ebf587779da6';
                            const imageUrl = imageUrlRaw?.startsWith('/') ? storeModule.baseUrl + imageUrlRaw : imageUrlRaw;

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента Gamazavr', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Gamazavr ---

            { // --- Модуль GameRay ---
                id: 'gameray',
                name: 'GameRay',
                baseUrl: 'https://gameray.ru',
                searchUrlTemplate: 'https://gameray.ru/search/index.php?q={query}',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    let initialResults = [];

                    // --- Шаг 1: Получаем список игр со страницы поиска ---
                    try {
                        const response = await new Promise((resolve, reject) => {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: searchUrl,
                                timeout: FM_REQUEST_TIMEOUT_MS,
                                onload: resolve,
                                onerror: reject,
                                ontimeout: () => reject(new Error('Таймаут запроса (поиск)')),
                            });
                        });

                        if (response.status >= 200 && response.status < 400) {
                            initialResults = this.parseSearchPage(response.responseText, this);
                        } else {
                            throw new Error(`HTTP статус ${response.status} (поиск)`);
                        }
                    } catch (error) {
                        fm_logError(this.name, `Ошибка на шаге 1 (поиск): ${error.message}`, error);
                        return [];
                    }

                    if (initialResults.length === 0) {
                        return [];
                    }

                    // --- Шаг 2: Запрашиваем каждую страницу товара для деталей ---
                    const detailPromises = initialResults.map(initialData =>
                        new Promise(async (resolve) => {
                            try {
                                const productResponse = await new Promise((resolveFetch, rejectFetch) => {
                                    GM_xmlhttpRequest({
                                        method: "GET",
                                        url: initialData.fullProductUrl,
                                        timeout: FM_REQUEST_TIMEOUT_MS,
                                        onload: resolveFetch,
                                        onerror: rejectFetch,
                                        ontimeout: () => rejectFetch(new Error(`Таймаут запроса (${initialData.productName})`)),
                                    });
                                });

                                if (productResponse.status >= 200 && productResponse.status < 400) {
                                    resolve(this.parseProductPage(productResponse.responseText, initialData, this));
                                } else {
                                    fm_logError(this.name, `Ошибка загрузки страницы товара ${initialData.productName} (Статус: ${productResponse.status})`);
                                    resolve(null);
                                }
                            } catch (error) {
                                fm_logError(this.name, `Ошибка загрузки страницы товара ${initialData.productName}: ${error.message}`, error);
                                resolve(null);
                            }
                        })
                    );

                    const detailedResults = await Promise.allSettled(detailPromises);

                    const finalResults = detailedResults
                        .filter(result => result.status === 'fulfilled' && result.value !== null)
                        .map(result => result.value);

                    return finalResults;
                },

                parseSearchPage: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const container = doc.querySelector('.search-page') || doc.body;
                    const items = container.querySelectorAll('a.ec-clicker');

                    items.forEach(item => {
                        try {
                            const productName = item.dataset.name?.trim();
                            const productUrlRaw = item.getAttribute('href');
                            const imgElement = item.querySelector('img');
                            const imageUrlRaw = imgElement?.getAttribute('src');

                            if (productName && productUrlRaw && imageUrlRaw) {
                                const fullProductUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                                const imageUrl = imageUrlRaw.startsWith('/') ? storeModule.baseUrl + imageUrlRaw : imageUrlRaw;

                                results.push({
                                    productName: productName,
                                    fullProductUrl: fullProductUrl,
                                    imageUrl: imageUrl
                                });
                            }
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента на странице поиска', e);
                        }
                    });
                    return results;
                },

                parseProductPage: function(htmlString, initialData, storeModule) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');

                    const pricingBlock = doc.querySelector('div.pricing');
                    if (!pricingBlock) {
                        fm_logError(storeModule.name, `Блок .pricing не найден для: ${initialData.productName}`);
                        return null;
                    }

                    const buyButton = pricingBlock.querySelector('a.buy-button');
                    const isAvailable = buyButton !== null;

                    if (!isAvailable) {
                        return null;
                    }

                    const priceElement = pricingBlock.querySelector('strong.price span[itemprop="price"]');
                    const originalPriceElement = pricingBlock.querySelector('strike.price_old');

                    const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                    const originalPrice = originalPriceElement ? fm_parsePrice(originalPriceElement.textContent) : null;

                    if (currentPrice === null) {
                        fm_logError(storeModule.name, `Не найдена цена в блоке .pricing для: ${initialData.productName}`);
                        return null;
                    }

                    const productUrlWithRef = initialData.fullProductUrl + '?partner=93';

                    let finalData = {
                        storeId: storeModule.id,
                        storeName: storeModule.name,
                        storeUrl: storeModule.baseUrl,
                        productName: initialData.productName,
                        productUrl: productUrlWithRef,
                        imageUrl: initialData.imageUrl,
                        currentPrice: currentPrice,
                        originalPrice: originalPrice,
                        discountPercent: null,
                        discountAmount: null,
                        currency: 'RUB',
                        isAvailable: isAvailable
                    };

                    return fm_calculateMissingValues(finalData);
                }
            }, // --- Конец модуля GameRay ---

            { // --- Модуль Kupikod ---
                id: 'kupikod',
                name: 'KupiKod',
                baseUrl: 'https://kupikod.com',
                apiGamesUrlTemplate: 'https://explorer.kupikod.com/backend/api/games?name={query}',
                apiShopUrlTemplate: 'https://explorer.kupikod.com/backend/api/shop/products-list?name={query}',
                isEnabled: true,
                // Список суффиксов регионов для исключения (в нижнем регистре)
                excludedRegionSuffixes: [
                    '-eu', '-us', '-arg', '-tr', '-no-ru-no-rb', '-no-ru-no-cis',
                    '-no-ru', '-euus', '-cis', '-uk', '-in', '-eg'
                ],
                // Список ключевых слов платформ для исключения (в нижнем регистре)
                excludedPlatformKeywords: [
                    '-xbox-', '-origin-', '-uplay-', '-gog-', '-rockstar-',
                    '-battlestate-', '-nintendo-'
                ],
                fetch: async function(query) {
                    const storeModule = this;
                    const encodedQuery = encodeURIComponent(query);
                    const gamesUrl = storeModule.apiGamesUrlTemplate.replace('{query}', encodedQuery);
                    const shopUrl = storeModule.apiShopUrlTemplate.replace('{query}', encodedQuery);

                    const fetchPromise = (url) => new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: url,
                            responseType: 'json',
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400 && response.response) {
                                    resolve(response.response);
                                } else {
                                    fm_logError(storeModule.name, `HTTP статус ${response.status} для ${url}`);
                                    resolve(null);
                                }
                            },
                            onerror: (error) => {
                                fm_logError(storeModule.name, `Сетевая ошибка для ${url}`, error);
                                resolve(null);
                            },
                            ontimeout: () => {
                                fm_logError(storeModule.name, `Таймаут запроса для ${url}`);
                                resolve(null);
                            }
                        });
                    });

                    const [gamesResult, shopResult] = await Promise.allSettled([
                        fetchPromise(gamesUrl),
                        fetchPromise(shopUrl)
                    ]);

                    let finalResults = [];

                    if (gamesResult.status === 'fulfilled' && gamesResult.value?.data) {
                        try {
                            finalResults = finalResults.concat(storeModule.parseGamesApi(gamesResult.value.data, storeModule));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга ответа Games API', e);
                        }
                    } else if (gamesResult.status === 'rejected') {}

                    if (shopResult.status === 'fulfilled' && shopResult.value?.data) {
                        try {
                            finalResults = finalResults.concat(storeModule.parseShopApi(shopResult.value.data, storeModule));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга ответа Shop API', e);
                        }
                    } else if (shopResult.status === 'rejected') {}

                    return finalResults;
                },

                // Парсер для ответа от /api/games (Steam-гифты)
                parseGamesApi: function(items, storeModule) {
                    const results = [];
                    if (!Array.isArray(items)) {
                        fm_logError(storeModule.name, 'Games API response data is not an array', items);
                        return results;
                    }

                    const referralBase = "https://yknhc.com/g/lfofiog4lqc1442ace4b294cb5928a/";
                    const referralParams = "?erid=2bL9aMPo2e49hMef4phUQVF5W8&ulp=";

                    items.forEach(item => {
                        try {
                            const productName = item.name?.trim();
                            const slug = item.slug;
                            const currentPrice = fm_parsePrice(item.min_price?.rub ?? null);
                            const originalPriceRaw = fm_parsePrice(item.min_old_price?.rub ?? null);
                            const originalPrice = (originalPriceRaw !== null && currentPrice !== null && originalPriceRaw > currentPrice) ? originalPriceRaw : null;
                            const imageUrl = item.external_data?.header_image;

                            if (!productName || !slug || currentPrice === null || !imageUrl) {
                                return;
                            }

                            const originalProductUrl = `https://steam.kupikod.com/ru-ru/games/${slug}`;
                            const productUrl = referralBase + referralParams + encodeURIComponent(originalProductUrl);

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name + " (Гифты)",
                                storeUrl: "https://steam.kupikod.com/",
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента Games API', e);
                        }
                    });
                    return results;
                },

                // Парсер для ответа от /api/shop/products-list (Ключи)
                parseShopApi: function(items, storeModule) {
                    const results = [];
                    if (!Array.isArray(items)) {
                        fm_logError(storeModule.name, 'Shop API response data is not an array', items);
                        return results;
                    }

                    const referralBase = "https://yknhc.com/g/lfofiog4lqc1442ace4b294cb5928a/";
                    const referralParams = "?erid=2bL9aMPo2e49hMef4phUQVF5W8&ulp=";

                    items.forEach(item => {
                        try {
                            const productName = item.h1_title?.trim();
                            const slug = item.slug?.toLowerCase();
                            const currentPrice = fm_parsePrice(item.price ?? null);
                            const originalPriceRaw = fm_parsePrice(item.old_price ?? null);
                            const originalPrice = (originalPriceRaw !== null && originalPriceRaw > 0 && currentPrice !== null && originalPriceRaw > currentPrice) ? originalPriceRaw : null;
                            const imageUrl = item.picture_url;

                            if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.includes('/apps//')) {
                                return;
                            }

                            if (!productName || !slug || currentPrice === null) {
                                return;
                            }

                            if (storeModule.excludedRegionSuffixes.some(suffix => slug.endsWith(suffix))) {
                                return;
                            }
                            if (storeModule.excludedPlatformKeywords.some(keyword => slug.includes(keyword))) {
                                return;
                            }

                            const originalProductUrl = `${storeModule.baseUrl}/shop/${item.slug}`;
                            const productUrl = referralBase + referralParams + encodeURIComponent(originalProductUrl);

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name + " (Ключи)",
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента Shop API', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Kupikod ---

            { // --- Модуль KeysForGamers ---
                id: 'keysforgamers',
                name: 'KeysForGamers',
                baseUrl: 'https://keysforgamers.com',
                apiUrl: 'https://keysforgamers.com/ru/product/search',
                isEnabled: true,
                fetch: async function(query) {
                    const storeModule = this;
                    let searchQuery = query;

                    const containsCyrillic = /[а-яё]/i.test(query);
                    if (containsCyrillic) {
                        fm_logError(storeModule.name, `Обнаружена кириллица в запросе "${query}". Пытаемся получить английское название...`);
                        const steamAppIdMatch = unsafeWindow.location.pathname.match(/\/app\/(\d+)/);

                        if (steamAppIdMatch && steamAppIdMatch[1]) {
                            const currentAppId = steamAppIdMatch[1];
                            const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${currentAppId}&l=english`;

                            try {
                                const response = await new Promise((resolve, reject) => {
                                    GM_xmlhttpRequest({
                                        method: "GET",
                                        url: apiUrl,
                                        responseType: 'json',
                                        timeout: FM_REQUEST_TIMEOUT_MS,
                                        onload: resolve,
                                        onerror: reject,
                                        ontimeout: () => reject(new Error('Таймаут запроса к Steam API (AppDetails)')),
                                    });
                                });

                                if (response.status === 200 && response.response && response.response[currentAppId]?.success) {
                                    const englishName = response.response[currentAppId]?.data?.name;
                                    if (englishName && englishName.trim()) {
                                        searchQuery = englishName.trim();
                                        fm_logError(storeModule.name, `Используем английское название для поиска: "${searchQuery}"`);
                                    } else {
                                        fm_logError(storeModule.name, `Steam API вернул успех, но английское имя не найдено для AppID ${currentAppId}. Используем оригинальный запрос.`);
                                    }
                                } else {
                                    fm_logError(storeModule.name, `Запрос к Steam API не удался или неверный ответ для AppID ${currentAppId} (Status: ${response.status}). Используем оригинальный запрос.`);
                                }
                            } catch (error) {
                                fm_logError(storeModule.name, `Ошибка при получении английского названия из Steam API: ${error.message}. Используем оригинальный запрос.`, error);
                            }
                        } else {
                            fm_logError(storeModule.name, 'Не удалось получить Steam AppID со страницы для запроса английского названия. Используем оригинальный запрос.');
                        }
                    }


                    let csrfToken = '';

                    try {
                        const mainPageResponse = await new Promise((resolve, reject) => {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: storeModule.baseUrl + '/ru/',
                                timeout: FM_REQUEST_TIMEOUT_MS,
                                onload: resolve,
                                onerror: reject,
                                ontimeout: () => reject(new Error('Таймаут запроса (CSRF)')),
                            });
                        });
                        if (mainPageResponse.status >= 200 && mainPageResponse.status < 400) {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(mainPageResponse.responseText, 'text/html');
                            const csrfMetaTag = doc.querySelector('meta[name="csrf-token"]');
                            if (!csrfMetaTag) throw new Error('Мета-тег csrf-token не найден!');
                            csrfToken = csrfMetaTag.getAttribute('content');
                            if (!csrfToken) throw new Error('Не удалось получить значение csrf-token!');
                        } else {
                            throw new Error(`HTTP статус ${mainPageResponse.status} при получении CSRF`);
                        }

                    } catch (error) {
                        fm_logError(storeModule.name, `Ошибка получения CSRF токена: ${error.message}`, error);
                        throw error;
                    }

                    let allItems = [];
                    let currentPage = 1;
                    let totalPages = 1;

                    do {
                        const requestPayload = {
                            productTypes: [{
                                value: "6",
                                id: "category-6"
                            }],
                            regionData: [{
                                    value: "1",
                                    id: "region-1"
                                },
                                {
                                    value: "85",
                                    id: "region-85"
                                },
                                {
                                    value: "6",
                                    id: "region-6"
                                }
                            ],
                            searchData: [{
                                value: searchQuery,
                                id: "product-search"
                            }],
                            sortData: [{
                                value: "4",
                                id: "search_sort"
                            }],
                            priceRange: [{
                                value: ["0.00", "99999.00"],
                                id: ["min_price", "max_price"]
                            }],
                            page: currentPage,
                            perPage: 24,
                            switchData: [],
                            marketplaceData: [],
                            otherTypesData: [],
                            hashData: [],
                            showMorePages: 0,
                            isMinPriceChanged: false,
                            isMaxPriceChanged: true,
                            minPriceValue: 0,
                            maxPriceValue: 99999.00
                        };
                        const requestHeaders = {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json',
                            'X-Csrf-Token': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        };

                        try {
                            const response = await new Promise((resolve, reject) => {
                                GM_xmlhttpRequest({
                                    method: "POST",
                                    url: storeModule.apiUrl,
                                    headers: requestHeaders,
                                    data: JSON.stringify(requestPayload),
                                    responseType: 'json',
                                    timeout: FM_REQUEST_TIMEOUT_MS,
                                    onload: resolve,
                                    onerror: reject,
                                    ontimeout: () => reject(new Error(`Таймаут запроса (page: ${currentPage})`)),
                                });
                            });

                            if (response.status >= 200 && response.status < 400 && response.response) {
                                const data = response.response;
                                if (data.catalogBody && typeof data.catalogBody === 'string') {
                                    const pageItems = storeModule.parseKFGHtml(data.catalogBody, storeModule);
                                    allItems = allItems.concat(pageItems);
                                }
                                totalPages = data.pages ?? totalPages;
                                if (data.pages === undefined && currentPage === 1) totalPages = 1;
                            } else {
                                throw new Error(`HTTP статус ${response.status} (page: ${currentPage})`);
                            }

                        } catch (error) {
                            fm_logError(storeModule.name, `Ошибка загрузки страницы ${currentPage}: ${error.message}`, error);
                            throw error;
                        }

                        currentPage++;
                        if (currentPage <= totalPages) await new Promise(res => setTimeout(res, 150));

                    } while (currentPage <= totalPages);

                    return allItems;
                },
                parseKFGHtml: function(htmlString, storeModule) {
                    const items = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const productElements = doc.querySelectorAll('.items-list .product-item');

                    productElements.forEach(element => {
                        try {
                            const titleElement = element.querySelector('.catalog-card__item-title');
                            const priceElement = element.querySelector('.catalog-card__price');
                            const linkElement = element.querySelector('.catalog-card__img-link, .product-card__link, .catalog-card__item-title a');
                            const imgElement = element.querySelector('.catalog-card__img img, .product-card img');

                            const productName = titleElement?.textContent?.trim();
                            const priceText = priceElement?.textContent?.trim();
                            const productUrlRaw = linkElement?.getAttribute('href');
                            const imageUrlRaw = imgElement?.getAttribute('src');

                            if (!productName || !priceText || !productUrlRaw || !imageUrlRaw) {
                                return;
                            }

                            const cleanedPriceText = priceText.replace(/[₽$,]/g, '');
                            const currentPrice = fm_parsePrice(cleanedPriceText);

                            if (currentPrice === null) {
                                fm_logError(storeModule.name, `Не удалось распарсить очищенную цену: ${cleanedPriceText}`, element.innerHTML);
                                return;
                            }

                            const productUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                            const imageUrl = imageUrlRaw.startsWith('/') ? storeModule.baseUrl + imageUrlRaw : imageUrlRaw;

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: null,
                                discountPercent: null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };

                            items.push(data);

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга HTML элемента KeysForGamers', e);
                        }
                    });
                    return items;
                }
            }, // --- Конец модуля KeysForGamers ---

            { // --- Модуль Zaka-zaka ---
                id: 'zakazaka',
                name: 'Zaka-zaka',
                baseUrl: 'https://zaka-zaka.com',
                searchUrlTemplate: 'https://zaka-zaka.com/search/ask/{query}/sort/price.asc',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.search-results .game-block');

                    items.forEach(item => {
                        try {
                            const linkElement = item;
                            const imageDiv = item.querySelector('.game-block-image');
                            const nameElement = item.querySelector('.game-block-name');
                            const priceElement = item.querySelector('.game-block-price');
                            const discountElement = item.querySelector('.game-block-discount');
                            const discountAmountElement = item.querySelector('.game-block-discount-sum');

                            const productName = nameElement?.textContent?.trim();
                            const productUrlRaw = linkElement?.getAttribute('href');
                            const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                            const discountPercent = discountElement ? fm_parsePercent(discountElement.textContent) : 0;
                            const discountAmount = discountAmountElement ? Math.abs(fm_parsePrice(discountAmountElement.textContent) ?? 0) : null;

                            let imageUrl = null;
                            if (imageDiv?.style?.backgroundImage) {
                                const match = imageDiv.style.backgroundImage.match(/url\("?(.+?)"?\)/);
                                if (match && match[1]) {
                                    imageUrl = match[1].startsWith('/') ? storeModule.baseUrl + match[1] : match[1];
                                }
                            }

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            const fullOriginalUrl = productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw;
                            const referralPrefix = 'https://bednari.com/g/momptkjep9c1442ace4b02770293ab/?erid=2bL9aMPo2e49hMef4pgUXYbxvv&ulp=';
                            const productUrl = referralPrefix + encodeURIComponent(fullOriginalUrl);

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: null,
                                discountPercent: discountPercent,
                                discountAmount: discountAmount,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Zaka-zaka ---

            { // --- Модуль Buka ---
                id: 'buka',
                name: 'Buka',
                baseUrl: 'https://shop.buka.ru',
                apiUrl: 'https://shop.buka.ru/api/f/v2/search/get-page',
                isEnabled: true,
                fetch: async function(query) {
                    let allItems = [];
                    let pageIndex = 0;
                    let hasNext = true;
                    const storeModule = this;

                    async function fetchBukaPage(currentIndex) {
                        const requestPayload = {
                            pageIndex: currentIndex,
                            filter: {
                                term: query,
                                area_id: 100001,
                                channel: "WEB"
                            }
                        };
                        const requestHeaders = {
                            'Accept': '*/*',
                            'Content-Type': 'application/json'
                        };

                        try {
                            const response = await new Promise((resolve, reject) => {
                                GM_xmlhttpRequest({
                                    method: "POST",
                                    url: storeModule.apiUrl,
                                    headers: requestHeaders,
                                    data: JSON.stringify(requestPayload),
                                    responseType: 'json',
                                    timeout: FM_REQUEST_TIMEOUT_MS,
                                    onload: resolve,
                                    onerror: reject,
                                    ontimeout: () => reject(new Error(`Таймаут запроса (pageIndex: ${currentIndex})`)),
                                });
                            });

                            if (response.status >= 200 && response.status < 400 && response.response) {
                                const data = response.response;
                                const pageInfo = data.page;

                                if (pageInfo && Array.isArray(pageInfo.rows)) {
                                    const processedItems = pageInfo.rows
                                        .map(item => storeModule.parseApiItem(item, storeModule))
                                        .filter(item => item !== null);

                                    allItems = allItems.concat(processedItems);
                                }

                                hasNext = pageInfo?.hasNext ?? false;
                                if (hasNext) {
                                    await fetchBukaPage(currentIndex + 1);
                                }

                            } else {
                                throw new Error(`HTTP статус ${response.status} (pageIndex: ${currentIndex})`);
                            }
                        } catch (error) {
                            fm_logError(storeModule.name, `Ошибка загрузки страницы ${currentIndex}: ${error.message}`, error);
                            hasNext = false;
                        }
                    }

                    await fetchBukaPage(pageIndex);

                    return allItems;
                },

                parseApiItem: function(item, storeModule) {
                    try {
                        // --- Фильтрация ---
                        // 1. Проверяем тип (нужен цифровой, обычно type: 3)
                        if (item.type !== 3) return null;

                        // 2. Проверяем платформу (нужен PC)
                        const platformFilter = item.filters?.find(f => f.field === 'platform');
                        const isPC = platformFilter?.values?.some(v => v.title === 'PC');
                        if (!isPC) return null;

                        // 3. Проверяем статус продажи (доступен или предзаказ)
                        const saleState = item.saleState;
                        if (saleState !== 'available' && saleState !== 'pre-order') {
                            return null;
                        }

                        const productName = item.title?.trim();
                        const productUrlRaw = item.alias ? `/item/${item.alias}` : null;
                        const imageUrl = item.img;

                        const currentPrice = item.price?.actual ? fm_parsePrice(item.price.actual) : null;
                        const originalPrice = item.price?.old ? fm_parsePrice(item.price.old) : (currentPrice !== null ? currentPrice : null);
                        const discountPercent = item.price?.discount ? parseFloat(item.price.discount) : 0;

                        if (!productName || !productUrlRaw || !imageUrl || currentPrice === null) {
                            fm_logError(storeModule.name, 'Недостаточно данных в API ответе для элемента', item);
                            return null;
                        }

                        const fullProductUrl = storeModule.baseUrl + productUrlRaw;
                        const productUrlWithRef = fullProductUrl + '?ref=zoneofgames';

                        let data = {
                            storeId: storeModule.id,
                            storeName: storeModule.name,
                            storeUrl: storeModule.baseUrl,
                            productName: productName,
                            productUrl: productUrlWithRef,
                            imageUrl: imageUrl,
                            currentPrice: currentPrice,
                            originalPrice: originalPrice === currentPrice ? null : originalPrice,
                            discountPercent: discountPercent > 0 ? discountPercent : null,
                            discountAmount: null,
                            currency: 'RUB',
                            isAvailable: true
                        };

                        return fm_calculateMissingValues(data);

                    } catch (e) {
                        fm_logError(storeModule.name, 'Ошибка парсинга элемента API Buka', e);
                        return null;
                    }
                }
            },

            { // --- Модуль GGSEL ---
                id: 'ggsel',
                name: 'GGSEL',
                baseUrl: 'https://ggsel.net',
                apiUrl: 'https://api4.ggsel.com/elastic/goods/query',
                isEnabled: true,
                fetch: async function(query) {
                    let allItems = [];
                    let searchAfter = [];
                    const limit = 60;
                    let hasMore = true;
                    let fetchedCount = 0;
                    const maxFetches = 5;
                    let fetchAttempts = 0;
                    const storeModule = this;

                    async function fetchGGSELPage(currentIndex) {
                        fetchAttempts++;
                        const requestPayload = {
                            search_term: query,
                            limit: limit,
                            search_after: searchAfter,
                            is_preorders: false,
                            with_filters: true,
                            with_categories: false,
                            sort: "sortByPriceUp",
                            content_type_ids: [48, 2],
                            with_forbidden: false,
                            min_price: "",
                            max_price: "",
                            currency: "wmr",
                            lang: "ru",
                            platforms: ["Steam"]
                        };
                        const requestHeaders = {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        };

                        try {
                            const response = await new Promise((resolve, reject) => {
                                GM_xmlhttpRequest({
                                    method: "POST",
                                    url: storeModule.apiUrl,
                                    headers: requestHeaders,
                                    data: JSON.stringify(requestPayload),
                                    responseType: 'json',
                                    timeout: FM_REQUEST_TIMEOUT_MS,
                                    onload: resolve,
                                    onerror: reject,
                                    ontimeout: () => reject(new Error(`Таймаут запроса (pageIndex: ${currentIndex})`)),
                                });
                            });

                            if (response.status >= 200 && response.status < 400 && response.response?.data) {
                                const data = response.response.data;
                                if (data.items && Array.isArray(data.items)) {
                                    const processedItems = data.items
                                        .map(item => storeModule.parseApiItem(item, storeModule))
                                        .filter(item => item !== null);

                                    allItems = allItems.concat(processedItems);
                                    fetchedCount += data.items.length;

                                    if (data.items.length < limit || !data.last_sort || fetchedCount >= (data.total ?? fetchedCount)) {
                                        hasMore = false;
                                    } else {
                                        searchAfter = data.last_sort;
                                    }
                                } else {
                                    hasMore = false;
                                }
                            } else {
                                throw new Error(`HTTP статус ${response.status} (pageIndex: ${currentIndex})`);
                            }
                        } catch (error) {
                            fm_logError(storeModule.name, `Ошибка загрузки страницы ${currentIndex}: ${error.message}`, error);
                            hasMore = false;
                        }

                        if (hasMore && fetchAttempts < maxFetches) {
                            await new Promise(res => setTimeout(res, 150));
                            await fetchGGSELPage(currentIndex + 1);
                        }
                    }

                    await fetchGGSELPage(0);

                    if (fetchAttempts >= maxFetches && hasMore) {
                        fm_logError(storeModule.name, `Достигнут лимит запросов пагинации (${maxFetches}). Возможно, показаны не все результаты.`);
                    }

                    return allItems;
                },

                parseApiItem: function(item, storeModule) {
                    try {
                        if (item.forbidden_type !== 0 || item.hidden_from_search || item.hidden_from_parents) {
                            return null;
                        }
                        if (item.content_type_id !== 48 && item.content_type_id !== 2) {
                            return null;
                        }

                        const productName = item.name?.trim();
                        const productUrlRaw = `${storeModule.baseUrl}/catalog/product/${item.id_goods}`;
                        const productUrl = `${productUrlRaw}?ai=234029`;

                        const imageUrl = item.images ? `https://img.ggsel.ru/${item.id_goods}/original/250x250/${item.images}` : null;

                        const currentPrice = item.price_wmr ? fm_parsePrice(item.price_wmr) : null;
                        const potentialOriginalPrice = item.category_discount ? fm_parsePrice(item.category_discount) : null;
                        const originalPrice = (potentialOriginalPrice && currentPrice !== null && potentialOriginalPrice > currentPrice) ? potentialOriginalPrice : null;

                        const sellerId = item.id_seller;
                        const sellerName = item.seller_name;

                        if (!productName || currentPrice === null || !imageUrl) {
                            fm_logError(storeModule.name, 'Недостаточно данных в элементе API GGSEL (после проверок)', item);
                            return null;
                        }

                        let data = {
                            storeId: storeModule.id,
                            storeName: storeModule.name,
                            storeUrl: storeModule.baseUrl,
                            productName: productName,
                            productUrl: productUrl,
                            imageUrl: imageUrl,
                            currentPrice: currentPrice,
                            originalPrice: originalPrice,
                            discountPercent: null,
                            discountAmount: null,
                            currency: 'RUB',
                            isAvailable: true,
                            sellerId: sellerId,
                            sellerName: sellerName
                        };

                        return fm_calculateMissingValues(data);

                    } catch (e) {
                        fm_logError(storeModule.name, 'Ошибка парсинга элемента API GGSEL', e);
                        return null;
                    }
                }
            }, // --- Конец модуля GGSEL ---

            { // --- Модуль Plati.Market ---
                id: 'platimarket',
                name: 'Plati.Market',
                baseUrl: 'https://plati.market',
                apiUrlBase: 'https://api.digiseller.com/api/products/search2',
                isEnabled: true,
                fetch: async function(query) {
                    const MAX_RESULTS_PER_REQUEST = 500;

                    // --- Шаг 1: Узнаем общее количество товаров ---
                    const initialUrl = `${this.apiUrlBase}?query=${encodeURIComponent(query)}&searchmode=10&sortmode=2&pagesize=1`;
                    let totalItems = 0;

                    try {
                        const initialResponse = await new Promise((resolve, reject) => {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: initialUrl,
                                responseType: 'json',
                                timeout: FM_REQUEST_TIMEOUT_MS,
                                onload: (response) => {
                                    if (response.status >= 200 && response.status < 400 && response.response?.result?.total !== undefined) {
                                        resolve(response.response);
                                    } else {
                                        fm_logError(this.name, `Не удалось получить total_pages. Status: ${response.status}`, response);
                                        reject(new Error(`API Error: Status ${response.status}`));
                                    }
                                },
                                onerror: (error) => reject(new Error('Сетевая ошибка (initial request)')),
                                ontimeout: () => reject(new Error('Таймаут запроса (initial request)'))
                            });
                        });
                        totalItems = parseInt(initialResponse.result.total, 10);
                    } catch (error) {
                        fm_logError(this.name, 'Ошибка на шаге 1 (получение total)', error);
                        return [];
                    }

                    if (totalItems === 0) {
                        return [];
                    }

                    // --- Шаг 2: Запрашиваем все (или до MAX_RESULTS_PER_REQUEST) товары ---
                    const resultsToFetch = Math.min(totalItems, MAX_RESULTS_PER_REQUEST);
                    if (resultsToFetch <= 0) return [];

                    const finalUrl = `${this.apiUrlBase}?query=${encodeURIComponent(query)}&searchmode=10&sortmode=2&pagesize=${resultsToFetch}`;

                    try {
                        const finalResponse = await new Promise((resolve, reject) => {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: finalUrl,
                                responseType: 'json',
                                timeout: FM_REQUEST_TIMEOUT_MS * 2,
                                onload: (response) => {
                                    if (response.status >= 200 && response.status < 400 && response.response?.items?.item) {
                                        resolve(response.response);
                                    } else {
                                        fm_logError(this.name, `Не удалось получить items. Status: ${response.status}`, response);
                                        reject(new Error(`API Error: Status ${response.status}`));
                                    }
                                },
                                onerror: (error) => reject(new Error('Сетевая ошибка (final request)')),
                                ontimeout: () => reject(new Error('Таймаут запроса (final request)'))
                            });
                        });

                        return this.parseApiResponse(finalResponse.items.item, this);

                    } catch (error) {
                        fm_logError(this.name, 'Ошибка на шаге 2 (получение items)', error);
                        return [];
                    }
                },
                parseApiResponse: function(items, storeModule) {
                    const results = [];
                    if (!Array.isArray(items)) {
                        fm_logError(storeModule.name, 'Ответ API не содержит массив items', items);
                        return results;
                    }

                    items.forEach(item => {
                        try {
                            const productName = item.name;
                            const productUrlRaw = item.url;
                            const currentPrice = fm_parsePrice(item.price_rur);
                            const currency = 'RUB';
                            const sellerId = item.seller_id;
                            const sellerName = item.seller_name;

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            const productUrl = productUrlRaw + '?ai=234029';

                            const imageUrl = `https://graph.digiseller.ru/img.ashx?id_d=${item.id}&w=150&h=80`;

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: currentPrice,
                                discountPercent: 0,
                                discountAmount: 0,
                                currency: currency,
                                isAvailable: true,
                                sellerId: sellerId,
                                sellerName: sellerName
                            };
                            results.push(fm_calculateMissingValues(data));
                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента API', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Plati.Market ---

            { // --- Модуль Rushbe ---
                id: 'rushbe',
                name: 'Rushbe',
                baseUrl: 'https://rushbe.ru',
                searchUrlTemplate: 'https://rushbe.ru/gateway/api/game-center/games/catalog/search',
                isEnabled: true,
                fetch: async function(query) {
                    const storeModule = this;
                    const searchUrl = this.searchUrlTemplate;

                    const requestPayload = {
                        filter: query
                    };

                    const requestHeaders = {
                        'accept': 'application/json, text/plain, */*',
                        'content-type': 'application/json;charset=UTF-8',
                    };

                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: searchUrl,
                            headers: requestHeaders,
                            data: JSON.stringify(requestPayload),
                            responseType: 'json',
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400 && response.response) {
                                    resolve(this.parseApiResponse(response.response, storeModule));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseApiResponse: function(items, storeModule) {
                    const results = [];
                    if (!Array.isArray(items)) {
                        fm_logError(storeModule.name, 'Ответ API не является массивом', items);
                        return results;
                    }

                    items.forEach(item => {
                        try {
                            if (item.outOfStock === true) {
                                return;
                            }
                            const isSteamGame = item.activations?.some(act => act.code === 'steam');
                            if (!isSteamGame) {
                                return;
                            }

                            const productName = item.gameName?.trim();
                            const productUrlRaw = item.link ? `/games/${item.link}` : null;
                            const imageUrlRaw = item.horizontalCover?.preview;
                            const currentPrice = fm_parsePrice(item.priceWithSale);
                            const originalPrice = fm_parsePrice(item.priceWithoutSale);
                            const discountPercent = item.sale || 0;

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            if (item.hasDlc && !productName.toLowerCase().includes('dlc') && !productName.toLowerCase().includes('pack')) {}

                            const productUrl = storeModule.baseUrl + productUrlRaw;
                            const imageUrl = imageUrlRaw ? storeModule.baseUrl + imageUrlRaw : null;

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrl,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: (originalPrice && originalPrice > currentPrice) ? originalPrice : currentPrice,
                                discountPercent: discountPercent > 0 ? discountPercent : null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };

                            results.push(fm_calculateMissingValues(data));

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента API', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Rushbe ---

            { // --- Модуль Sous-Buy ---
                id: 'sousbuy',
                name: 'Sous-Buy',
                baseUrl: 'https://sous-buy.ru',
                searchUrlTemplate: 'https://sous-buy.ru/catalog?GameSearch[game]={query}&GameSearch[instock]=1&GameSearch[key]=1',
                isEnabled: true,
                fetch: async function(query) {
                    const searchUrl = this.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: searchUrl,
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400) {
                                    resolve(this.parseHtml(response.responseText, this));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseHtml: function(htmlString, storeModule) {
                    const results = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const items = doc.querySelectorAll('.product__items .product-item');

                    items.forEach(item => {
                        try {
                            const platformElement = item.querySelector('.product-item-platform');
                            if (platformElement && platformElement.textContent.trim() !== 'Steam') {
                                return;
                            }

                            const linkElement = item.querySelector('a');
                            const titleElement = item.querySelector('.cart-game-name');
                            const priceElement = item.querySelector('.new-price-game');
                            const oldPriceElement = item.querySelector('.product-item__price-old');

                            const productName = titleElement?.textContent.trim();
                            const productUrlRaw = linkElement?.getAttribute('href');
                            const currentPrice = priceElement ? fm_parsePrice(priceElement.textContent) : null;
                            const originalPrice = oldPriceElement ? fm_parsePrice(oldPriceElement.textContent) : null;

                            let imageUrl = null;
                            const bgStyle = item.style.background;
                            if (bgStyle && bgStyle.includes('url(')) {
                                const urlMatch = bgStyle.match(/url\("?(.+?)"?\)/);
                                if (urlMatch && urlMatch[1]) {
                                    imageUrl = urlMatch[1];
                                }
                            }

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: productUrlRaw.startsWith('/') ? storeModule.baseUrl + productUrlRaw : productUrlRaw,
                                imageUrl: imageUrl?.startsWith('/') ? storeModule.baseUrl + imageUrl : imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: originalPrice,
                                discountPercent: null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: true
                            };
                            results.push(fm_calculateMissingValues(data));

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента', e);
                        }
                    });
                    return results;
                }
            }, // --- Конец модуля Sous-Buy ---

            { // --- Модуль IGM.GG ---
                id: 'igmgg',
                name: 'IGM.gg',
                baseUrl: 'https://igm.gg',
                apiUrl: 'https://igm.gg/api/catalog/list',
                isEnabled: true,
                fetch: async function(query) {
                    const storeModule = this;
                    const requestPayload = {
                        limit: 20,
                        offset: 0,
                        search: query
                    };
                    const requestHeaders = {
                        'accept': 'application/json, text/plain, */*',
                        'content-type': 'application/json;charset=UTF-8',
                        "x-igm-app": "igm",
                        "x-igm-locale": "ru",
                    };

                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: storeModule.apiUrl,
                            headers: requestHeaders,
                            data: JSON.stringify(requestPayload),
                            responseType: 'json',
                            timeout: FM_REQUEST_TIMEOUT_MS,
                            onload: (response) => {
                                if (response.status >= 200 && response.status < 400 && response.response) {
                                    resolve(this.parseApiResponse(response.response, storeModule));
                                } else {
                                    reject(new Error(`HTTP статус ${response.status}`));
                                }
                            },
                            onerror: (error) => reject(new Error('Сетевая ошибка')),
                            ontimeout: () => reject(new Error('Таймаут запроса'))
                        });
                    });
                },
                parseApiResponse: function(response, storeModule) {
                    const results = [];
                    const items = response?.data?.items;
                    if (!Array.isArray(items)) {
                        fm_logError(storeModule.name, 'Ответ API не является массивом или отсутствует', response);
                        return results;
                    }

                    const useSubscriptionPrice = GM_getValue('fm_igmgg_use_subscription_price', false);

                    items.forEach(item => {
                        try {
                            const modification = item.modification;
                            if (!modification || modification.service?.name !== 'Steam') {
                                return;
                            }

                            const productName = item.name?.trim();
                            const productUrlRaw = item.slug ? `/game/${item.slug}` : null;
                            const imageUrl = item.logo?.file_url;

                            const originalPrice = fm_parsePrice(modification.price);
                            const discountPercent = parseFloat(modification.discount) || 0;

                            let currentPrice = null;

                            if (useSubscriptionPrice) {
                                if (modification.final_price_with_special_subscription_discount !== null) {
                                    currentPrice = fm_parsePrice(modification.final_price_with_special_subscription_discount);
                                } else if (modification.final_price_with_base_subscription_discount !== null) {
                                    currentPrice = fm_parsePrice(modification.final_price_with_base_subscription_discount);
                                }
                            }

                            if (currentPrice === null) {
                                currentPrice = fm_parsePrice(modification.final_price);
                            }

                            if (currentPrice === null && originalPrice !== null && discountPercent > 0) {
                                currentPrice = originalPrice * (1 - discountPercent / 100);
                            }

                            if (!productName || !productUrlRaw || currentPrice === null) {
                                return;
                            }

                            const finalOriginalPrice = (originalPrice !== null && originalPrice > currentPrice) ? originalPrice : null;

                            let data = {
                                storeId: storeModule.id,
                                storeName: storeModule.name,
                                storeUrl: storeModule.baseUrl,
                                productName: productName,
                                productUrl: storeModule.baseUrl + productUrlRaw,
                                imageUrl: imageUrl,
                                currentPrice: currentPrice,
                                originalPrice: finalOriginalPrice,
                                discountPercent: discountPercent > 0 ? discountPercent : null,
                                discountAmount: null,
                                currency: 'RUB',
                                isAvailable: item.modification.available_count > 0,
                            };

                            if (data.isAvailable) {
                                results.push(fm_calculateMissingValues(data));
                            }

                        } catch (e) {
                            fm_logError(storeModule.name, 'Ошибка парсинга элемента API', e);
                        }
                    });
                    return results;
                }
            } // --- Конец модуля IGM.GG ---
            // ... для других магазинов
        ];

        return function(gameName, selectedSteam = null) {
            fm_gameNameForSearch = gameName;
            fm_selectedSteamData = selectedSteam;
            fm_addStyles();
            fm_currentFilters = GM_getValue(FM_FILTER_STORAGE_KEY, {
                priceMin: '',
                priceMax: '',
                discountPercentMin: '',
                discountPercentMax: '',
                discountAmountMin: '',
                discountAmountMax: '',
                hasDiscount: false,
                stores: Object.fromEntries(fm_storeModules.map(s => [s.id, true]))
            });
            fm_storeModules.forEach(store => {
                if (!(store.id in fm_currentFilters.stores)) {
                    fm_currentFilters.stores[store.id] = true;
                }
            });
            fm_showModal();
        };
    })();


})();