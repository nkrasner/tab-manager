
//Background scripts
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.clear();
    //Start with empty group list
    chrome.storage.local.set({
        "groups":{},
        "number":0,
        "edit":false,
        "settings":{
            "animSpeed":1
        }
    });
});
