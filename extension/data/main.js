'use strict';
(function () {
    const $body = $('body');
    let locationPathname;
    let firstInit = true;
    let $activeOverlay;

    // Show the overlay with readable text.
    function activateSelfPostOverlay (options) {
        $body.addClass('rd-overlayLoading');
        document.body.style.cursor = 'wait';
        // Create the api request URL. Done like this so it will also work on reddit redesign.
        let jsonUrl;
        if (!options.permalink) {
            jsonUrl = `https://old.reddit.com${location.pathname}.json`;
        } else {
            jsonUrl = `${options.permalink}.json`;
        }

        utils.backgroundGetJSON(jsonUrl, {raw_json: 1}, data => {
            console.log(data);
            // Handle self post
            if (options.type === 'post') {
                if (!data[0].data.children[0].data.is_self || !data[0].data.children[0].data.selftext_html) {
                    UI.feedbackText('Not a text post or no text in post', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                    $body.removeClass('rd-overlayLoading');
                    document.body.style.cursor = '';
                    return;
                }

                const title = DOMPurify.sanitize(data[0].data.children[0].data.title);
                const selfTextHTML = DOMPurify.sanitize(data[0].data.children[0].data.selftext_html.match(utils.mdRegex)[1]);

                const continuedInComments = utils.commentChainDigger(data[1].data.children, data[0].data.children[0].data.author, false) || '';

                const content = `
                <p class="rd-readingTime">
                    <span class="rd-eta"></span> (<span class="rd-words"></span> words)
                </p>
                ${selfTextHTML}

                ${continuedInComments}
                `;

                const $overlay = UI.overlay(title, content, '#rd-mainTextContent');

                if (options.update) {
                    $activeOverlay.remove();
                }
                $activeOverlay = $overlay;
                const $content = $overlay.find('#rd-mainTextContent');

                UI.processInlineLinks($content);
            }

            if (options.type === 'comments') {
                // Handle comments
                if (!data[1].data.children.length) {
                    UI.feedbackText('No comments to load', UI.FEEDBACK_NEGATIVE, 3000, UI.DISPLAY_CURSOR);
                    $body.removeClass('rd-overlayLoading');
                    document.body.style.cursor = '';
                    return;
                }

                const result = utils.commentSection(data[1].data.children, options.modOverride);

                const title = DOMPurify.sanitize(data[0].data.children[0].data.title);
                const $overlay = UI.overlay(title, `<div id="rd-commentCount">${result.length} comment${result.length > 1 ? 's' : ''}</div>`, false);
                if (options.update) {
                    $activeOverlay.remove();
                }
                $activeOverlay = $overlay;
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
                            wordCountTarget: '.rd-words',
                        });
                        UI.processInlineLinks($storyHTML);
                    });
                });
            }
        });
    }

    // Open reddit links automatically in overlay.
    $body.on('click', '.rd-reddit-url', event => {
        // Only open links if the appropriate setting is enabled.
        if (!utils.currentSettings.openRedditLinksInOverlay) {
            return;
        }
        // Do not act when the link is supposed to be opened in the tab.
        if (event.ctrlKey || event.metaKey) {
            return;
        }

        // relevant data.
        const $linkElement = $(event.currentTarget);
        const linkType = $linkElement.data('linkType');
        const postID = $linkElement.data('postID');
        let permalink;

        // Make sure we actually have the data we need.
        if (linkType !== 'post' && linkType !== 'comments') {
            return;
        }

        // At this point we can disable the default behavior and hand it over to the overlay.
        event.preventDefault();

        if (linkType === 'post') {
            permalink = `https://old.reddit.com/comments/${postID}`;
        }

        if (linkType === 'comments') {
            const commentID = $linkElement.data('commentID');
            permalink = `https://old.reddit.com/comments/${postID}/-/${commentID}`;
        }

        activateSelfPostOverlay({
            type: linkType,
            update: true,
            permalink,
        });
    });

    function addIcon () {
        chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'lineHeight', 'colorMode', 'seenVersion', 'textAlign', 'collectInlineLinks', 'openRedditLinksInOverlay'], result => {
            utils.currentSettings.fontFamily = result.fontFamily || utils.defaultSettings.fontFamily;
            utils.currentSettings.fontSize = result.fontSize || utils.defaultSettings.fontSize;
            utils.currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
            utils.currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
            utils.currentSettings.lineHeight = result.lineHeight || utils.defaultSettings.lineHeight;
            utils.currentSettings.colorMode = result.colorMode || utils.defaultSettings.colorMode;
            utils.currentSettings.collectInlineLinks = result.collectInlineLinks === undefined ? utils.defaultSettings.collectInlineLinks : result.collectInlineLinks;
            utils.currentSettings.openRedditLinksInOverlay = result.openRedditLinksInOverlay === undefined ? utils.defaultSettings.openRedditLinksInOverlay : result.openRedditLinksInOverlay;
            utils.currentSettings.seenVersion = result.seenVersion || utils.defaultSettings.seenVersion;
            utils.currentSettings.textAlign = result.textAlign || utils.defaultSettings.textAlign;

            if (utils.manifest.version !== utils.currentSettings.seenVersion) {
                $body.addClass('rd-updated');
            }
            $body.addClass(`rd-${utils.currentSettings.colorMode}`);

            // Insert css that depends on variables.
            $('head').append(`
                <style>
                    #rd-textOverlay {
                        font-family: ${utils.currentSettings.fontFamily};
                        font-size: ${utils.currentSettings.fontSize};
                    }

                    #rd-overlayFooter,
                    #rd-mainTextContent {
                        width: ${utils.currentSettings.textWidth};
                        text-align: ${utils.currentSettings.textAlign};
                    }

                    #rd-textOverlay p,
                    #rd-textOverlay th,
                    #rd-textOverlay td,
                    #rd-textOverlay li {
                        line-height: ${utils.currentSettings.lineHeight};
                    }
                </style>
            `);

            const $readIcon = $(`
                <div id="rd-readButton">
                    <div id="rd-buttonPost">
                        Text post
                    </div>
                    <div id="rd-updated">
                        <span id="rd-changelog">
                            changelog
                        </span>
                        <span id="rd-dismissUpdated">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14px" height="14px">
                                <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z" class=""></path>
                            </svg>
                        </span>
                        <span id="rd-updatedExclamation">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="14px" width="14px">
                                <path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
                            </svg>
                        </span>
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

            $readIcon.on('click', '#rd-dismissUpdated', () => {
                utils.dismissUpdate();
            });

            $readIcon.on('click', '#rd-changelog', () => {
                utils.openChangelog();
            });
        });
    }

    function readLinkComments () {
        const $things = $('.thing.comment:not(.rd-seen)');
        $things.viewportChecker({
            classToAdd: 'rd-seen',
            callbackFunction (thing) {
                const $thing = $(thing);
                const permalink = $thing.find('a.bylink').attr('href') || $thing.find('.buttons:first .first a').attr('href');
                const author = $thing.find('.author:first').text();
                if (author) {
                    requestAnimationFrame(() => {
                        $thing.find('.flat-list.buttons').eq(0).append(`
                            <li class="rd-flatlistButton">
                                <a href="javascript:;" class="rd-commentRead" data-permalink="${permalink}">read</a>
                            </li>
                        `);
                    });
                }
            },
        });
    }

    function readLinkCommentsRedesign () {
        console.log('readLinkCommentsRedesign fired');
        redesignListener.on('comment', e => {
            const $target = $(e.target);
            const commentID = e.detail.data.id.substring(3);
            const postID = e.detail.data.post.id.substring(3);
            const subreddit = e.detail.data.subreddit.name;
            const permalink = `https://old.reddit.com/r/${subreddit}/comments/${postID}/-/${commentID}/`;

            $target.append(`<a href="javascript:;" class="rd-commentReadRedesign" data-permalink="${permalink}">read</a>`);
        });

        $body.on('click', '.rd-commentReadRedesign', function () {
            const permalink = $(this).attr('data-permalink');
            activateSelfPostOverlay({type: 'comments', permalink, modOverride: true});
        });
    }

    function removeIcon () {
        $body.find('#rd-readIcon').remove();
    }

    // Show the read icon when we are viewing a post.

    function initCheck () {
        const samePage = locationPathname === location.pathname;
        if (!samePage) {
            locationPathname = location.pathname;

            if (utils.pathRegex.test(locationPathname)) {
                addIcon();

                // We are on old reddit, start watching for future comments.
                if ($('#header').length) {
                    utils.domObserver();
                    window.addEventListener('rDNewThings', () => {
                        readLinkComments();
                    });
                }

                // Check if we are on old reddit and have comments that might need to be watched.
                if ($('.thing.comment').length) {
                    readLinkComments();
                    $body.on('click', '.rd-commentRead', function () {
                        const permalink = $(this).attr('data-permalink');
                        activateSelfPostOverlay({type: 'comments', permalink, modOverride: true});
                    });
                }
            } else {
                removeIcon();
            }
        }
        // This is done so that this also works properly on reddit redesign.
        if (!$('#header').length) {
            if (firstInit) {
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
