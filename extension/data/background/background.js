'use strict';

/**
 * Creates a URL query string from the given parameters.
 * @function
 * @param {object} parameters An object of parameters
 * @returns {string}
 */
function queryString (parameters) {
    if (!parameters) {
        return '';
    }
    const kvStrings = [];
    for (const [k, v] of Object.entries(parameters)) {
        if (v !== undefined && v !== null) {
            kvStrings.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
        }
    }
    if (!kvStrings.length) {
        return '';
    }
    return `?${kvStrings.join('&')}`;
}

function doFetch (url, options, callback) {
    let query = queryString(options);
    // If we have a query object and additional parameters in the endpoint, we
    // just stick the object parameters on the end with `&` instead of `?`, and
    // duplicate keys in the final URL are fine (consistent with jQuery)
    if (url.includes('?')) {
        query = query.replace('?', '&');
    }

    const fetchURL = `${url}${query}`;

    const fetchOptions = {
        credentials: 'include', // required for cookies to be sent
        redirect: 'error', // prevents strange reddit API shenanigans
        method: 'GET',
        cache: 'no-store',
    };

    fetch(fetchURL, fetchOptions)
        .then(response => response.json())
        .then(callback);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('background request:', request);

    if (request.action === 'globalMessage') {
        const message = {
            action: request.globalEvent,
        };

        chrome.tabs.query({}, tabs => {
            for (let i = 0; i < tabs.length; ++i) {
                if (sender.tab.id !== tabs[i].id) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            }
        });
    }

    if (request.action === 'openChangelog') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('data/options/changelog.html'),
        });
    }

    if (request.action === 'backgroundGetJSON') {
        const url = request.details.url;
        const options = request.details.options;

        doFetch(url, options, data => {
            console.log(data);
            sendResponse(data);
        });
    }

    if (request.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
    }
    return true;
});
