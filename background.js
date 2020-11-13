const MAX_NODES = 1000;
//Background scripts
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.clear();
    //Start with empty group list and graph
    chrome.storage.local.set({
        "groups":{},
        "urlGraph":new urlGraph(),
        "number":0
    });
});

/*chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    chrome.storage.local.get("urlGraph", function(urlGraph) {
        if(!urlGraph.isNode(tab.url)) {
            addNode(tab.url);

        }
    });
});*/