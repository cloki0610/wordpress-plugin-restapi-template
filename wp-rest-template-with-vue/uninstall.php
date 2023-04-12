<?php

/**
 * Trigger this file on Plugin uninstall
 *
 * @package  RestfulTemplateWithVue
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

// Clear Database stored data
$flashcards = get_posts(array('post_type' => 'flashcard', 'numberposts' => -1));

foreach ($flashcards as $flashcard) {
    wp_delete_post($flashcard->ID, true);
}