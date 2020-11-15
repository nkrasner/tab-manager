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
                data.groups[groupName]["edit"] = false;
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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function reload() {
    removeAllChildNodes(document.getElementById("openGroupButtons"));
    load();
}

function generateGroupDiv(groupName, groups, animDelay, edit, groupDiv = null) {
    if (groupDiv === null) {
        groupDiv = Object.assign(document.createElement("div"),{
            "groupName":groupName, //hold the groupname here so onclicks knows which to use
            "animDelay":animDelay
        });
    }
    //Generate buttons with attributes corresponding to the group name
    let groupButton = Object.assign(document.createElement("button"), {
        id:groupName,
        className:"openGroupButton",
        innerText:groupName,
        style:"animation-delay:."+groupDiv.animDelay+"s"
    });
    //Assign listener to open the group
    groupButton.onclick = function() {
        openTabs(groups[groupDiv.groupName]["urls"]);
        groups[groupButton.groupName]["freq"]++;
        chrome.storage.local.set({"groups":groups});
    };
    //Generate button to remove the group
    let removeGroupButton = Object.assign(document.createElement("button"), {
        id:"remove" + groupName,
        className:"editGroups",
        innerText:"X",
        "groupName":groupName,
        style:"display:none"
    });
    //Assign listener to remove the group
    removeGroupButton.onclick = function() {
        removeGroup(groupDiv.groupName);
    };
    //Generate button to edit the group
    let editButton = Object.assign(document.createElement("button"), {
        id:"edit"+groupName,
        className:"editUrlsButton",
        "groupName":groupName,
        innerText:"." //hidden period don't remove
    });
    if (typeof groups[groupName] !== "undefined" && groups[groupName].edit){
        editButton.style["background-image"] = "url(images/Check-Mark.png)";
    } else {
        editButton.style["background-image"] = "url(images/DotDotDot.png)";

    }
    //Assign listener to edit the group
    editButton.onclick = function edit() {
        if (groups[groupName].edit){
            groups[groupName].edit = false;
        } else {
            groups[groupName].edit = true;
        }
        chrome.storage.local.set({groups});
        reload();
    };
    //place buttons in group div
    groupDiv.appendChild(removeGroupButton);
    groupDiv.appendChild(groupButton);
    groupDiv.appendChild(editButton);

    return groupDiv;
}

function generateDropdown(groupName, groups, edit, dropDown=null) {
    if (dropDown === null){
        dropDown = Object.assign(document.createElement("div"), {
            className:"dropDown",
            "groupName":groupName //hold the groupname here so onclicks knows which to use
        });
    }
    let animDelay = 0;
    if (typeof groups[groupName] !== "undefined"){
        for (url of groups[groupName]["urls"]) {
            let removeURLButton = Object.assign(document.createElement("button"), {
                className:"removeURLButton",
                innerText:"X",
                style:"animation-delay:"+animDelay+"s",
                "url":url //hold the url here so onclick function knows which to use
            });
            removeURLButton.onclick = function() {removeFromGroup(removeURLButton.url, dropDown.groupName);};
            let urlRemove = Object.assign(document.createElement("p"),{
                class:"urlRemove",
                innerText:url,
                style:"animation-delay:"+animDelay+"s"
            });
            urlRemove.insertBefore(removeURLButton, urlRemove.childNodes[0]);
            dropDown.appendChild(urlRemove);
            animDelay = animDelay + 0.1;
        }
    }
    let addUrlText = Object.assign(document.createElement("input"), {
        className:"addUrlText"
    });
    let addUrlButton = Object.assign(document.createElement("button"), {
        className:"addUrlButton",
        innerText:"Add"
    });
    addUrlButton.onclick = function() {addToGroup(urlify(addUrlText.value), dropDown.groupName)};
    addUrlText.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            addUrlButton.click();
        }
    });
    dropDown.appendChild(addUrlText);
    dropDown.appendChild(addUrlButton);

    if (typeof groups[groupName] !== "undefined" && groups[groupName].edit) {
        dropDown.style.display = "block";
    } else if (typeof groups[groupName] !== "undefined") {
        dropDown.style.display = "none";
    }
    return dropDown;
}

//Generate group buttons (and their corresponding edit buttons)
function generateButtons(edit = false){
    chrome.storage.local.get("groups", function(data) {
        sortedGroupNames(function(groupNames) {
            let groups = data["groups"]; //Enter groups object
            let openGroupButtons = document.getElementById("openGroupButtons");
            if (groupNames.length === 0){
                document.getElementById("openGroupButtons-empty").style.display = "block";
            }
            let animDelay = 0;
            for (groupName of groupNames) {
                //A holder for a group's buttons
                let groupDiv = generateGroupDiv(groupName, groups, animDelay, edit);
                let dropDown = generateDropdown(groupName, groups, edit);
                groupDiv.appendChild(dropDown);
                //Append the div to the document
                openGroupButtons.appendChild(groupDiv);
                if (edit){
                    for (element of document.getElementsByClassName("editGroups")) {
                       element.style.display = "table-cell";
                    }
                }
                animDelay = animDelay + 1;
            }
        });
    });
}

//Things to do when the popup loads
window.onload = function(){load()};
function load(){
    chrome.storage.local.get("edit", function(edit) {
        edit = edit.edit; //true if editing groups
        //Listener for add group button
        document.getElementById("addGroupButton").onclick = function() {
            if (document.getElementById("addGroupText").value != "") {
                addGroup(document.getElementById("addGroupText").value);
                reload();
            }
        };
        document.getElementById("addGroupText").addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("addGroupButton").click();
            }
        });

        generateButtons(edit);

        let editers = document.getElementsByClassName("editGroups");
        if (edit) {
            for (editer of editers) {
                editer.style.display = "table-cell";
            }
            document.getElementById("editGroups").style["background-image"] = "url(images/Check-Mark.png)";
        } else {
            for (editer of editers) {
                editer.style.display = "none";
            }
            document.getElementById("editGroups").style["background-image"] = "url(images/PlusMinus.png)";
        }
        document.getElementById("editGroups").onclick = function edit() {
            chrome.storage.local.get("edit", function(isEdit) {
                isEdit = isEdit.edit; //true if editing groups
                if (isEdit) {
                    for (editer of editers) {
                        editer.style.display = "none";
                    }
                    chrome.storage.local.set({"edit":false});
                    document.getElementById("editGroups").style["background-image"] = "url(images/PlusMinus.png";
                } else {
                    for (editer of editers) {
                        editer.style.display = "table-cell";
                    }
                    chrome.storage.local.set({"edit":true});
                    document.getElementById("editGroups").style["background-image"] = "url(images/Check-Mark.png)";
                }
            });
        };
    });

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
}