# Wordpress RESTful API plug-in template

## Description

This is just a simple template to create some RESTful API endpoints by php and wordpress CMS system.
Basically these plug-in will create a custom post type and some custom endpoint to receive user request and send response with different result.

The authorization and authentication is handle by wordpress internal authorization system.
So most of the time we have to send a nounce back to user if the endpoint require authentication.
Then user can use their nounce and cookie to interact with API.

## Installation

To install the plug-in, we only need to move the folder to ../website/app/public/wp-content/plugins
Then activate the plug-in at wordpress admin panel.

## Cautions

Wordpress have its own default RESTful API endpoints. So we also have to set the post capabilites carefully and disable the default endpoint if we want.
