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
                                    <a href="${comment.permalink}?context=3" target="_blank" class="rd-commentLink"><svg height="0.9em" width="0.9em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/></svg></a>
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
                        width: ${utils.currentSettings.textWidth};
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
                    window.addEventListener('rDNewThings', function () {
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
        if(!$('#header').length) {
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
