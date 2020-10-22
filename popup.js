//Scripts for popups

//Opens a tab with the URL given
function openTab(tabUrl) {
	chrome.tabs.create({url: tabUrl});
    console.log("Opened tab: " + tabUrl);
}

//Opens a group of tabs given as an array
function openTabs(group) {
    for (tab of group) {
        openTab(tab);
    }
}

//Checks if a group exists witha given name (asynchronous)
function isGroup(groupName, callback) {
    chrome.storage.local.get("groups", function(data) {
        isGroup = false;
        let groupNames = Object.keys(data["groups"]);
        for (aGroup of groupNames) {
            if (groupName === aGroup) {
                isGroup = true;
            }
        }
        callback(isGroup);
    });
}

//Will add a list of URLs to an existing group
function addToGroup(urls, group) {

}

//Will remove a list of URLs from a group
function removeFromGroup(urls, group) {

}

//Adds a group with the name and URLs(optional) given
function addGroup(groupName, urls = "") {
    isGroup(groupName, function(isGroup){
        if (isGroup === false) {
            chrome.storage.local.get("groups", function(data) {
                //Push group into groups
                data.groups[groupName] = urls;
                chrome.storage.local.set(data, function() {
                    console.log("Created group: " + groupName);
                    //Reload the popup so the button will appear
                    location.reload();
                });
            });
        } else {
            alert("There is already a group with name: " + groupName);
        }
    });
}

//Will remove a group
function removeGroup(groupName) {

}

//Things to do when the popup loads
window.onload = function load(){
    //Listener for add group button
    document.getElementById("addGroup").onclick = function() {
        //This will change later obviously...
        let groupName = window.prompt("Enter a group name.");
        let urls = window.prompt("Enter urls in quotes as a comma separated list.");
        //This requires the user to not make any mistakes or forget "https://""
        urls = JSON.parse(['[' + urls + ']']);
        addGroup(groupName, urls);
    };
    //Generate group buttons
    chrome.storage.local.get("groups", function(data) {
        let groups = data["groups"]; //Enter groups object
        let groupNames = Object.keys(groups);
        var buttons = document.getElementById("openGroupButtons");
        for (groupName of groupNames) {
            /*Generate a button for each group with
            attributes corresponding to the group name*/
            let group = groups[groupName];
            var button = document.createElement("BUTTON");
            button.id = groupName;
            button.innerHTML = groupName;
            //Assign listener to open the group
            button.onclick = function() {
                openTabs(group);
            };
            buttons.appendChild(button); 
        }
    });
}