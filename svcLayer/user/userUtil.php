<?php

require_once('./BizDataLayer/userData.php');
require_once('./svcLayer/security.php');



/**
 * Cleans the login form data
 * @param $data
 * @return mixed
 */
function cleanLoginFormData($data){
    $args = array (
        'username' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
        'password' => FILTER_SANITIZE_STRING
    );
    $sanitizedData = filter_var_array($data, $args);
    return $sanitizedData;
}

/**
 * Cleans the registration form data
 * @param $data
 * @return array
 */
function cleanRegisterFormData($data){
    $args = array (
        'email' => FILTER_SANITIZE_EMAIL,
        'username' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
        'password' => FILTER_SANITIZE_STRING,
        'password-confirm' => FILTER_SANITIZE_STRING
    );

    $sanitizedData = filter_var_array($data, $args);
    $filteredData = array_filter(array_map('trim', $sanitizedData));

    return $filteredData;
}

/**
 * Converts a data string from the client into an array
 * ex --> username=xxx&password=xxx
 * @param $queryString
 * @return array
 */
function parseDataFromRequest($queryString){
    $result = array();

    foreach (explode('&', $queryString) as $pair) {
        list ($key, $val) = explode('=', $pair);
        $result[$key] = $val;
    }

    return $result;
}


/**
 * Get either a Gravatar URL or complete image tag for a specified email address.
 *
 * @param string $email The email address
 * @param string $s Size in pixels, defaults to 80px [ 1 - 2048 ]
 * @param string $d Default imageset to use [ 404 | mm | identicon | monsterid | wavatar ]
 * @param string $r Maximum rating (inclusive) [ g | pg | r | x ]
 * @param bool $img True to return a complete IMG tag False for just the URL
 * @param array $atts Optional, additional key/value attributes to include in the IMG tag
 * @return String containing either just a URL or a complete image tag
 * @source http://gravatar.com/site/implement/images/php/
 */
function get_avatar( $email, $s = '80', $d = 'mm', $r = 'g', $img = true, $atts = array() ) {
    $url = 'http://www.gravatar.com/avatar/';
    $url .= md5( strtolower( trim( $email ) ) );
    $url .= "?s=$s&d=$d&r=$r";
    if ( $img ) {
        $url = '<img src="' . $url . '"';
        foreach ( $atts as $key => $val )
            $url .= ' ' . $key . '="' . $val . '"';
        $url .= ' />';
    }
    return $url;
}



?>