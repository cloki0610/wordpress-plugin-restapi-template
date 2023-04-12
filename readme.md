# Wordpress RESTful API plug-in template

## Description

This is just a simple template to create some RESTful API endpoints by php and wordpress CMS system.
Basically these plug-in will create a custom post type and some custom endpoint to receive user request and send response with different result.

The authorization and authentication is handle by wordpress internal authorization system.
So most of the time we have to send a nounce back to user if the endpoint require authentication.
Then user can use their nounce and cookie to interact with API.

In these two following showcase,
the first plug-in is a simple todo list application include 5 route for basic CRUD feature,
and using HTML and vanilla javascript to provide a front-end widgets.

The second plug-in is a flashcard application include 4 route for CRUD feature, 
and using HTML and Vue3 via enqueue the Vue CDN to create to provide a front-end widgets.

A empty CSS file also include in the plug-ins for template usage.

The endpoints only allow those user who have logged in to use the endpoint.
The route will also send error response if the search result cannot find any post create by the user, or if the input is empty.

It is a pretty simple plug-ins, please feel free to let me know your thoughts or anything I can improve.

## Installation

To install the plug-in, we only need to move the folder to ../website/app/public/wp-content/plugins
Then activate the plug-in at wordpress admin panel.

To use the plug-in, we have to add [todo-list] or [flashcard] to the post or page content.
If the plug-in is successfully activated, the front-end widget will be add to the page.

## Cautions

Wordpress have its own default RESTful API endpoints. So we also have to set the post capabilites carefully and disable the default endpoint if we want.

We can also cooperate different third party plug-ins to provide different authorization and authentication methods such as JWT.
