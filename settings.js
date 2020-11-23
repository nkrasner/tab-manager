window.onload = function load(){
    chrome.storage.local.get("settings", function(data) {
        settings = data.settings;
        document.getElementById("animationSpeed").value = settings.animSpeed;
        document.getElementById("saveButton").onclick = function() {
            settings.animSpeed = document.getElementById("animationSpeed").value;
            chrome.storage.local.set({settings});
        };
    });
    if (true) { //make this true for testing mode
    	document.getElementById("testing").style.display = "block";
    }
}