/** @namespace  utils */
(function (utils) {

    utils.mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
    utils.pathRegex = /^\/r\/[^/]*?\/comments\/[^/]*?\//;

    utils.defaultSettings = {
        fontFamily: 'Verdana,Geneva,sans-serif',
        fontSize: '16px',
        textWidth: '45em',
        colorMode: 'light'
    };

    utils.currentSettings = {};

    let observerActive = false;
    utils.domObserver = function() {
        if(observerActive) {
            return;
        }

        observerActive = true;
        let newThingRunning = false;
        // NER, load more comments, etc
        const target = document.querySelector('div.content');

        // create an observer instance
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                const $target = $(mutation.target), $parentNode = $(mutation.target.parentNode);
                if (!($target.hasClass('sitetable') && ($target.hasClass('nestedlisting') || $target.hasClass('listing') || $target.hasClass('linklisting') ||
                $target.hasClass('modactionlisting'))) && !$parentNode.hasClass('morecomments') && !$target.hasClass('flowwit')) return;

                // It is entirely possible that rDNewThings is fired multiple times.
                // That is why we only set a new timeout if there isn't one set already.
                if(!newThingRunning) {
                    newThingRunning = true;
                    // Wait a sec for stuff to load.
                    setTimeout(function () {
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
            subtree: true
        };

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    };

    utils.commentChainDigger = function(commentArray, authorName, callback) {
        chrome.runtime.sendMessage({
            action: 'commentChainDigger',
            details: {
                commentArray: commentArray,
                authorName: authorName
            }
        }, function(response) {
            return callback(response.comments);

        });
    };

    utils.commentSection = function(options, callback) {
        chrome.runtime.sendMessage({
            action: 'commentSection',
            details: {
                commentArray: options.commentArray,
                modOverride: options.modOverride
            }
        }, function(response) {
            return callback(response.comments);
        });
    };
}(utils = window.utils || {}));
