<?php
/*
Plugin Name: Restful API Template (with Vue)
Plugin URI: https://github.com/cloki0610/
Description: A showcase as flashcard plugin. User can press the button to display or hide the answer.
Version: 1.0
Author: C.Loki
Author URI: https://github.com/cloki0610/
License: GPLv2 or later
Text Domain: rest-api-vue-plugin
*/

// To prevent direct access to the file
defined('ABSPATH') or die('Please do not try to access this file directly!');

// Check if class exists
if (!class_exists('RestfulTemplateWithVue')) {

    class RestfulTemplateWithVue
    {
        private $namespace = "template2/v1"; // the base namespace for the endpoints

        // Constructor to add actions, filters and resources
        public function __construct()
        {
            // Custom post type
            add_action('init', array($this, 'flashcard_post_type'));
            // Post type capabilities
            add_action('init', array($this, 'add_flashcard_capabilities'));
            // Register REST API endpoints
            add_action('rest_api_init', array($this, 'register_flashcard_api'));
            // Shortcode to display a frontend widget
            add_shortcode('flashcard', array($this, 'display_flashcard'));
            // Enqueue scripts and styles
            add_action('wp_enqueue_scripts', array($this, 'enqueue'));
        }

        public function flashcard_post_type()
        { // Register custom flashcard post type
            $args = array(
                // Labels display on the admin panel
                'labels' => array(
                    'name' => __('Flashcards'),
                    'singular_name' => __('Flashcard'),
                    'add_new_item' => __('Add New Flashcard'),
                    'edit_item' => __('Edit Flashcard'),
                    'new_item' => __('New Flashcard'),
                    'view_item' => __('View Flashcard'),
                    'view_items' => __('View Flashcards'),
                    'search_items' => __('Search Flashcards'),
                    'not_found' => __('No Flashcards Found'),
                    'not_found_in_trash' => __('No Flashcards Found in Trash'),
                    'all_items' => __('All Flashcards'),
                    'archives' => __('Flashcard Archives'),
                    'attributes' => __('Flashcard Attributes'),
                    'insert_into_item' => __('Insert into Flashcard'),
                    'uploaded_to_this_item' => __('Uploaded to this Flashcard'),
                ),
                'public' => false,
                // set to true to make it public
                'has_archive' => false,
                // set to true to enable archive page
                'supports' => array('title', 'editor', 'author'),
                // post features in admin panel
                'show_in_rest' => true,
                // set to true to enable REST API
                'rest_base' => 'flashcard',
                // the base route for the default REST API endpoint
                'capability_type' => 'flashcard',
                // the capability type for the custom post type
                'map_meta_cap' => true,
                // set to true to enable custom capabilities
                'rewrite' => array('slug' => 'flashcard'),
                // the slug for the custom post type
                'hierarchical' => false,
                // set to true to enable parent-child relationship
                'menu_icon' => 'dashicons-index-card',
                // the icon for the custom post type
                'show_in_menu' => true,
                // set to true to show in admin menu when public is true
                'menu-postitin' => 7, // the position in the admin menu
            );

            // register the custom post type
            register_post_type('flashcard', $args);
        }

        public function add_flashcard_capabilities()
        { // Add custom capabilities to roles
            $roles = array('administrator', 'editor', 'author', 'subscriber');

            foreach ($roles as $role) {
                $role_object = get_role($role);
                $role_object->add_cap('read_flashcard');
                $role_object->add_cap('read_private_flashcards');
                $role_object->add_cap('create_flashcards');
                $role_object->add_cap('publish_flashcards');
                $role_object->add_cap('edit_flashcard');
                $role_object->add_cap('edit_flashcards');
                $role_object->add_cap('edit_private_flashcards');
                $role_object->add_cap('edit_published_flashcards');
                $role_object->add_cap('delete_flashcards');
                $role_object->add_cap('delete_published_flashcards');
                $role_object->add_cap('delete_private_flashcards');
            }
        }

        public function register_flashcard_api()
        { // Register custom REST API endpoints
            register_rest_route(
                $this->namespace,
                '/create',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'create_user_flashcard'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/',
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'get_user_flashcards'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/update/(?P<flashcard_id>\d+)',
                array(
                    'methods' => 'PUT',
                    'callback' => array($this, 'update_user_flashcard'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/delete/(?P<flashcard_id>\d+)',
                array(
                    'methods' => 'DELETE',
                    'callback' => array($this, 'delete_user_flashcard'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
        }

        public function enqueue()
        { // enqueue all our css, js and other resources, dequeue when shortocode not in use
            // You can add more conditions to control the scripts and styles usage
            // In this case, we enquqe the a js file, a css file and the vue cdn if the page include this shortcode
            global $post;
            if (has_shortcode($post->post_content, 'private-flashcard')) {
                wp_enqueue_style('flashcardstyle', plugins_url('/assets/css/flashcard-style.css', __FILE__));
                wp_enqueue_script('flashcard-vue3', 'https://unpkg.com/vue@3/dist/vue.global.prod.js', [], '', true);
                wp_enqueue_script('flashcardscript', plugins_url('/assets/js/flashcard.js', __FILE__));

            } else {
                wp_dequeue_style('flashcardstyle', plugins_url('/assets/css/flashcard-style.css', __FILE__));
                wp_dequeue_script('flashcard-vue3', 'https://unpkg.com/vue@3/dist/vue.global.prod.js', [], '', true);
                wp_dequeue_script('flashcardscript', plugins_url('/assets/js/flashcard.js', __FILE__));
            }
        }

        public function activate()
        { // Function to activate plugin
            flush_rewrite_rules();
        }
        public function deactivate()
        { // Function to Deactivate plugin
            flush_rewrite_rules();
        }

        public function get_user_flashcards()
        { // GET /wp-json/flashcard/v1/list - Get all flashcards for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error(
                    'authentication_error',
                    'You must be logged in to access the flashcards.',
                    array('status' => 401)
                );
            }
            $flashcards = get_posts(
                array(
                    'post_type' => 'flashcard',
                    'author' => $user_id,
                    'posts_per_page' => -1,
                    'post_status' => 'private',
                )
            );

            $formatted_flashcards = array();

            foreach ($flashcards as $flashcard) {
                $formatted_flashcards[] = array(
                    'flashcard_id' => $flashcard->ID,
                    'question' => $flashcard->post_title,
                    'answer' => $flashcard->post_content,
                );
            }

            return $formatted_flashcards;
        }

        public function create_user_flashcard($request)
        { // POST /wp-json/flashcard/v1/create - Create a new flashcard for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error(
                    'authentication_error',
                    'You must be logged in to create new flashcard.',
                    array('status' => 401)
                );
            }

            $question = sanitize_text_field($request->get_param('question'));
            $answer = sanitize_text_field($request->get_param('answer'));

            if (empty($question) || empty($answer)) {
                return new WP_Error(
                    'empty_flashcard',
                    'Please, enter a valid question and answer.',
                    array('status' => 422)
                );
            }

            $new_flashcard = array(
                'post_type' => 'flashcard',
                'post_title' => $question,
                'post_content' => $answer,
                'post_author' => $user_id,
                'post_status' => 'private',
            );

            $flashcard_id = wp_insert_post($new_flashcard);

            return array(
                'status' => 'success',
                'message' => 'Flashcard created successfully!',
                'data' => array(
                    'flashcard_id' => $flashcard_id,
                    'question' => $question,
                    'answer' => $answer,
                ),
            );
        }

        public function update_user_flashcard($request)
        { // PUT /wp-json/flashcard/v1/update/{flashcard_id} - Update an existing flashcard for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error(
                    'authentication_error',
                    'You must be logged in to update exist flashcard.',
                    array('status' => 401)
                );
            }
            $flashcard_id = $request->get_param('flashcard_id');
            $question = sanitize_text_field($request->get_param('question'));
            $answer = sanitize_text_field($request->get_param('answer'));

            if (empty($question) || empty($answer)) {
                return new WP_Error(
                    'empty_flashcard',
                    'Please, enter a valid question and answer.',
                    array('status' => 422)
                );
            }

            $flashcard = get_post($flashcard_id);

            if ($flashcard->post_author != $user_id) {
                return new WP_Error('flashcard_not_found', 'Flashcard not found for this user', array('status' => 404));
            }

            $updated_flashcard = array(
                'ID' => $flashcard_id,
                'post_title' => $question,
                'post_content' => $answer,
                'post_status' => 'private',
            );

            $flashcard_id = wp_update_post($updated_flashcard);

            return array(
                'status' => 'success',
                'message' => 'Flashcard updated successfully',
                'data' => array(
                    'flashcard_id' => $flashcard_id,
                    'question' => $question,
                    'answer' => $answer,
                ),
            );
        }

        public function delete_user_flashcard($request)
        { // DELETE /wp-json/flashcard/v1/delete/{flashcard_id} - Delete an existing flashcard for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error(
                    'authentication_error',
                    'You must be logged in to delete exist flashcard.',
                    array('status' => 401)
                );
            }
            $flashcard_id = $request->get_param('flashcard_id');

            $flashcard = get_post($flashcard_id);

            if ($flashcard->post_author != $user_id) {
                return new WP_Error(
                    'flashcard_not_found',
                    'Flashcard not found for this user',
                    array('status' => 404)
                );
            }

            $flashcard_deleted = wp_delete_post($flashcard_id, true);

            if ($flashcard_deleted) {
                return array(
                    'message' => 'Flashcard deleted successfully',
                    'flashcard_id' => $flashcard_id
                );
            } else {
                return new WP_Error('flashcard_not_deleted', 'There was an error deleting the flashcard', array('status' => 500));
            }
        }

        public function display_flashcard()
        { // With add_action function with selected label name,
            //user can use a shortcode to rednder the html template
            ob_start();
            // create a nonce for the client side if using cookies for authorization
            $nonce = wp_create_nonce('wp_rest', 'wp_rest_nonce');

            // The template will return to client side
            $output = '<div id="flashcard"><div class="flashcard-container">';
            $output .= '<section class="flashcard-bar"><base-button @click="addForm">Add Flashcard</base-button></section>';
            $output .= '<!-- Display cards with questions and answers -->';
            $output .= '<section class="flashcard-section">';
            $output .= '<flashcard-list :list="flashcards" @update-form="editForm" @delete-flashcard="deleteFlashcard">';
            $output .= '</flashcard-list></section>';
            $output .= '<flashcard-form @close="hideForm" @on-add="addFlashcard" @on-update="updateFlashcard" ';
            $output .= ':open="formOpen" :formtype="formType" :selecteditem="selectedItem"></flashcard-form>';
            $output .= '<input type="hidden" id="wp_rest_nonce" value="' . esc_attr($nonce) . '"/>';
            $output .= '</div></div>';
            ob_end_clean();
            return $output;
        }
    }

    // Create a new instance to use the plugin
    $rest_with_vue = new RestfulTemplateWithVue();

    // Call the activate function to activate plugin
    register_activation_hook(__FILE__, array($rest_with_vue, 'activate'));

    // Call the deactivate function to activate plugin
    register_deactivation_hook(__FILE__, array($rest_with_vue, 'deactivate'));
}
?>
