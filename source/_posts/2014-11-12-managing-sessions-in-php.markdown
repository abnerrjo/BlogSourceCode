---
layout: post
title: "Managing sessions in PHP"
date: 2014-11-12 20:40:47 -0300
comments: true
categories: [Tutorials, PHP]
---
HTTP is a stateless protocol. However, sometimes we *do* want to keep some state of the application, like, for example, some information about the current user who is browsing your site. In PHP and most backend languages in general, there are two ways to do that:

- Cookies
- Sessions

There are some differences between the two techniques:

<!-- more -->
- Cookies are kept on user's machine while sessions stay on server;
- Usually, cookies last longer than sessions, where the latter lasts until the user closes the browser;
- Sessions support a bigger quantity of data.

On this tutorial we're going to focus in sessions.

## Starting a session
To start a session, use the method session_start()

``` PHP
<?php
session_start();
//$_SESSION says: USE MEEE!!!
?>
```

Sessions are accessible through the superglobal variable $_SESSION. This variable is a simple array, wherein its values are persisted on a file on the server machine. To identify each user, sessions use a small cookie called session_id. 

Generally sessions are started automatically after the first time use start them. This behavior is defined on the parameter *session.auto_start* on the config file *php.ini*. Because of that, it's a good pratice to check if a session is already started before you start it again:

``` PHP
if (!isset($_SESSION)) {
	session_start();
}
```

Since version 5.3, PHP will print an error message whenever you start an already started session.

## Creating session variables
Create session variables is pretty simple. You just need to assign a value to a array key. Example:

``` PHP
<?php
if (!isset($_SESSION)) {
	session_start();
}
$_SESSION["name"] = "Abner";
?>
```

## Accessing variables
In order to access session variables, you first need to start a session. After that, all variables are accessible through the superglobal variable $_SESSION. That's that simple. :)

``` PHP
<?php
if (!isset($_SESSION)) {
	session_start();
}
echo $_SESSION["name"]; //Abner
?>
```

## Modify variables
That follows the same principle of create. Just override the old value.

``` PHP
<?php
$_SESSION["name"] = "Ana"; //overrided what was there before
?>
```

## Deleting variables or the entire session
To delete a session variable, use the method unset, as you'd do with any other variable:

``` PHP
<?php
unset($_SESSION["name"]); //variable is deleted from session
?>
```

But if you wish to delete all variables at once, the way to do that is using the method session_unset.

``` PHP
<?php
session_unset();
?>
``` 

Notice this method is deprecated. The correct way to do that is simply setting a new array to $_SESSION.

``` PHP
<?php
$_SESSION = array();
?> 
```

And then the Garbage Collect will free the memory allocation for the old variables.

Even so, if you really wish to destroy the session by complete and not just clean it, you can use session_destroy.

``` PHP
<?php
session_destroy();
?>
```

While this method destroys the session file on server machine, the session (and its variables) still exists on memory and will keep existing until the user go to another page. Because of that, it's recommended you clean the session before destroying it.



Well, that's it folks! :)

I hope you appreciated today's tutorial. 
