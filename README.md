
![Logo](https://www.creesch.com/dump/img/img_5c370feea94c2.png)  

Readable text posts on reddit
========================
readReddit adds a pleasant & clutter free reading mode for reddit text posts and comments.

Reformat text posts from this:  
![Before](https://www.creesch.com/dump/img/img_5c37109ddbe6c.png)

Into a nice readable format without any distractions. Like this:

![After](https://www.creesch.com/dump/img/img_5c3710ca05f08.png)

Or if you are more into dark themes: 

![After dark](https://www.creesch.com/dump/img/img_5c3710f5dd1c4.png)

Or do the same for all top level comments in subreddits like /r/WritingPrompts.

Activated from a simple floating button. ![Floating button](https://www.creesch.com/dump/img/img_5c3a30f3538b5.png)

# Download

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/readable-text-posts-on-reddit/)
- [Chrome](https://chrome.google.com/webstore/detail/readable-text-posts-on-re/kpffhggoghnmcbofgjdccdgflkodakkj)

# Features

- Will also go over comments to look for first level comments by the author to include these in the formatted text. Useful for those text posts where the author runs out of space and continues their story in the comments.
- Light and dark mode. 
- Choose your own font.
- Adjust the font size.
- Adjust the text width. 

# Future: 

Some things I might build in the future. 


- Custom themes


# Build instructions: 

- [Download](https://nodejs.org/en/download/) and install nodeJS (Instructions written when LTS Version: 16.15.0  was the current version )
- From a commandline terminal run `npm install` from the root directory of this repository. 
- From a commandline terminal run `npm run build`
- A `build` directory will be created containing the following: 
    - `firefox` directory containing the unpackaged extension for firefox
    - `readReddit_vX.X.X_firefox.zip` file containing the packaged extension for firefox.
    - `chrome` directory containing the unpackaged extension for chrome and chromium based browsers.
    - `readReddit_vX.X.X_chrome.zip` file containing the packaged extension for chrome and chromium based browsers.