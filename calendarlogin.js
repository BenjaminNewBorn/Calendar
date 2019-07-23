


(function(){Date.prototype.deltaDays=function(c){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+c)};Date.prototype.getSunday=function(){return this.deltaDays(-1*this.getDay())}})();
function Week(c){this.sunday=c.getSunday();this.nextWeek=function(){return new Week(this.sunday.deltaDays(7))};this.prevWeek=function(){return new Week(this.sunday.deltaDays(-7))};this.contains=function(b){return this.sunday.valueOf()===b.getSunday().valueOf()};this.getDates=function(){for(var b=[],a=0;7>a;a++)b.push(this.sunday.deltaDays(a));return b}}
function Month(c,b){this.year=c;this.month=b;this.nextMonth=function(){return new Month(c+Math.floor((b+1)/12),(b+1)%12)};this.prevMonth=function(){return new Month(c+Math.floor((b-1)/12),(b+11)%12)};this.getDateObject=function(a){return new Date(this.year,this.month,a)};this.getWeeks=function(){var a=this.getDateObject(1),b=this.nextMonth().getDateObject(0),c=[],a=new Week(a);for(c.push(a);!a.contains(b);)a=a.nextWeek(),c.push(a);return c}};

checkLogin()
var currentDate = new Date();
var currentMonth = new Month(currentDate.getFullYear(), currentDate.getMonth());

if(typeof token == "undefined") {
    var token = "";
}

updateCalendar();

if(typeof check == "undefined") {
    var check = false;
}

//update calendar
function updateCalendar(){
    var calendarTable = document.getElementById("calendarTable");
    var captionObj = document.getElementById("caption");
    captionObj.replaceChild(document.createTextNode(currentMonth.year + " / " + (currentMonth.month + 1)), captionObj.lastChild)
    var calNewBody= document.createElement("tbody");
    var weeks = currentMonth.getWeeks();
    for(var w in weeks){
        var days = weeks[w].getDates();
        var aWeek = document.createElement("tr");
        for(var d in days){
            var aDay = document.createElement("td");
            aDay.appendChild(document.createTextNode( days[d].getDate()));
            aDay.appendChild(document.createElement("br"));
            updateEvents(days[d], aDay);
            aWeek.appendChild(aDay);
        }
        calNewBody.append(aWeek);
    }
    calendarTable.replaceChild(calNewBody, document.getElementsByTagName("tbody")[0]);
}

//view exact event
function viewEventAjax(event) {
    var event_id = event.target.id;
        var dataString = "ope=view_event&event_id=" + encodeURIComponent(event_id);
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "calEvent.php", true);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.addEventListener("load", function(event){
            var jsonData = JSON.parse(event.target.responseText);
            if(jsonData.success){
                var nDate = jsonData.eventDate.substr(0,10); 
                var nTime = jsonData.eventDate.substr(11,5);
                  $(document).ready(function(){ 
                     $("#eventDiv").show(); 
                     $("#eveTitle").val(jsonData.title); 
                     $("#eveDate").val(nDate); 
                     $("#eveTime").val(nTime); 
                     $("#eveCreator").text(jsonData.creator); 
                     $("#eveId").val(event_id); 
                     $("#checkCSRF").val(token); 
                 }); 
                if(jsonData.shared) {
                    $(document).ready(function(){
                        $("#tagOpeTr").hide();
                        $("#OpeTr").hide();
                        $("#shareOpeTr").hide();

                    });
                }
                UpdateTags(event_id); 
                UpdateShares(event_id);
                check = true;
            }else{
                alert(jsonData.message);
            }
    }, false);
    xmlHttp.send(dataString);

}

function UpdateTags(event_id) { //update tags of exact event
    var dataString = "&event_id=" + encodeURIComponent(event_id) + "&ope=showTags" ;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        var jsonDataArray=eval(jsonData);
        var tagNumber = jsonDataArray.length;
        if(tagNumber > 0) {
            var tagsText = jsonDataArray[0];
            for(var i =1; i < tagNumber; i++){
                tagsText = tagsText + ", " + jsonDataArray[i];
            }
            $(document).ready(function(){
                $("#eventTags").text(tagsText);

            });
        }else{
            $(document).ready(function(){
                $("#eventTags").text("");
            });
        }
    }, false);
    xmlHttp.send(dataString);
}

