(function() {
    const $body = $('body');
    const mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
    const currentSettings = {};
    let locationPathname;

    function handleComments(commentArray, authorName) {
        let comments = '';
        // Probably not needed at all, but let's make extra sure things are in posting order.
        commentArray.sort(function(a, b) {
            return a.data.created_utc - b.data.created_utc;
        });

        commentArray.forEach((comment) => {
            if(comment.data.author === authorName) {
                const selfTextHTML = `
                <span class="rd-commentText">
                    ${DOMPurify.sanitize(comment.data.body_html.match(mdRegex)[1])}
                </span>
                `;
                comments = `${comments}${selfTextHTML}`;

                if(comment.data.replies) {
                    comments = `${comments}${handleComments(comment.data.replies.data.children, authorName)}`;
                }
            }
        });

        return comments;
    }

    // Show the overlay with readable text.
    function activateOverlay() {
        const colorMode = currentSettings.colorMode;
        if(colorMode === 'dark') {
            $body.addClass('rd-dark');
        }
        $body.addClass('rd-overlayActive');
        // Create the api request URL. Done like this so it will also work on reddit redesign.
        const jsonUrl = `https://old.reddit.com${location.pathname}.json`;
        console.log(jsonUrl);
        $.getJSON(jsonUrl, {raw_json : 1}).done((data) => {

            const selfTextHTML = DOMPurify.sanitize(data[0].data.children[0].data.selftext_html.match(mdRegex)[1]);

            const continuedInComments = handleComments(data[1].data.children, data[0].data.children[0].data.author);

            const $overlay = $(`
            <div id="rd-textOverlay">
                <div id="rd-closeOverlay">
                ✕
                </div>
                <div id="rd-textOptions">
                    <div id="rd-colorMode" data-mode="${colorMode}">
                    </div>
                </div>
                <div id="rd-mainTextContent">
                    <h1 id="rd-title">
                        ${DOMPurify.sanitize(data[0].data.children[0].data.title)}
                    </h1>
                    ${selfTextHTML}

                    ${continuedInComments}
                </div>
            </div>
            `);

            $body.append($overlay);

            // Changing color mode. Needs to be redone if more themes are added as this does not scale at all.
            $overlay.on('click', '#rd-colorMode', function() {
                const $this = $(this);
                if($this.attr('data-mode') === 'light') {
                    chrome.storage.local.set({'colorMode': 'dark'});
                    currentSettings.colorScheme = 'dark';
                    $body.addClass('rd-dark');
                    $this.attr('data-mode', 'dark');
                } else {
                    chrome.storage.local.set({'colorMode': 'light'});
                    currentSettings.colorScheme = 'light';
                    $body.removeClass('rd-dark');
                    $this.attr('data-mode', 'light');
                }
            });

            $overlay.on('click', '#rd-closeOverlay', () => {
                $overlay.remove();
                $body.removeClass('rd-overlayActive');
            });
        });
    }

    function addIcon() {
        chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'colorMode'], function(result) {
            currentSettings.fontFamily = result.fontFamily || defaultSettings.fontFamily;
            currentSettings.fontSize = result.fontSize || defaultSettings.fontSize;
            currentSettings.textWidth = result.textWidth || defaultSettings.textWidth;
            currentSettings.colorMode = result.colorMode || defaultSettings.colorMode;

            // Insert css that depends on variables.
            $('head').append(`
                <style>
                    #rd-textOverlay {
                        font-family: ${currentSettings.fontFamily};
                        font-size: ${currentSettings.fontSize};
                    }

                    #rd-mainTextContent {
                        max-width: ${currentSettings.textWidth};
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

            $readIcon.on('click', activateOverlay);
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
