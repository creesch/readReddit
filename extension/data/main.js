(function() {
    const $body = $('body');
    let locationPathname;

    // Show the overlay with readable text.
    function activateSelfPostOverlay() {
        $body.addClass('rd-overlayLoading');
        // Create the api request URL. Done like this so it will also work on reddit redesign.
        const jsonUrl = `https://old.reddit.com${location.pathname}.json`;

        $.getJSON(jsonUrl, {raw_json : 1}).done((data) => {
            if(!data[0].data.children[0].data.is_self || !data[0].data.children[0].data.selftext_html) {
                UI.feedbackText('Not a text post or no text in post', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                return;
            }

            const title = DOMPurify.sanitize(data[0].data.children[0].data.title);
            const selfTextHTML = DOMPurify.sanitize(data[0].data.children[0].data.selftext_html.match(utils.mdRegex)[1]);

            utils.commentChainDigger(data[1].data.children, data[0].data.children[0].data.author, (result) => {
                const continuedInComments = result || '';
                const content = `
                <p class="rd-readingTime">
                    <span class="rd-eta"></span> (<span class="rd-words"></span> words)
                </p>
                ${selfTextHTML}
                
                ${continuedInComments}
                `;

                UI.overlay(title, content);
            });

        });
    }

    function addIcon() {
        chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'colorMode'], function(result) {
            utils.currentSettings.fontFamily = result.fontFamily || utils.defaultSettings.fontFamily;
            utils.currentSettings.fontSize = result.fontSize || utils.defaultSettings.fontSize;
            utils.currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
            utils.currentSettings.colorMode = result.colorMode || utils.defaultSettings.colorMode;

            // Insert css that depends on variables.
            $('head').append(`
                <style>
                    #rd-textOverlay {
                        font-family: ${utils.currentSettings.fontFamily};
                        font-size: ${utils.currentSettings.fontSize};
                    }

                    #rd-mainTextContent {
                        max-width: ${utils.currentSettings.textWidth};
                    }
                    #rd-colorMode {
                        background-image: url('${chrome.runtime.getURL('data/images/moon25.png')}')
                    }
                    .rd-dark #rd-colorMode {
                        background-image: url('${chrome.runtime.getURL('data/images/sun25.png')}')
                    }
                </style>
            `);

            const $readIcon = $(`<div id="rd-readIcon"><img src="${chrome.runtime.getURL('data/images/icon48.png')}"></div>`).appendTo($body);

            $readIcon.on('click', activateSelfPostOverlay);
        });
    }

    function removeIcon() {
        $body.find('#rd-readIcon').remove();
    }

    // Show the read icon when we are viewing a post.
    function watchPushState() {
        const samePage = locationPathname === location.pathname;
        if (!samePage) {
            locationPathname = location.pathname;

            if(/^\/r\/[^/]*?\/comments\/[^/]*?\//.test(locationPathname)) {
                addIcon();
            } else {
                removeIcon();
            }
        }
        // This is done so that this also works properly on reddit redesign.
        requestAnimationFrame(watchPushState);
    }
    watchPushState();
})();
