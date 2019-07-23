<?php
ini_set("session.cookie_httponly", 1);
session_start();
header("Content-Type: application/json");

//User Agent Consistency
$previous_ua = @$_SESSION['useragent'];
$current_ua = $_SERVER['HTTP_USER_AGENT'];

if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua){
    die("Session hijack detected");
}else{
    $_SESSION['useragent'] = $current_ua;
}

$username = $_SESSION['username'];
require "calendarDb.php";
$ope = $_POST['ope'];


//add event
if($ope == 'Add') {
    $title = $_POST['eTitle'];
    $eDate = $_POST['eDate'];

    if (!preg_match('/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/', $eDate)) {
        echo json_encode(array(
            "success" => false,
            "message" => "invalid date"
        ));
        exit;
    }
    $stmt = $mysqli->prepare("INSERT INTO events (title, creator, eventDate) VALUES (?,?,?)");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('sss', $title, $username, $eDate);
    $stmt->execute();

    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Add event successfully"
        ));
        exit;
    }
    $stmt->close();
    echo json_encode(array(
        "success" => false,
        "message" => "Error"
    ));
    exit;
} elseif($ope == "show_events"){ // show events in calendar

    $day = $_POST['day'];
    $start = sprintf('%s 00:00:00', $day);
    $end = sprintf('%s 23:59:59', $day);

    $eventList = array();
    $stmt = $mysqli->prepare("SELECT title, eventDate, id FROM events  WHERE creator = ? AND eventDate >=? AND eventDate <= ?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('sss',$username,$start,$end);
    $stmt->execute();
    $stmt->bind_result($title, $eventDate, $event_id);
    while($stmt->fetch()) {
        array_push($eventList, htmlentities($title), htmlentities($eventDate), htmlentities($event_id));
    }
    $stmt->close();

    /*
    get shared event
    */
    $stmt = $mysqli->prepare("SELECT e.title, e.eventDate, e.id FROM events e, shared s  WHERE e.id = s.event_id AND e.eventDate >=? AND e.eventDate <= ? AND e.creator != s.shared_person AND s.shared_person = ?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('sss',$start,$end,$username);
    $stmt->execute();
    $stmt->bind_result($title, $eventDate, $event_id);
    while($stmt->fetch()) {
        $shared_id = sprintf('%s:shared', $event_id);
        array_push($eventList, htmlentities($title), htmlentities($eventDate), htmlentities($shared_id));
    }
    $stmt->close();



    echo json_encode($eventList);
    exit;

} elseif($ope == "view_event") { //view detail of exact event
    $event_id= $_POST['event_id'];
    $id_part = split(":", $event_id);

    if(sizeof($id_part) == 1){
        $stmt = $mysqli->prepare("SELECT count(*), title, eventDate,creator FROM events  WHERE id=?");
        if (!$stmt) {
            echo json_encode(array(
                "success" => false,
                "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
            ));
            exit;
        }
        $stmt->bind_param('i',$event_id);
        $stmt->execute();
        $stmt->bind_result($cnt,$title, $eventDate, $creator);
        $stmt->fetch();
        $stmt->close();
        if($cnt == 1) {
            echo json_encode(array(
                "success" => true,
                "title" => htmlentities($title),
                "eventDate" => htmlentities($eventDate),
                "creator" => htmlentities($creator),
                "shared" => false
            ));
            exit;
        } else {
            echo json_encode(array(
                "success" => false,
                "message" => "cannot find this event"
            ));
            exit;
        }
    }else{
        list($newEvent_id, $share) =  split(":", $event_id);
        $stmt = $mysqli->prepare("SELECT count(*), title, eventDate,creator FROM events  WHERE id=?");
        if (!$stmt) {
            echo json_encode(array(
                "success" => false,
                "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
            ));
            exit;
        }
        $stmt->bind_param('i',$newEvent_id);
        $stmt->execute();
        $stmt->bind_result($cnt,$title, $eventDate, $creator);
        $stmt->fetch();
        $stmt->close();
        if($cnt == 1) {
            echo json_encode(array(
                "success" => true,
                "title" => htmlentities($title),
                "eventDate" => htmlentities($eventDate),
                "creator" => htmlentities($creator),
                "shared" => true
            ));
            exit;
        } else {
            echo json_encode(array(
                "success" => false,
                "message" => "cannot find this event"
            ));
            exit;
        }
    }

}elseif($ope == "Edit") { // Edit event
    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    $event_id= $_POST['event_id'];
    $title = $_POST['eTitle'];
    $eDate = $_POST['eDate'];



    if (!preg_match('/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/', $eDate)) {
        echo json_encode(array(
            "success" => false,
            "message" => "invalid date"
        ));
        exit;
    }
    $stmt = $mysqli->prepare("UPDATE events set title = ?, eventDate = ? WHERE id =?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('ssi',$title, $eDate, $event_id);
    $stmt->execute();

    if($stmt->affected_rows >=0) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Update successfully"
        ));
        exit;
    } else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Update failed"
        ));
        exit;
    }

}elseif($ope == "Delete") { // Delete event
    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    $event_id= $_POST['event_id'];
    $stmt = $mysqli->prepare("DELETE FROM events WHERE id =?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('i', $event_id);
    $stmt->execute();

    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Delete Successfully"
        ));
        exit;
    } else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Delete Failed"
        ));
        exit;
    }
}elseif($ope == "AddTag") { //Add tag
    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    $event_id= $_POST['event_id'];
    $tag = $_POST['tag'];
    $stmt = $mysqli->prepare("INSERT INTO tags (tag_name, event_id) VALUES (?,?)");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('ss', $tag, $event_id);
    $stmt->execute();

    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Add tag successfully"
        ));
        exit;
    }
    $stmt->close();
    echo json_encode(array(
        "success" => false,
        "message" => "Add tag failed"
    ));
    exit;
} elseif ($ope =="showTags") {//show all the tags of one event
    $event_id= $_POST['event_id'];
    $stmt = $mysqli->prepare("SELECT tag_name FROM tags WHERE event_id=?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('i',$event_id);
    $stmt->execute();
    $stmt->bind_result($tags);
    $tagList = array();
    while($stmt->fetch()) {
        array_push($tagList, htmlentities($tags));
    }
    $stmt->close();
    echo json_encode($tagList);
    exit;
} elseif ($ope == "DelTag") { // delete tag

    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    $event_id= $_POST['event_id'];
    $tag = $_POST['tag'];
    $stmt = $mysqli->prepare("DELETE FROM tags WHERE event_id =? AND tag_name =?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('is', $event_id, $tag);
    $stmt->execute();
    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Delete tag Successfully"
        ));
        exit;
    } else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Delete tag Failed"
        ));
        exit;
    }
} elseif($ope == "AddShare") { //add share
    if(!hash_equals($_SESSION['token'], $_POST['token'])){
        die("Request forgery detected");
    }
    $event_id= $_POST['event_id'];
    $share = $_POST['share'];
    $stmt = $mysqli->prepare("INSERT INTO shared (shared_person, event_id) VALUES (?,?)");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('ss', $share, $event_id);
    $stmt->execute();

    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Add Share successfully"
        ));
        exit;
    }
    $stmt->close();
    echo json_encode(array(
        "success" => false,
        "message" => "Add Share failed"
    ));
    exit;
} elseif($ope == "showShared") { // show shared people
    $event_id= $_POST['event_id'];
    $stmt = $mysqli->prepare("SELECT shared_person FROM shared WHERE event_id=?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('i',$event_id);
    $stmt->execute();
    $stmt->bind_result($share);
    $shareList = array();
    while($stmt->fetch()) {
        array_push($shareList, htmlentities($share));
    }
    $stmt->close();
    echo json_encode($shareList);
    exit;
} elseif ($ope == "DelShare") { // delete tag

    if (!hash_equals($_SESSION['token'], $_POST['token'])) {
        die("Request forgery detected");
    }
    $event_id = $_POST['event_id'];
    $share = $_POST['share'];
    $stmt = $mysqli->prepare("DELETE FROM shared WHERE event_id =? AND shared_person =?");
    if (!$stmt) {
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('is', $event_id, $share);
    $stmt->execute();
    if ($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Delete share Successfully"
        ));
        exit;
    } else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Delete share Failed"
        ));
        exit;
    }
}

?>