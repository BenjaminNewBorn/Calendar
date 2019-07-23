<?php
ini_set("session.cookie_httponly", 1);
session_start();
header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

//User Agent Consistency
$previous_ua = @$_SESSION['useragent'];
$current_ua = $_SERVER['HTTP_USER_AGENT'];

if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua){
    die("Session hijack detected");
}else{
    $_SESSION['useragent'] = $current_ua;
}

$ope = $_POST['ope'];

//log out
if($ope == 'logout') {
    session_unset();
    echo json_encode(array(
        "success" =>true,
    ));
    exit;
}

//check if use has been logged in
if($ope == 'check_login') {
    if(isset($_SESSION['check']) && $_SESSION['check'] ) {
        echo json_encode(array(
            "success" =>true,
            "token" => htmlentities($_SESSION['token'])
        ));
        exit;
    }
    echo json_encode(array(
        "success" =>false,
    ));
    exit;
}

$username = $_POST['username'];
$password = $_POST['password'];

// Check if the username and password are valid.  (You learned how to do this in Module 3.)
require 'calendarDb.php';

if( !preg_match('/^[\w_\-]+$/', $username) ){
    echo json_encode(array(
        "success" =>false,
        "message" => "Invalid username"
    ));
    exit;
}
if( !preg_match('/^[a-zA-Z0-9]|[_]$/', $password) ){
    echo json_encode(array(
        "success" =>false,
        "message" => "Password should only include letters, numbers and '_'"
    ));
    exit;
}
if($ope == 'register') {
    $pwd_hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $mysqli->prepare("insert into users (username, password) values (?,?)");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('ss', $username, $pwd_hash);
    $stmt->execute();
    if($stmt->affected_rows == 1) {
        $stmt->close();
        echo json_encode(array(
            "success" => true
        ));

        exit;
    } else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }

} elseif ($ope == "login") {
    $stmt = $mysqli->prepare("select count(*),password from users where username = ?");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "message" => sprintf("Query Prep Failed: %s\n", $mysqli->error)
        ));
        exit;
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->bind_result($cnt, $pwd_hash);
    $stmt->fetch();
    //check if password is correct
    $pwd_guess = htmlentities($_POST['password']);
    if($cnt == 1 && password_verify($pwd_guess, $pwd_hash)) {
        $_SESSION['username'] = $username;
        $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
        $_SESSION['check'] = true;
        $stmt->close();
        echo json_encode(array(
            "success" => true,
            "token" => $_SESSION['token']
        ));
        exit;
    }else {
        $stmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "Please check username and password"
        ));
        exit;
    }

}

?>
