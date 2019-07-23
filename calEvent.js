var imported = document.createElement("script");
imported.src = "calendarlogin.js";

document.getElementById("addEvent_btn").addEventListener("click", addEventAjax, false);
document.getElementById("eveEdit_btn").addEventListener("click", editEventAjax, false);
document.getElementById("eveDelete_btn").addEventListener("click", deleteEventAjax, false);
document.getElementById("addTag_btn").addEventListener("click", addTagAjax, false);
document.getElementById("delTag_btn").addEventListener("click", delTagAjax, false);
document.getElementById("addShare_btn").addEventListener("click", addShareAjax, false);
document.getElementById("delShare_btn").addEventListener("click", delShareAjax, false);

function addEventAjax(event) {
    var eTitle = document.getElementById("eTitle").value;
    var eDate = document.getElementById("eDate").value;
    var eTime = document.getElementById("eTime").value;
    var nDate = eDate + " " + eTime;
    var dataString ="eTitle=" + encodeURIComponent(eTitle) + "&eDate=" + encodeURIComponent(nDate) + "&ope=" + encodeURIComponent("Add");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {

            updateCalendar();
        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);
}

function editEventAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var eTitle = document.getElementById("eveTitle").value;
    var eDate = document.getElementById("eveDate").value;
    var eTime = document.getElementById("eveTime").value;
    var nDate = eDate + " " + eTime;
    var token = document.getElementById("checkCSRF").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&eTitle=" + encodeURIComponent(eTitle) + "&eDate=" + encodeURIComponent(nDate) + "&ope=" + encodeURIComponent("Edit");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {

            updateCalendar();
        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);

}

function deleteEventAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var token = document.getElementById("checkCSRF").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&ope=" + encodeURIComponent("Delete");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {

            $(document).ready(function(){
                $("#eventDiv").hide();
            });
            updateCalendar();
        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);

}

function addTagAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var token = document.getElementById("checkCSRF").value;
    var tag = document.getElementById("eveAddTag").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&tag=" + encodeURIComponent(tag) + "&ope=AddTag";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {
            UpdateTags(event_id);

        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);
}

function delTagAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var token = document.getElementById("checkCSRF").value;
    var tag = document.getElementById("eveDelTag").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&tag=" + encodeURIComponent(tag) + "&ope=DelTag";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {
            UpdateTags(event_id);

        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);
}

function addShareAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var token = document.getElementById("checkCSRF").value;
    var share = document.getElementById("addSharedEvent").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&share=" + encodeURIComponent(share) + "&ope=AddShare";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {
            UpdateShares(event_id);

        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);

}

function delShareAjax(event) {
    var event_id = document.getElementById("eveId").value;
    var token = document.getElementById("checkCSRF").value;
    var share = document.getElementById("addSharedEvent").value;
    var dataString = "token=" + encodeURIComponent(token) + "&event_id=" + encodeURIComponent(event_id) + "&share=" + encodeURIComponent(share) + "&ope=DelShare";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        if (jsonData.success) {
            UpdateShares(event_id);

        } else {
            alert(jsonData.message);
        }
    }, false);
    xmlHttp.send(dataString);
}

