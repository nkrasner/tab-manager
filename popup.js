//Scripts for popups


//Opens a tab with the URL given
function openTab(tabUrl) {
	chrome.tabs.create({url: tabUrl});
    console.log("Opened tab: " + tabUrl);
}

//Opens a group of tabs given as an array
function openTabs(group) {
    for (tab of group.urls) {
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

//Checks if a group exists with a given name (asynchronous)
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
                chrome.storage.local.set(data, function() {
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

//Will remove a list of URLs from a group
function removeFromGroup(urls = "", groupName) {
	isGroup(groupName, function(isGroup){
        if (isGroup === true) {
            chrome.storage.local.get("groups", function(data) {
                //Pull group into groups
				var i;
				var newGroup = [];
	            var list = Object.values(data.groups[groupName]["urls"]);
				for (name of list){
					i = false;
					for (url of urls){
						if (url === name){
							i = true;
							break;
						}
					}
					if (i){
						continue;
					}
					else{
						newGroup.push(name);
					}
				}
				data.groups[groupName]["urls"] = newGroup;
				if (newGroup.length == 0) {
					let g = data["groups"];
					delete g[groupName];
					data["groups"] = g;
					chrome.storage.local.get("number", function(data) { 
						data.number--;
						chrome.storage.local.set(data);
					});
				}
                chrome.storage.local.set(data, function() {
                    console.log("Removed group: " + groupName);
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
function addGroup(groupName, urls = "") {
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
                    //location.reload();
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

//Things to do when the popup loads
window.onload = function load(){
    //Listener for add group button
    document.getElementById("addGroup").onclick = function() {
		//This will change later obviously...
		let groupName = window.prompt("Enter a group name.");
		let urls = window.prompt("Enter urls in quotes as a comma separated list.");
		//This requires the user to not make any mistakes or forget "https://""
		urls = JSON.parse('[' + urls + ']');
		addGroup(groupName, urls);
    };
    //Generate group buttons
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
		
		//sorted.reverse();
		/*for (sort of groupNames){
			console.log("group: " + sort + " , freq: " + groups[sort].freq);
		}*/
		
        var openGroupButtons = document.getElementById("openGroupButtons");
        for (groupName of groupNames) {
			let group = groups[groupName];
			var button = document.createElement("BUTTON");
			button.id = groupName;
			button.innerHTML = groupName;
			//Assign listener to open the group
			button.onclick = function() {
				openTabs(group);
				group["freq"]++;
				chrome.storage.local.set(data);
			};
			openGroupButtons.appendChild(button);
		}
    });
	//Generate button to add url to group if there are any existing groups
	numGroups(function(numGroups) {
		if (numGroups != 0){
			let removeGroupButton = document.getElementById("AddURLButton");
			var button = document.createElement("BUTTON");
			button.innerText = 'add url';
			removeGroupButton.appendChild(button);
			button.onclick = function() {
				let groupName = window.prompt("Enter a group name.");
				let urls = window.prompt("Enter urls in quotes as a comma separated list.");
				urls = JSON.parse('[' + urls + ']');
				addToGroup(urls, groupName);
			}
		}
	});
	//Generate button to remove url from group if there are any existing groups
	numGroups(function(numGroups) {
		if (numGroups != 0){
			let removeGroupButton = document.getElementById("RemoveURLButton");
			var button = document.createElement("BUTTON");
			button.innerText = 'remove url';
			removeGroupButton.appendChild(button);
			button.onclick = function() {
				let groupName = window.prompt("Enter a group name.");
				let urls = window.prompt("Enter urls in quotes as a comma separated list.");
				urls = JSON.parse('[' + urls + ']');
				removeFromGroup(urls, groupName);
			}
		}
	});
	//Generate button to remove group if there are any existing groups
	numGroups(function(numGroups) {
		if (numGroups != 0){
			let removeGroupButton = document.getElementById("removeGroupButton");
			var button = document.createElement("BUTTON");
			button.innerText = 'remove';
			removeGroupButton.appendChild(button);
			button.onclick = function() {
				let groupName = window.prompt("Enter a group name.");
				removeGroup(groupName);
			}
		}
	});
}






