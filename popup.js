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
                data.groups[groupName] = store;
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
					removeGroup(groupName);
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
				var newGroup = [];
	            var list = Object.keys(data["groups"]);
				for (name of list){
					if (groupName === name){
						continue;
					}
					else{
						newGroup.push(name);
					}
				}
				data["groups"] = newGroup; 
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

/*function sortGroups() {
	chrome.storage.local.get("groups", function(data) {
        let groups = data["groups"]; //Enter groups object
        let groupNames = Object.keys(groups);
		var sorted = [];
		let GroupName;
		for (groupName of groupNames) {
			for (groupName2 of groupNames) {
				if ((groupName.number < groupName2.number) && (!sorted.includes(groupName2))) {
					groupName = groupName2;		
				}
			}
			sorted.push(groupName);
		}
		return sorted;
	});
}*/

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
        let sorted = [];
		//Sorts the groups from highest "freq" to lowest "freq" in 'sorted' array
		for (groupName of groupNames) {
			//Loop moves on if the group is already in 'sorted' array
			if (sorted.includes(groupName)) {
				continue;
			}
			for (groupName2 of groupNames) {
				if ((groupName.freq < groupName2.freq) && (!sorted.includes(groupName2))) {
					groupName = groupName2;		
				}
			}
			sorted.push(groupName);
		}
		sorted.reverse();
		
        var openGroupButtons = document.getElementById("openGroupButtons");
        for (groupName of sorted) {
			let group = groups[groupName];
			var button = document.createElement("BUTTON");
			button.id = groupName;
			button.innerHTML = groupName;
			//Assign listener to open the group
			button.onclick = function() {
				openTabs(group);
				data.groups[groupName]["freq"]++;
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