function UpdateShares(event_id) { //updated shared person of exact event
    var dataString = "&event_id=" + encodeURIComponent(event_id) + "&ope=showShared" ;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function (event) {
        var jsonData = JSON.parse(event.target.responseText);
        var jsonDataArray=eval(jsonData);
        var shareNumber = jsonDataArray.length;
        if(shareNumber > 0) {
            var sharesText = jsonDataArray[0];
            for(var i =1; i < shareNumber; i++){
                sharesText = sharesText + ", " + jsonDataArray[i];
            }
            $(document).ready(function(){
                $("#sharedPeople").text(sharesText);
            });
        }else{
            $(document).ready(function(){
                $("#sharedPeople").text("");
            });
        }
    }, false);
    xmlHttp.send(dataString);
}

// update event info in calendar
function updateEvents(eDay, DayObj){
    var uYear = eDay.getFullYear();
    var uMonth = eDay.getMonth() + 1;
    var uDate = eDay.getDate();
    var nDay = uYear + "-" + uMonth + "-" + uDate;

    var dataString = "ope=show_events"  + "&day=" + encodeURIComponent(nDay);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calEvent.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function(event){
        var jsonData = JSON.parse(event.target.responseText);
        var jsonDataArray=eval(jsonData);
        var eventNumber = jsonDataArray.length / 3;
        if(eventNumber > 0) {
            var aEvent = document.createElement("ul");
            for(var i =0; i < eventNumber; i++){
                // get every event title
                var aTitle = document.createElement("li");
                aTitle.setAttribute("id", jsonDataArray[3 * i + 2])
                aTitle.addEventListener("click", viewEventAjax, false)
                aTitle.appendChild(document.createTextNode(jsonDataArray[3 * i]));
                aEvent.appendChild(aTitle);
                DayObj.appendChild(aEvent);
            }
        }
    }, false);
    xmlHttp.send(dataString);
}



// check if user has been logged in
function checkLogin() {
    var dataString= "ope=" + encodeURIComponent("check_login");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calendarlogin.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function(event){
        var jsonData = JSON.parse(event.target.responseText);
        if(jsonData.success){
            token = jsonData.token;
            $(document).ready(function(){
                $("#login").hide();
                $("#welcome").show();
                $("#addEvent").show();
            });
        }else {
            $(document).ready(function(){
                $("#login").show();
                $("#welcome").hide();
                $("#addEvent").hide();
                $("#eventDiv").hide();
            });
        }
    }, false);
    xmlHttp.send(dataString);
}

//log out function
function logoutAjax(event) {
    var dataString= "ope=" + encodeURIComponent("logout");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calendarlogin.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function(event){
        var jsonData = JSON.parse(event.target.responseText);
        if(jsonData.success){
            alert("You've been Log out!");
            updateCalendar();
            $(document).ready(function(){
                $("#login").show();
                $("#welcome").hide();
                $("#addEvent").hide();
                $("#eventDiv").hide();
            });
            check=false;
        }
    }, false);
    xmlHttp.send(dataString);
}

function loginAjax(event){
    var username = document.getElementById("username").value; // Get the username from the form
    var password = document.getElementById("password").value; // Get the password from the form

    var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&ope=" + encodeURIComponent("login");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "calendarlogin.php", true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.addEventListener("load", function(event){
        var jsonData = JSON.parse(event.target.responseText);
        if(jsonData.success){
            alert("You've been Logged In!");
            token = jsonData.token;
            updateCalendar();
            $(document).ready(function(){
                $("#login").hide();
                $("#welcome").show();
                $("#addEvent").show();
            });
            check = true;
        }else{
            alert("You were not logged in.  "+jsonData.token);
        }
    }, false); // Bind the callback to the load event
    xmlHttp.send(dataString); // Send the data
}

function registerAjax(event) {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Make a URL-encoded string for passing POST data:
    var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&ope=" + encodeURIComponent("register");
    var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
    xmlHttp.open("POST", "calendarlogin.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
    xmlHttp.addEventListener("load", function(event){
        var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
        if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
            alert("You've been registered! Please log in!");
        }else{
            alert("You do not register  "+jsonData.message);
        }
    }, false); // Bind the callback to the load event
    xmlHttp.send(dataString); // Send the data
}


document.getElementById("login_btn").addEventListener("click", loginAjax, false);
document.getElementById("register").addEventListener("click", registerAjax, false);
document.getElementById("logout_btn").addEventListener("click", logoutAjax, false);
document.getElementById("next_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.nextMonth();
    updateCalendar();
}, false);
document.getElementById("pre_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.prevMonth();
    updateCalendar();
}, false);
