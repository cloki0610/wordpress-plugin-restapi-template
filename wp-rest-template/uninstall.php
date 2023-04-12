<?php

/**
 * Trigger this file on Plugin uninstall
 *
 * @package  RestfulTemplate
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

// Clear Database stored data
$todos = get_posts(array('post_type' => 'todo', 'numberposts' => -1));

foreach ($todos as $todo) {
    wp_delete_post($todo->ID, true);
}