const mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
function commentChainDigger(commentArray, authorName) {
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
                comments = `${comments}${commentChainDigger(comment.data.replies.data.children, authorName)}`;
            }
        }
    });

    return comments;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'commentChainDigger') {
        const commentArray = request.details.commentArray;
        const authorName = request.details.authorName;
        sendResponse({comments: commentChainDigger(commentArray, authorName)});
        return true;
    }
});