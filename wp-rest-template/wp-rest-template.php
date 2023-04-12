<?php
/*
Plugin Name: Restful Template
Plugin URI: https://github.com/cloki0610/
Description: A showcase as todolist plugin. Just simple todo list without style.
Version: 1.0.0
Author: C.Loki
Author URI: https://github.com/cloki0610/
License: GPLv2 or later
Text Domain: restful-template-plugin
*/

// To prevent direct access to the file
defined('ABSPATH') or die('Please do not try to access this file directly!');

// Check if class exists
if (!class_exists('RestfulTemplate')) {

    class RestfulTemplate
    {

        private $namespace = "todo/v1"; // The base namespace for the endpoints

        // Constructor to add actions, filters and resources
        public function __construct()
        {
            // Custom post type
            add_action('init', array($this, 'todo_post_type'));
            // Custom post type metadata
            add_action('init', array($this, 'add_todo_meta'));
            // Post type capabilities
            add_action('init', array($this, 'add_todo_capabilities'));
            // Register REST API endpoints
            add_action('rest_api_init', array($this, 'register_todo_api'));
            // Shortcode to display a frontend widget
            add_shortcode('todo-list', array($this, 'display_todo'));
            // Enqueue scripts and styles
            add_action('wp_enqueue_scripts', array($this, 'enqueue'));
        }

        public function todo_post_type()
        { // Register custom todo post type
            $args = array(
                'labels' => array(
                    'name' => __('Todos'),
                    'singular_name' => __('Todo'),
                    'add_new_item' => __('Add New Todo'),
                    'edit_item' => __('Edit Todo'),
                    'new_item' => __('New Todo'),
                    'view_item' => __('View Todo'),
                    'view_items' => __('View Todos'),
                    'search_items' => __('Search Todos'),
                    'not_found' => __('No Todos Found'),
                    'not_found_in_trash' => __('No Todos Found in Trash'),
                    'all_items' => __('All Todos'),
                    'archives' => __('Todo Archives'),
                    'attributes' => __('Todo Attributes'),
                    'insert_into_item' => __('Insert into Todo'),
                    'uploaded_to_this_item' => __('Uploaded to this Todo'),
                ),
                'public' => false,
                'has_archive' => false,
                'supports' => array('title', 'editor', 'author'),
                'show_in_rest' => true,
                'rest_base' => 'todo',
                'capability_type' => 'todo',
                'map_meta_cap' => true,
                'rewrite' => array('slug' => 'todo'),
                'hierarchical' => false,
                'menu_icon' => 'dashicons-saved',
                'show_in_menu' => true,
                'menu-postitin' => 7,
            );
            register_post_type('todo', $args);
        }

        public function add_todo_meta()
        { // Add custom boolean meta data to todo post type
            register_meta(
                'todo',
                'checked',
                array(
                    'type' => 'boolean',
                    'default' => false,
                    'single' => true,
                    'show_in_rest' => true,
                )
            );
        }

        public function add_todo_capabilities()
        { // Add custom capabilities to roles
            $roles = array('administrator', 'editor', 'author', 'subscriber');

            foreach ($roles as $role) {
                $role_object = get_role($role);
                $role_object->add_cap('read_todo');
                $role_object->add_cap('read_private_todos');
                $role_object->add_cap('create_todos');
                $role_object->add_cap('publish_todos');
                $role_object->add_cap('edit_todo');
                $role_object->add_cap('edit_todos');
                $role_object->add_cap('edit_private_todos');
                $role_object->add_cap('edit_published_todos');
                $role_object->add_cap('delete_todos');
                $role_object->add_cap('delete_published_todos');
                $role_object->add_cap('delete_private_todos');
            }
        }

        public function register_todo_api()
        { // Register REST API endpoints
            register_rest_route(
                $this->namespace,
                '/create',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'create_user_todo'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/list',
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'get_user_todos'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/update/(?P<todo_id>\d+)',
                array(
                    'methods' => 'PUT',
                    'callback' => array($this, 'update_user_todo'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/delete/(?P<todo_id>\d+)',
                array(
                    'methods' => 'DELETE',
                    'callback' => array($this, 'delete_user_todo'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
            register_rest_route(
                $this->namespace,
                '/toggle/(?P<todo_id>\d+)',
                array(
                    'methods' => 'PUT',
                    'callback' => array($this, 'todo_checked'),
                    'permission_callback' => function () {
                        return is_user_logged_in();
                    }
                )
            );
        }
        public function enqueue()
        { // enqueue all our css, js and other resources, dequeue when shortocode not in use
            // You can add more conditions to control the scripts and styles usage
            // In this case, we enquqe the a js file, a css file if page content include this shortcode
            global $post;
            if (has_shortcode($post->post_content, 'todo-list')) {
                wp_enqueue_style('todostyle', plugins_url('/assets/todostyle.css', __FILE__));
                wp_enqueue_script('todoscript', plugins_url('/assets/todoscript.js', __FILE__));

            } else {
                wp_dequeue_style('todostyle', plugins_url('/assets/todostyle.css', __FILE__));
                wp_dequeue_script('todoscript', plugins_url('/assets/todoscript.js', __FILE__));
            }
        }

        public function activate()
        { // Activate plugin
            flush_rewrite_rules();
        }
        public function deactivate()
        { // Deactivate plugin
            flush_rewrite_rules();
        }

        public function get_user_todos()
        { // GET http://doamin.name/wp-json/todo/v1/list - Get all todos for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error('authentication_error', 'You must be logged in to access todo list.', array('status' => 401));
            }
            $todos = get_posts(
                array(
                    'post_type' => 'todo',
                    'author' => $user_id,
                    'posts_per_page' => -1,
                    'post_status' => 'private'
                )
            );

            $formatted_todos = array();

            foreach ($todos as $todo) {
                $formatted_todos[] = array(
                    'todo_id' => $todo->ID,
                    'todo' => $todo->post_title,
                    'description' => $todo->post_content,
                    'checked' => get_post_meta($todo->ID, 'checked', true)
                );
            }

            return $formatted_todos;
        }

        public function create_user_todo($request)
        { // POST http://doamin.name/wp-json/todo/v1/create - Create a new todo for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error('authentication_error', 'You must be logged in to create new todo.', array('status' => 401));
            }

            $todo = sanitize_text_field($request->get_param('todo'));
            $description = sanitize_text_field($request->get_param('description'));

            if (empty($todo) || empty($description)) {
                return new WP_Error(
                    'empty_todo',
                    'Please, enter a valid todo and description.',
                    array('status' => 422)
                );
            }

            // Code to create and save the todo goes here...
            $new_todo = array(
                'post_type' => 'todo',
                'post_title' => $todo,
                'post_content' => $description,
                'post_author' => $user_id,
                'post_status' => 'private'
            );

            $todo_id = wp_insert_post($new_todo);
            add_post_meta($todo_id, 'checked', false);

            return array(
                'status' => 'success',
                'message' => 'Todo task created successfully!',
                'data' => array(
                    'todo_id' => $todo_id,
                    'todo' => $todo,
                    'description' => $description,
                ),
            );
        }

        public function update_user_todo($request)
        { // PUT http://doamin.name/wp-json/todo/v1/update/{todo_id} - Update an existing todo for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error('authentication_error', 'You must be logged in to update exist todo.', array('status' => 401));
            }
            $todo_id = $request->get_param('todo_id');
            $todo = sanitize_text_field($request->get_param('todo'));
            $description = sanitize_text_field($request->get_param('description'));

            if (empty($todo) || empty($description)) {
                return new WP_Error(
                    'empty_todo',
                    'Please, enter a valid todo and description.',
                    array('status' => 422)
                );
            }

            $todo = get_post($todo_id);

            if ($todo->post_author != $user_id) {
                return new WP_Error('todo_not_found', 'Todo task not found for this user', array('status' => 404));
            }

            $updated_todo = array(
                'ID' => $todo_id,
                'post_title' => $todo,
                'post_content' => $description
            );

            $todo_id = wp_update_post($updated_todo);

            return array(
                'message' => 'Todo task updated successfully',
                'todo_id' => $todo_id
            );
        }

        public function delete_user_todo($request)
        { // DELETE http://doamin.name/wp-json/todo/v1/delete/{todo_id} - Delete an existing todo for current user
            $user_id = get_current_user_id();
            if (!$user_id) {
                return new WP_Error('authentication_error', 'You must be logged in to delete exist todo.', array('status' => 401));
            }
            $todo_id = $request->get_param('todo_id');

            $todo = get_post($todo_id);

            if ($todo->post_author != $user_id) {
                return new WP_Error('todo_not_found', 'Todo task not found for this user', array('status' => 404));
            }

            $todo_deleted = wp_delete_post($todo_id, true);

            if ($todo_deleted) {
                return array(
                    'message' => 'Todo task deleted successfully',
                    'todo_id' => $todo_id
                );
            } else {
                return new WP_Error('todo_not_deleted', 'There was an error deleting the todo task', array('status' => 500));
            }
        }

        function todo_checked($request)
        { // PUT http://doamin.name/wp-json/todo/v1/toggle/{todo_id} - Toggle the checked status of a todo
            $todo_id = $request->get_param('todo_id');
            $todo = get_post($todo_id);

            if (!$todo || $todo->post_type !== 'todo') {
                return new WP_Error('invalid_todo_task', 'Invalid todo ID.', array('status' => 400));
            }

            $checked = get_post_meta($todo_id, 'checked', true);

            // Toggle the 'checked' value
            $checked = !$checked;

            // Update the 'checked' value
            update_post_meta($todo_id, 'checked', $checked);

            return array('todo_id' => $todo_id, 'checked' => $checked);
        }

        function display_todo()
        { // With add_action function with selected label name,
            //user can use a shortcode to rednder the html template
            ob_start();
            $nonce = wp_create_nonce('wp_rest', 'wp_rest_nonce');
            $user_id = get_current_user_id();

            $todos = get_posts(
                array(
                    'post_type' => 'todo',
                    'author' => $user_id,
                    'posts_per_page' => -1,
                    'post_status' => 'private',
                )
            );

            $formatted_todos = "";

            foreach ($todos as $todo) {
                $todo_checked = get_post_meta($todo->ID, 'checked', true) ? 'checked' : '';
                $formatted_todos .= '<li class="list-item"><span class="close" id="d-' . $todo->ID . '">x</span>';
                $formatted_todos .= '<div id="t-' . $todo->ID . '" class="' . $todo_checked . '"><h5>' . $todo->post_title . '</h5>';
                $formatted_todos .= '<p>' . $todo->post_content . '</p></div></li>';
            }

            $icon_url = plugins_url('assets/icon.png', __FILE__);
            $output = '<section>';
            $output .= '<div class="todo-container">';
            $output .= '<div class="todo-app">';
            $output .= '<h2>Task Manager <img src="' . $icon_url . '" /></h2>';
            $output .= '<div class="todo-row">';
            $output .= '<input type="text" id="todo-name" name="todo-name" placeholder="Task Name" />';
            $output .= '<input type="text" id="todo-desc" name="todo-desc" placeholder="Task Description" />';
            $output .= '<button id="add-task">Add</button>';
            $output .= '</div>';
            $output .= '<ul id="list-container">';
            $output .= $formatted_todos;
            $output .= '</ul></div></div>';
            $output .= '<p id="error-message"></p></section>';
            $output .= '<input type="hidden" id="wp_rest_nonce" value="' . esc_attr($nonce) . '"/>';
            ob_end_clean();
            return $output;
        }
    }

    // Create a new instance to use the plugin
    $rest_temp = new RestfulTemplate();

    // Call the activate function to activate plugin
    register_activation_hook(__FILE__, array($rest_temp, 'activate'));

    // Call the deactivate function to activate plugin
    register_deactivation_hook(__FILE__, array($rest_temp, 'deactivate'));

}

?>