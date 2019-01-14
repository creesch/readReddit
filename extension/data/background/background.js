const mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
function commentChainDigger(commentArray, authorName, modOverride) {
    let comments = '';
    // Probably not needed at all, but let's make extra sure things are in posting order.
    commentArray.sort(function(a, b) {
        return a.data.created_utc - b.data.created_utc;
    });

    commentArray.forEach((comment) => {
        if(comment.kind !== 't1' && comment.data.banned_by || comment.data.author !== authorName) {
            return;
        }

        if((comment.data.stickied || comment.data.distinguished) && !modOverride) {
            return;
        }
        const selfTextHTML = `
        <span class="rd-commentText">
            ${DOMPurify.sanitize(comment.data.body_html.match(mdRegex)[1])}
        </span>
        `;
        comments = `${comments}${selfTextHTML}`;

        if(comment.data.replies) {
            comments = `${comments}${commentChainDigger(comment.data.replies.data.children, authorName)}`;
        }

    });

    return comments;
}

function commentSection(commentArray, modOverride) {
    const returnArray = [];

    commentArray.forEach((comment) => {
        const commentAuthor = comment.data.author;
        if(comment.kind !== 't1' || commentAuthor === '[deleted]' || comment.data.banned_by) {
            return;
        }
        if((comment.data.stickied || comment.data.distinguished) && !modOverride) {
            return;
        }

        let returnText = DOMPurify.sanitize(comment.data.body_html.match(mdRegex)[1]);
        if(comment.data.replies) {
            returnText = `${returnText}${commentChainDigger(comment.data.replies.data.children, commentAuthor, modOverride)}`;
        }

        returnArray.push({
            author: commentAuthor,
            text: returnText,
            permalink: comment.data.permalink
        });
    });

    return returnArray;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('background request:', request);

    if(request.action === 'globalMessage' ) {
        const message = {
            action: request.globalEvent
        };

        chrome.tabs.query({}, function(tabs) {
            for (let i = 0; i < tabs.length; ++i) {
                if(sender.tab.id !== tabs[i].id) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }

            }
        });
    }

    if(request.action === 'openChangelog') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('data/options/changelog.html')
        });
    }

    if(request.action === 'commentChainDigger') {
        const commentArray = request.details.commentArray;
        const authorName = request.details.authorName;
        sendResponse({comments: commentChainDigger(commentArray, authorName)});
    }

    if(request.action === 'commentSection') {
        const commentArray = request.details.commentArray;
        const modOverride = request.details.modOverride;
        const returnArray = commentSection(commentArray, modOverride);

        sendResponse({comments: returnArray});
    }

    if(request.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
    }

    return true;
});
