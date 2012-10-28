<?php
//start the session
session_start();

require_once("settings.php");

//if not logged in, re-direct to login page
if ( empty($_SESSION['username']) || empty($_COOKIE['token']) ) {
    header("location: index.php");
}

$page = new Page();
$page->html_header(null,'Connect 4 - Game');

new dBug($_COOKIE);
new dBug($_SESSION);

?>

    <section class="game-outside-container">


    </section>

<?php


$page->html_footer();

?>