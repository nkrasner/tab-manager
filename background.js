//Background scripts
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.clear();
    chrome.storage.local.set({"groups":{}}); //Start with empty group list
    //const urlGraph = require("./urlGraph");
});