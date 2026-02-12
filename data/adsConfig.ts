export const ADS_CONFIG = {
    // Replace this with your actual Google AdSense Publisher ID (e.g., ca-pub-1234567890123456)
    PUBLISHER_ID: "ca-pub-YOUR_PUBLISHER_ID",

    // Set to true to use test ads (recommended during development)
    // AdSense automatically serves test ads to localhost, but this explicit flag can help if needed logic-wise.
    // Generally plain AdSense relies on the domain being authorized.
    IS_TEST_MODE: true,

    // Your specific Ad Slot IDs from the AdSense Dashboard
    SLOTS: {
        HOME_TOP_RIGHT: "1234567890",
        HOME_MID_FEED: "1234567890",
        HOME_DIVIDER_LEFT: "1234567890",
        HOME_DIVIDER_RIGHT: "1234567890",
        CATEGORY_FEED_1: "1234567890",
        CATEGORY_FOOTER: "1234567890",
        ARTICLE_IN_CONTENT: "1234567890",
        ARTICLE_FOOTER: "1234567890",
        HOME_FOOTER: "1234567890",
    }
};
