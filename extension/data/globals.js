/* exported defaultSettings feedbackWindow */
const defaultSettings = {
    fontFamily: 'Verdana,Geneva,sans-serif',
    fontSize: '16px',
    textWidth: '45em',
    colorMode: 'light'
};

function feedbackWindow(feedbackText, feedbackKind, displayDuration, displayLocation) {
    if (!displayLocation) displayLocation = 'center';

    // Without text we can't give feedback, the feedbackKind is required to avoid problems in the future.
    if (feedbackText !== undefined && feedbackKind !== undefined) {
        const $body = $('body');

        // If there is still a previous feedback element on the page we remove it.
        $body.find('#rd-feedback-window').remove();

        // build up the html, not that the class used is directly passed from the function allowing for easy addition of other kinds.
        const $feedbackWindow = $(`<div id="rd-feedback-window" class="${feedbackKind}"><span class="rd-feedback-text">${feedbackText}</span></div>`).appendTo($body);

        switch (displayLocation) {
        case 'center': {
            const feedbackLeftMargin = ($feedbackWindow.outerWidth() / 2),
                feedbackTopMargin = ($feedbackWindow.outerHeight() / 2);

            $feedbackWindow.css({
                'margin-left': `-${feedbackLeftMargin}px`,
                'margin-top': `-${feedbackTopMargin}px`
            });
        }
            break;
        case 'bottom':
            $feedbackWindow.css({
                'left': '5px',
                'bottom': '40px',
                'top': 'auto',
                'position': 'fixed'
            });
            break;
        case 'cursor': {
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
}