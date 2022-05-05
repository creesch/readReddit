'use strict';
/** @namespace  UI */
(function (UI) {
    // --------
    // Constants
    // --------
    const $body = $('body');
    UI.FEEDBACK_NEUTRAL = 'neutral';
    UI.FEEDBACK_POSITIVE = 'positive';
    UI.FEEDBACK_NEGATIVE = 'negative';

    UI.DISPLAY_CENTER = 'center';
    UI.DISPLAY_BOTTOM = 'bottom';
    UI.DISPLAY_CURSOR = 'cursor';

    // --------
    // Overlay
    // --------
    UI.overlay = function (title, content, readTimeElement, textOptions) {
        const colorMode = utils.currentSettings.colorMode;

        const $overlay = $(`
        <div id="rd-textOverlay">
            <div id="rd-closeOverlay">
                <svg class="rd-close" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z" class=""></path></svg>
            </div>
            <div id="rd-textOptions">
                <div id="rd-colorMode" data-mode="${colorMode}">
                    <svg class="rd-sun" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"/></svg>
                    <svg class="rd-moon" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>
                </div>
                <div id="rd-settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z"/></svg>
                </div>
            </div>
            <div id="rd-mainTextContent">
                <h1 id="rd-title">
                    ${title}
                </h1>
            </div>
            <div id="rd-overlayFooter">
                <div id="rd-doneButton">Done</div>
            </div>
        </div>
        `);
        $overlay.find('#rd-mainTextContent').append(content);

        if (textOptions) {
            const $textOptions = $overlay.find('#rd-textOptions');
            textOptions.forEach(option => {
                const optionHTML = `<div id="rd-option-${option.name}">${option.content}</div>`;
                $textOptions.append(optionHTML);
            });
        }
        requestAnimationFrame(() => {
            $body.append($overlay);

            if (readTimeElement) {
                $overlay.find(readTimeElement).readingTime({
                    readingTimeTarget: '.rd-eta',
                    wordCountTarget: '.rd-words',
                });
            }
        });

        $body.removeClass('rd-overlayLoading');
        document.body.style.cursor = '';
        $body.addClass('rd-overlayActive');

        // Handle overlay closing
        $overlay.on('click', '#rd-closeOverlay, #rd-doneButton', () => {
            $overlay.remove();
            $body.removeClass('rd-overlayActive');
        });

        $(document).keyup(e => {
            if (e.key === 'Escape') { // escape key maps to keycode `27`
                $overlay.remove();
                $body.removeClass('rd-overlayActive');
            }
        });

        // Open settomgs
        $overlay.on('click', '#rd-settings', () => {
            chrome.runtime.sendMessage({
                action: 'openOptions',
            });
        });

        // Handle color mode change. Needs to be redone if more themes are added as this does not scale at all.
        $overlay.on('click', '#rd-colorMode', function () {
            const $this = $(this);
            if ($this.attr('data-mode') === 'light') {
                chrome.storage.local.set({colorMode: 'dark'});
                utils.currentSettings.colorScheme = 'dark';
                $body.removeClass('rd-light');
                $body.addClass('rd-dark');
                $this.attr('data-mode', 'dark');
            } else {
                chrome.storage.local.set({colorMode: 'light'});
                utils.currentSettings.colorScheme = 'light';
                $body.removeClass('rd-dark');
                $body.addClass('rd-light');
                $this.attr('data-mode', 'light');
            }
        });

        // Return the overlay in case we want to do more with it after creation.
        return $overlay;
    };

    // --------
    // Feedback popup.
    // --------
    UI.feedbackText = function (feedbackText, feedbackKind, displayDuration, displayLocation) {
        if (!displayLocation) {
            displayLocation = UI.DISPLAY_CENTER;
        }

        // Without text we can't give feedback, the feedbackKind is required to avoid problems in the future.
        if (feedbackText !== undefined && feedbackKind !== undefined) {
            const $body = $('body');

            // If there is still a previous feedback element on the page we remove it.
            $body.find('#rd-feedback-window').remove();

            // build up the html, not that the class used is directly passed from the function allowing for easy addition of other kinds.
            const $feedbackWindow = $(`<div id="rd-feedback-window" class="${feedbackKind}"><span class="rd-feedback-text">${feedbackText}</span></div>`).appendTo($body);

            switch (displayLocation) {
            case UI.DISPLAY_CENTER: {
                const feedbackLeftMargin = $feedbackWindow.outerWidth() / 2,
                      feedbackTopMargin = $feedbackWindow.outerHeight() / 2;

                $feedbackWindow.css({
                    'margin-left': `-${feedbackLeftMargin}px`,
                    'margin-top': `-${feedbackTopMargin}px`,
                });
            }
                break;
            case UI.DISPLAY_BOTTOM:
                $feedbackWindow.css({
                    left: '5px',
                    bottom: '40px',
                    top: 'auto',
                    position: 'fixed',
                });
                break;
            case UI.DISPLAY_CURSOR: {
                $(document).mousemove(e => {
                    const posX = e.pageX,
                          posY = e.pageY;

                    $feedbackWindow.css({
                        left: posX - $feedbackWindow.width() + 155,
                        top: posY - $feedbackWindow.height() - 15,
                        position: 'fixed',
                    });
                });
            }
                break;
            }

            // And fade out nicely after 3 seconds.
            $feedbackWindow.delay(displayDuration ? displayDuration : 3000).fadeOut();
        }
    };

    // --------
    // Process inline links in an element.
    // --------
    UI.processInlineLinks = function ($textBlock) {
        const $aElements = $textBlock.find('a:not(.rd-commentLink)');
        const collectInlineLinks = utils.currentSettings.collectInlineLinks;

        if ($aElements.length) {
            let $inlineLinks;
            if (collectInlineLinks) {
                $inlineLinks = $('<ul class="rd-inlineLinks">').appendTo($textBlock);
            }

            $aElements.each(function () {
                const $this = $(this);
                const href = $this.attr('href');
                const thisRedditHref = href.match(utils.redditLinkRegex);

                if (thisRedditHref && thisRedditHref[2]) {
                    $this.data('linkType', 'comments');
                    $this.data('postID', thisRedditHref[1]);
                    $this.data('commentID', thisRedditHref[2]);
                    $this.addClass('rd-reddit-url');
                } else if (thisRedditHref) {
                    $this.data('linkType', 'post');
                    $this.data('postID', thisRedditHref[1]);
                    $this.addClass('rd-reddit-url');
                } else if (href.startsWith('https://redd.it/')) {
                    $this.data('linkType', 'post');
                    $this.data('postID', href.replace('https://redd.it/', ''));
                    $this.addClass('rd-reddit-url');
                }

                if (collectInlineLinks) {
                    const $thisClone = $this.clone(true);
                    $inlineLinks.append($('<li>').append($thisClone));
                }
            });
        }
    };
})(window.UI = window.UI || {});
