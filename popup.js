function openTab(tabUrl) {
	chrome.tabs.create({url: tabUrl});
}

function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'temp_data.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

window.onload = function() {
    document.getElementById("openTabsButton").onclick = function openTabs() {
    	loadJSON(function(response) {
      		// Parse JSON string into object
        	var data = JSON.parse(response);
        	var tabGroup = data.groups.g1;
        	for (tab of tabGroup) {
        		openTab(tab);
        	}
    	});

    }
}