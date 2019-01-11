/** @namespace  UI */
(function (UI) {
    //--------
    // Constants
    //--------
    const $body = $('body');
    UI.FEEDBACK_NEUTRAL = 'neutral';
    UI.FEEDBACK_POSITIVE = 'positive';
    UI.FEEDBACK_NEGATIVE = 'negative';

    UI.DISPLAY_CENTER = 'center';
    UI.DISPLAY_BOTTOM = 'bottom';
    UI.DISPLAY_CURSOR = 'cursor';

    //--------
    // Overlay
    //--------
    UI.overlay = function(title, content, textOptions) {
        const colorMode = utils.currentSettings.colorMode;
        if(colorMode === 'dark') {
            $body.addClass('rd-dark');
        }

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
                    ${title}
                </h1>
                

            </div>
        </div>
        `);
        $overlay.find('#rd-mainTextContent').append(content);

        if(textOptions) {
            const $textOptions = $overlay.find('#rd-textOptions');
            textOptions.forEach((option) => {
                const optionHTML = `<div id="rd-option-${option.name}">${option.content}</div>`;
                $textOptions.append(optionHTML);
            });
        }
        requestAnimationFrame(() => {
            $body.append($overlay);
            $overlay.find('#rd-mainTextContent').readingTime({
                readingTimeTarget: '.rd-eta',
                wordCountTarget: '.rd-words'
            });
        });

        $body.removeClass('rd-overlayLoading');
        $body.addClass('rd-overlayActive');

        // Return the overlay in case we want to do more with it after creation.
        return $overlay;
    };

    // Handle overlay closing
    $body.on('click', '#rd-closeOverlay', function() {
        const $this = $(this);
        $this.closest('#rd-textOverlay').remove();
        $body.removeClass('rd-overlayActive');
    });

    // Handle color mode change. Needs to be redone if more themes are added as this does not scale at all.
    $body.on('click', '#rd-colorMode', function() {
        const $this = $(this);
        if($this.attr('data-mode') === 'light') {
            chrome.storage.local.set({'colorMode': 'dark'});
            utils.currentSettings.colorScheme = 'dark';
            $body.addClass('rd-dark');
            $this.attr('data-mode', 'dark');
        } else {
            chrome.storage.local.set({'colorMode': 'light'});
            utils.currentSettings.colorScheme = 'light';
            $body.removeClass('rd-dark');
            $this.attr('data-mode', 'light');
        }
    });

    //--------
    // Feedback popup.
    //--------
    UI.feedbackText = function(feedbackText, feedbackKind, displayDuration, displayLocation) {
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
                const feedbackLeftMargin = ($feedbackWindow.outerWidth() / 2),
                    feedbackTopMargin = ($feedbackWindow.outerHeight() / 2);

                $feedbackWindow.css({
                    'margin-left': `-${feedbackLeftMargin}px`,
                    'margin-top': `-${feedbackTopMargin}px`
                });
            }
                break;
            case UI.DISPLAY_BOTTOM:
                $feedbackWindow.css({
                    'left': '5px',
                    'bottom': '40px',
                    'top': 'auto',
                    'position': 'fixed'
                });
                break;
            case UI.DISPLAY_CURSOR: {
                $(document).mousemove(function (e) {
                    const posX = e.pageX,
                        posY = e.pageY;

                    $feedbackWindow.css({
                        left: posX - $feedbackWindow.width() + 155,
                        top: posY - $feedbackWindow.height() - 15,
                        'position': 'fixed'
                    });
                });
            }
                break;
            }

            // And fade out nicely after 3 seconds.
            $feedbackWindow.delay(displayDuration ? displayDuration : 3000).fadeOut();
        }
    };
}(UI = window.UI || {}));