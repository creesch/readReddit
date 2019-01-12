(function() {
    const $body = $('body');
    let locationPathname;

    // Show the overlay with readable text.
    function activateSelfPostOverlay(type) {
        $body.addClass('rd-overlayLoading');
        // Create the api request URL. Done like this so it will also work on reddit redesign.
        const jsonUrl = `https://old.reddit.com${location.pathname}.json`;

        $.getJSON(jsonUrl, {raw_json : 1}).done((data) => {
            // Handle self post
            if(type === 'post') {
                if(!data[0].data.children[0].data.is_self || !data[0].data.children[0].data.selftext_html) {
                    UI.feedbackText('Not a text post or no text in post', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                    $body.removeClass('rd-overlayLoading');
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

                    UI.overlay(title, content, '#rd-mainTextContent');
                });
            }

            if(type === 'comments') {
                // Handle comments
                if(!data[1].data.children.length) {
                    UI.feedbackText('No comments to load', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                    $body.removeClass('rd-overlayLoading');
                    return;
                }

                utils.commentSection(data[1].data.children, (result) => {
                    const title = DOMPurify.sanitize(data[0].data.children[0].data.title);
                    const $overlay = UI.overlay(title, `<div id="rd-commentCount">${result.length} comment${result.length > 1 ? `s` : ``}</div>`, false);
                    const $content = $overlay.find('#rd-mainTextContent');
                    result.forEach((comment, index) => {
                        const $storyHTML = $(`
                            <div id="rd-comment-${index}" class="rd-comment">
                                <h2>Comment by ${comment.author}</h2>
                                <p class="rd-readingTime">
                                    <span class="rd-eta"></span> (<span class="rd-words"></span> words)
                                </p>
                                ${DOMPurify.sanitize(comment.text)}
                            </div>
                        `);

                        requestAnimationFrame(() => {
                            $content.append($storyHTML);
                            $content.find(`#rd-comment-${index}`).readingTime({
                                readingTimeTarget: '.rd-eta',
                                wordCountTarget: '.rd-words'
                            });
                        });
                    });
                });
            }
        });
    }

    function addIcon() {
        chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'colorMode'], function(result) {
            utils.currentSettings.fontFamily = result.fontFamily || utils.defaultSettings.fontFamily;
            utils.currentSettings.fontSize = result.fontSize || utils.defaultSettings.fontSize;
            utils.currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
            utils.currentSettings.colorMode = result.colorMode || utils.defaultSettings.colorMode;

            $body.addClass(`rd-${utils.currentSettings.colorMode}`);

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
                </style>
            `);

            const $readIcon = $(`
                <div id="rd-readButton">
                    <div id="rd-buttonPost">
                    Text post
                    </div>
                <div id="rd-readIcon">
                    <img src="${chrome.runtime.getURL('data/images/icon48.png')}">
                </div>
                    <div id="rd-buttonComments">
                    Comments
                    </div>
                </div>
            `).appendTo($body);

            $readIcon.on('click', '#rd-buttonPost', () => {
                activateSelfPostOverlay('post');
            });

            $readIcon.on('click', '#rd-buttonComments', () => {
                activateSelfPostOverlay('comments');
            });
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
