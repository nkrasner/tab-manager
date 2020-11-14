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

//Gets the number of tab groups that the user has 
function numGroups(callback) {
    chrome.storage.local.get("number", function(data) {
        numGroups = data.number;
        callback(numGroups);
    });
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
function addToGroup(urls = "", groupName) {
    isGroup(groupName, function(isGroup){
        if (isGroup === true) {
            chrome.storage.local.get("groups", function(data) {
                //Push url into group
                let store = Object.values(data.groups[groupName]["urls"]);
                for (url of urls){
                    store.push(url);
                }
                data.groups[groupName]["urls"] = store;
                chrome.storage.local.set({"groups":data.groups}, function() {
                    console.log("Created group: " + groupName);
                    //Reload the popup so the button will appear
                    location.reload();
                });
            });
        } else {
            alert("There is no group name called " + groupName);
        }
    });
}

//Will remove a URL from a group
function removeFromGroup(url = "", groupName) {
    isGroup(groupName, function(isGroup){
        if (isGroup === true) {
            chrome.storage.local.get("groups", function(data) {
                groups = data["groups"];
                for (tab of groups[groupName]["urls"]){
                    if (url === tab){
                        groups[groupName]["urls"].splice(groups[groupName]["urls"].indexOf(url),1);
                    }
                }
                chrome.storage.local.set({"groups":groups}, function() {
                    console.log("Removed url: " + url);
                    //Reload the popup so the button will appear
                    location.reload();
                });
            });
        } 
        else {
            alert("There is no group with name: " + groupName);
        }
    });
}

//Adds a group with the name and URLs(optional) given
function addGroup(groupName, urls = []) {
    isGroup(groupName, function(isGroup){
        if (isGroup === false) {
            chrome.storage.local.get("groups", function(data) {
                //Push group into groups
                data.groups[groupName] = {};
                data.groups[groupName]["urls"] = urls;
                data.groups[groupName]["freq"] = 0;
                chrome.storage.local.set(data, function() {
                    console.log("Created group: " + groupName);
                });
            });
            chrome.storage.local.get("number", function(data) {
                data.number++;
                chrome.storage.local.set(data, function() {
                    console.log("Created group: " + groupName);
                    //Reload the popup so the button will appear again.
                    location.reload();
                });
            });
        } else {
            alert("There is already a group with name: " + groupName);
        }
    });
}

//Returns a sorted array (by frequency) of groupnames
function sortedGroupNames(callback) {
    chrome.storage.local.get("groups", function(data) {
        let groups = data["groups"]; //Enter groups object
        let groupNames = Object.keys(groups);
        //Sorts the groups from highest "freq" to lowest "freq" in 'sorted' array
        for (groupName of groupNames) {
            let nameA = groupName;
            let nameB = null;
            let indexA = groupNames.indexOf(groupName);
            let indexB = null;
            for (groupName2 of groupNames) {
                if ((groups[groupName].freq < groups[groupName2].freq) && (indexA < groupNames.indexOf(groupName2)) && (nameA !== groupName2)) {
                    nameB = groupName2;
                    indexB = groupNames.indexOf(groupName2);
                }
            }
            if (nameB !== null) {
                groupNames[indexA] = nameB;
            }
            if (indexB !== null) {
                groupNames[indexB] = nameA;
            }
        }
        callback(groupNames);
    });
}

//Will remove a group
function removeGroup(groupName) {
    isGroup(groupName, function(isGroup){
        if (isGroup === true) {
            chrome.storage.local.get("groups", function(data) {
                //Pull group into groups
                let g = data["groups"];
                delete g[groupName];
                data["groups"] = g;
                chrome.storage.local.set(data, function() {
                    console.log("Removed group: " + groupName);
                    //Reload the popup so the button will appear
                    location.reload();
                });
            });
            //Changes value of "Number" so it fits the number of existing tab groups
            chrome.storage.local.get("number", function(data) { 
                data.number--;
                chrome.storage.local.set(data, function() {
                    console.log("Removed group: " + groupName);
                    location.reload();
                });
            });
        } else {
            alert("There is no group with name: " + groupName);
        }
    });
}

//Take a url and fix it to work in the browser
function urlify(url){
    let fixedUrl = url;
    if (!fixedUrl.startsWith("https://")){
        fixedUrl = "https://" + fixedUrl;
    }
    fixedUrl = JSON.parse("[\"" + fixedUrl + "\"]");
    return fixedUrl;
}

//Generate group buttons (and their corresponding edit buttons)
function generateButtons(){
    chrome.storage.local.get("groups", function(data) {
        sortedGroupNames(function(groupNames) {
            let groups = data["groups"]; //Enter groups object
            let openGroupButtons = document.getElementById("openGroupButtons");
            if (groupNames.length === 0){
                document.getElementById("openGroupButtons-empty").style.display = "block";
            }
            for (groupName of groupNames) {
                //A holder for a group's buttons
                let groupDiv = document.createElement("div");
                //Generate buttons with attributes corresponding to the group name
                let groupButton = Object.assign(document.createElement("button"), {
                    id:groupName,
                    class:"openGroupButton",
                    innerText:groupName,
                    "groupName":groupName //hold the groupname here so onclick knows which to use
                });
                //Generate button to remove the group
                let removeGroupButton = Object.assign(document.createElement("button"), {
                    id:"remove" + groupName,
                    className:"editGroups",
                    innerText:"X",
                    "groupName":groupName,
                    style:"display:none"
                });
                //Assign listener to open the group
                groupButton.onclick = function() {
                    openTabs(groups[groupButton.groupName]["urls"]);
                    groups[groupButton.groupName]["freq"]++;
                    chrome.storage.local.set({"groups":groups});
                };
                //Assign listener to remove the group
                removeGroupButton.onclick = function() {
                    removeGroup(removeGroupButton.groupName);
                };
                groupDiv.appendChild(removeGroupButton);
                groupDiv.appendChild(groupButton);

                let editButton = Object.assign(document.createElement("button"), {
                    id:"edit"+groupName,
                    class:"editUrlsButton",
                    innerText:"..."
                });
                let dropDown = document.createElement("div");
                dropDown.style.display = "none";
                //List urls and buttons to remove each inside dropdown div
                for (url of groups[groupName]["urls"]) {
                    let removeURLButton = Object.assign(document.createElement("button"), {
                        class:"removeURLButton",
                        innerText:"X",
                        "url":url,
                        "groupName":groupName //hold the url and groupname here so onclick function knows which to use
                    });
                    removeURLButton.onclick = function() {removeFromGroup(removeURLButton.url, removeURLButton.groupName);};
                    let urlRemove = document.createElement("p");
                    urlRemove.class = "urlRemove";
                    urlRemove.innerText = url;
                    urlRemove.insertBefore(removeURLButton, urlRemove.childNodes[0]);
                    dropDown.appendChild(urlRemove);
                }
                let addUrlText = Object.assign(document.createElement("input"), {
                    class:"addUrlText"
                });
                let addUrlButton = Object.assign(document.createElement("button"), {
                    class:"addUrlButton",
                    innerText:"Add"
                });
                addUrlButton.onclick = function() {addToGroup(urlify(addUrlText.value), groupName)};
                addUrlText.addEventListener("keyup", function(event) {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        addUrlButton.click();
                    }
                });
                //Assign listener to edit the group
                editButton.onclick = function edit() {
                    dropDown.style.display = "block";
                    editButton.innerText = " ^ ";
                    editButton.onclick = function() {
                        dropDown.style.display = "none";
                        editButton.onclick = function() {edit();};
                        editButton.innerText = "...";
                    };
                };

                groupDiv.appendChild(editButton);
                dropDown.appendChild(addUrlText);
                dropDown.appendChild(addUrlButton);
                groupDiv.appendChild(dropDown);

                //Append buttons to the div and the div to the document
                openGroupButtons.appendChild(groupDiv); 
            }
        });
    });
}
//Things to do when the popup loads
window.onload = function load(){
    //Listener for add group button
    document.getElementById("addGroupButton").onclick = function() {
        if (document.getElementById("addGroupText").value != "") {
            addGroup(document.getElementById("addGroupText").value);
        }
    };
    document.getElementById("addGroupText").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("addGroupButton").click();
        }
    });
    document.getElementById("editGroups").onclick = function edit() {
        let editers = document.getElementsByClassName("editGroups");
        for (editer of editers) {
            editer.style.display = "table-cell";
        }
        document.getElementById("editGroups").innerText = "OK";
        document.getElementById("editGroups").onclick = function() {
            for (editer of editers) {
                editer.style.display = "none";
            }
            document.getElementById("editGroups").innerText = "+|-";
            document.getElementById("editGroups").onclick = function() {edit();};
        };
    };
    generateButtons();

    //Generate button to remove group
	/*if (true) {
		let removeGroupButton = document.getElementById("removeGroupButton");
		var button = document.createElement("BUTTON");
		button.innerText = 'remove';
		removeGroupButton.appendChild(button);
		button.onclick = function() {
			let groupName = window.prompt("Enter a group name.");
			groupName = JSON.parse(groupName);
			removeGroup(groupName);
		};
	}*/
};