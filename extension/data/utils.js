'use strict';
/** @namespace  utils */
(function (utils) {
    utils.manifest = chrome.runtime.getManifest();
    utils.mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
    utils.pathRegex = /^\/(r|user)\/[^/]*?\/comments\/[^/]*?\//;
    utils.redditLinkRegex = /(?:^|reddit\.com)\/(?:r|user)\/[^/]*?\/comments\/([^/]+)\/?(?:[^/]+\/)?([^?/]+)?/;

    utils.defaultSettings = {
        fontFamily: 'Verdana,Geneva,sans-serif',
        fontSize: '16px',
        textWidth: '45em',
        lineHeight: '1.4em',
        colorMode: 'light',
        collectInlineLinks: true,
        openRedditLinksInOverlay: true,
        seenVersion: 'none',
        textAlign: 'left',
    };

    utils.currentSettings = {};

    // Dom observer, for adding read buttons to comments.
    let observerActive = false;
    utils.domObserver = function () {
        if (observerActive) {
            return;
        }

        observerActive = true;
        let newThingRunning = false;
        // NER, load more comments, etc
        const target = document.querySelector('div.content');

        // create an observer instance
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                const $target = $(mutation.target), $parentNode = $(mutation.target.parentNode);
                if (!($target.hasClass('sitetable') && ($target.hasClass('nestedlisting') || $target.hasClass('listing') || $target.hasClass('linklisting'))) && !$parentNode.hasClass('morecomments') && !$target.hasClass('flowwit')) {
                    return;
                }

                // It is entirely possible that rDNewThings is fired multiple times.
                // That is why we only set a new timeout if there isn't one set already.
                if (!newThingRunning) {
                    newThingRunning = true;
                    // Wait a sec for stuff to load.
                    setTimeout(() => {
                        newThingRunning = false;
                        const event = new CustomEvent('rDNewThings');
                        window.dispatchEvent(event);
                    }, 1000);
                }
            });
        });

        // configuration of the observer:
        // We specifically want all child elements but nothing else.
        const config = {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true,
        };

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    };

    // do get requests through the background page so Chrome doesn't break.
    utils.backgroundGetJSON = function (url, options = {}, callback) {
        chrome.runtime.sendMessage({
            action: 'backgroundGetJSON',
            details: {
                url,
                options,
            },
        }, response => callback(response));
    };

    // Digg through a comment chain to attach all comments by OP
    utils.commentChainDigger = function (commentArray, authorName, callback) {
        chrome.runtime.sendMessage({
            action: 'commentChainDigger',
            details: {
                commentArray,
                authorName,
            },
        }, response => callback(response.comments));
    };

    // Go through all top level comments provided digg through the chain for each.
    utils.commentSection = function (options, callback) {
        chrome.runtime.sendMessage({
            action: 'commentSection',
            details: {
                commentArray: options.commentArray,
                modOverride: options.modOverride,
            },
        }, response => callback(response.comments));
    };

    function dismissUpdate () {
        $('body').removeClass('rd-updated');

        utils.currentSettings.seenVersion = utils.manifest.version;
        chrome.storage.local.set({seenVersion: utils.currentSettings.seenVersion});

        chrome.runtime.sendMessage({
            action: 'globalMessage',
            globalEvent: 'dismissUpdate',
        });
    }
    utils.dismissUpdate = dismissUpdate;

    utils.openChangelog = function () {
        chrome.runtime.sendMessage({
            action: 'openChangelog',
        });
        dismissUpdate();
    };

    // Handle background messages.
    chrome.runtime.onMessage.addListener(message => {
        if (message.action === 'dismissUpdate') {
            $('body').removeClass('rd-updated');
        }
    });
})(window.utils = window.utils || {});
