<?php
require_once('./BizDataLayer/userData.php');
require_once('./svcLayer/security.php');


/**
 * Logs a registered user into the system
 * @param $d
 * @param $ip
 * @param $token
 */
function loginUser($d,$ip,$token){
    $result = array();
    $loginData = parseDataFromRequest($d);
    $loginResponse = checkLoginData($loginData['username'],$loginData['password']);

    if ($loginResponse){
        session_start();
        //retrieve user data
        /*
        $userData = json_decode(getUserData($loginData['username']));

        //sets the session variables
        $_SESSION['username'] = $userData['username'];
        $_SESSION['userID'] = $userData['id_user'];
        $_SESSION['email'] = $userData['email'];
        $_SESSION['win'] = $userData['win'];
        $_SESSION['loss'] = $userData['loss'];

        //sets the players status to active and creates the token
        setPlayerStatusData('1', $userData['username']);
        generate_cookie($userData['username'],$ip);
        */

        //combine everything
        $result['status'] = 'success';
        $result['message'] = 'You are now logged into the game';
    } else {
        //tell them it didn't work
        $result['status'] = 'error';
        $result['message'] = 'There was an error with your credentials. Please try again!';
    }

    echo json_encode($result);
}

/**
 * Creates a new user account but also checks alot of stuff
 * @param $d
 * @param $ip
 * @param $token
 */
function registerUser($d,$ip,$token){
    $result = array();
    $data = parseDataFromRequest(urldecode($d));
    $cleanData = cleanRegisterFormData($data);

    //checks to make sure the username doesn't already exist, the passes match, and none of the fields are empty
    $userCheck = checkUsernameData($cleanData['username']);
    $passCheck = ($cleanData['password'] === $cleanData['password-confirm']) ? true : false;
    $paramCheck = (!empty($cleanData['password']) && !empty($cleanData['username']) && !empty($cleanData['email'])) ? true : false;

    //make sure the passwords are exactly the same
    if ($passCheck == false){
        $result['message'] = 'Passwords do not match. Please try again!';
        $result['status'] = 'error';
    }

    //make sure the account doesn't already exist
    if ($userCheck > 0){
        $result['message'] = 'This user account already exists. Please try another username!';
        $result['status'] = 'error';
    }

    //your missing some parameters
    if ($paramCheck == false){
        $result['message'] = 'Your missing some fields please fill in everything!';
        $result['status'] = 'error';
    }

    //once they pass validation create the account
    if ($userCheck == 0 && $passCheck == true && $paramCheck == true) {
        session_start();
        $_SESSION['user_name']= $cleanData['username'];
        $_SESSION['email'] = $cleanData['email'];
        generateAccountData($cleanData['username'], $cleanData['email'], $cleanData['password']);
        setPlayerStatusData('1', $cleanData['username']);
        generate_cookie($cleanData['username'],$ip);

        $result['message'] = 'New Account successfully created';
        $result['status'] = 'success';
    }

    echo json_encode($result);
}

function getAllUsers($d,$ip,$token){
    $result['d'] = $d;
    $result['$ip'] = $ip;
    $result['$token'] = $token;

    if (verify_token($ip, $token)) {
        echo getUserData();
    } else {
        $result['token'] = 'fail';
        echo json_encode($result);
    }
}


function getAvatar($email, $ip, $token) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    echo json_encode(get_avatar($email));
}




function logout($username){
    setPlayerStatusData($username,'1');
    setcookie('token', '', time() - 1*24*60*60);
}

