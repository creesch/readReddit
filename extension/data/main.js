(function() {
    const $body = $('body');
    const mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
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
        const colorMode = window.localStorage.getItem('colorMode') || 'light';



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
                    <input type="checkbox" id="rd-colorMode">
                    <img id="rd-iconSun" src="${chrome.runtime.getURL('data/images/sun25.png')}">
                    <img id="rd-iconMoon" src="${chrome.runtime.getURL('data/images/moon25.png')}">
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

            if(colorMode === 'dark') {
                $body.addClass('rd-dark');
                $overlay.find('#rd-iconMoon').hide();
                $overlay.find('#rd-colorMode').prop('checked', true);
            } else {
                $overlay.find('#rd-iconSun').hide();
            }

            $body.append($overlay);

            $overlay.on('change', '#rd-colorMode', function() {
                const $this = $(this);
                if($this.prop('checked')) {
                    window.localStorage.setItem('colorMode', 'dark');
                    $body.addClass('rd-dark');
                    $overlay.find('#rd-iconSun').show();
                    $overlay.find('#rd-iconMoon').hide();
                } else {
                    window.localStorage.setItem('colorMode', 'light');
                    $body.removeClass('rd-dark');
                    $overlay.find('#rd-iconSun').hide();
                    $overlay.find('#rd-iconMoon').show();
                }
            });

            $overlay.on('click', '#rd-closeOverlay', () => {
                $overlay.remove();
                $body.removeClass('rd-overlayActive');
            });
        });
    }

    function addIcon() {
        const $body = $('body');
        const $readIcon = $(`<div id="rd-readIcon"><img src="${chrome.runtime.getURL('data/images/icon48.png')}"></div>`).appendTo($body);

        $readIcon.on('click', activateOverlay);
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
