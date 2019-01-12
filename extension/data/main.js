(function() {
    const $body = $('body');
    let locationPathname;
    let firstInit = true;

    // Show the overlay with readable text.
    function activateSelfPostOverlay(options) {
        $body.addClass('rd-overlayLoading');
        // Create the api request URL. Done like this so it will also work on reddit redesign.
        let jsonUrl;
        if(!options.permalink) {
            jsonUrl = `https://old.reddit.com${location.pathname}.json`;
        } else {
            jsonUrl = `${options.permalink}.json`;
        }

        $.getJSON(jsonUrl, {raw_json : 1}).done((data) => {
            // Handle self post
            if(options.type === 'post') {
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

            if(options.type === 'comments') {
                // Handle comments
                if(!data[1].data.children.length) {
                    UI.feedbackText('No comments to load', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                    $body.removeClass('rd-overlayLoading');
                    return;
                }

                utils.commentSection({
                    commentArray: data[1].data.children,
                    modOverride: options.modOverride
                }, (result) => {
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
                activateSelfPostOverlay({type: 'post'});
            });

            $readIcon.on('click', '#rd-buttonComments', () => {
                activateSelfPostOverlay({type: 'comments'});
            });
        });
    }

    function readLinkComments() {
        const $things = $('.thing:not(.rd-seen)');
        $things.each(function() {
            const $thing = $(this);
            if(!$thing.hasClass('rd-seen')) {
                $thing.addClass('rd-seen');
                const permalink = $thing.find('a.bylink').attr('href') || $thing.find('.buttons:first .first a').attr('href');
                const author = $thing.find('.author:first').text();
                if(author) {
                    $thing.find('.flat-list.buttons').eq(0).append(`
                        <li>
                            <a href="javascript:;" class="rd-commentRead" data-permalink="${permalink}">read</a>
                        </li>
                    `);
                }

            }
        });
    }

    function readLinkCommentsRedesign() {
        console.log('readLinkCommentsRedesign fired');
        redesignListener.on('comment', function(e) {
            const $target = $(e.target);
            const commentID = e.detail.data.id.substring(3);
            const postID = e.detail.data.post.id.substring(3);
            const subreddit = e.detail.data.subreddit.name;
            const permalink = `https://old.reddit.com/r/${subreddit}/comments/${postID}/-/${commentID}/`;

            $target.append(`<a href="javascript:;" class="rd-commentReadRedesign" data-permalink="${permalink}">read</a>`);
        });

        $body.on('click', '.rd-commentReadRedesign', function() {
            const permalink = $(this).attr('data-permalink');
            activateSelfPostOverlay({type: 'comments', permalink: permalink, modOverride: true});
        });
    }

    function removeIcon() {
        $body.find('#rd-readIcon').remove();
    }

    // Show the read icon when we are viewing a post.

    function initCheck() {
        const samePage = locationPathname === location.pathname;
        if (!samePage) {
            locationPathname = location.pathname;

            if(utils.pathRegex.test(locationPathname)) {
                addIcon();

                // Check if we are on old reddit and have comments that might
                if($('.thing').length) {
                    readLinkComments();
                    utils.domObserver();
                    window.addEventListener('TBNewThings', function () {
                        readLinkComments();
                    });

                    $body.on('click', '.rd-commentRead', function() {
                        const permalink = $(this).attr('data-permalink');
                        activateSelfPostOverlay({type: 'comments', permalink: permalink, modOverride: true});
                    });

                }
            } else {
                removeIcon();
            }
        }
        // This is done so that this also works properly on reddit redesign.
        if(!$('#siteTable').length) {
            if(firstInit) {
                console.log('first init');
                redesignListener.start();
                readLinkCommentsRedesign();
                firstInit = false;
            }
            requestAnimationFrame(initCheck);
        }

    }
    initCheck();
})();
