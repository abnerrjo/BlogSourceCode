---
layout: post
title: "Creating user authentification with Code Igniter"
date: 2014-09-30 07:45:45 -0300
comments: true
categories: [PHP, Tutorials]
---
I'm a complete n00b in PHP. My first sites were done without a framework, I even got them to work, but the experience was a bit.. traumatizing, to say the least :P

I badly needed a framework to help me, but that wasn't necessary to spend more time learning how to use it than to developing the site. Oh boy, Code Igniter *is* that framework! 

It's totally clean and intuitive, and it contains the only necessary to put it together.
 
In today's post I show you how to make a simple code authentification using it. Let's go!

-> [Click here to download the complete example]({{ root_url }}/downloads/code/auth.zip) <-

<!-- more -->

I designed this tutorial to a completly novice person. So if you already know a bit about this framework, I apologize in advance.

And was a prerequisite I assume that you aready have a HTTP local server that supports PHP. If you don't, don't worry, you can do it with a [LAMP software](https://www.apachefriends.org/pt_br/index.html). 

## "Installing" the framework

Now let's download the CodeIgniter! :D

Go to [CodeIgniter site](https://ellislab.com/codeigniter) and click on Download.

To create a new project with it, you just need to copy and paste the CodeIgniter folder. Damn, the simplicity makes me want to cry! T_T 

## Creating our database 

Our first task is to create our database. We are going to need a User containing name, login and password, so our database will have only one table, and it's pretty simple:

``` SQL
CREATE TABLE IF NOT EXISTS `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
```

To link your database to the CodeIgniter, go to your project's folder > application > config > database.php

In the lines 52 to 54, you can find the following code:

``` PHP
$db['default']['username'] = '';
$db['default']['password'] = '';
$db['default']['database'] = '';
``` 
You just need to fill it with the informations related to your database.

## Creating the Views

CodeIgniter, as most frameworks, use the MVC pattern. It separates the visualization of the data (views: HTML, CSS, ...) from the business logic (models: PHP itself, including database queries) and it has a controller that serves as a bridge between the two.

Let's start creating the views, and right after the models and for last the controller.

To create a new view, go to your project's folder > views and create a new HTML or PHP file right there. It's cool to make subfolders, to keep it well organized, you know? 

Because of it, we are going to create the login and register views inside a subfolder called "*auth*".

Inside this subfolder, create four files: *login.php*, *register.php*, *success.php* and *fail.php*. 

At first, you could think in each file containing the following structure:

``` HTML
<!DOCTYPE HTML>
<html>
<head>
...
</head>
</html>
``` 

But here's where the framework comes at the play! You don't need to repeat any HTML structure. You can refactor it into a file apart and reuse it in all files.

Because of that, we are going to create two other files: *header.php* and *footer.php*. The first containing the HTML header and the second containg the tags closure.


``` PHP header.php
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="utf-8">
		<title>CodeIgniter User Auth</title>
	</head>
	<body>
```

``` PHP footer.php
	</body>
</html>
```

Now let's come back to the other four files we had created previously, starting with *login.php*:

``` PHP login.php
<?php echo form_open('login'); ?>
	<input type="text" name="login" placeholder="Login" required />
	<input type="password" name="password" placeholder="Password" required />
	<button type="submit">Log in</button>
</form>		
<a href="<?php echo base_url(); ?>index.php/register">Click here to register!</a>	
```
This file is basically a form contaning two input fields: One for the login and another for the password. 

Now there's a strange file in this file. Can you notice it? Actually two!

The first one is the **echo form_open('login)** statement. What does it do?

It basically creates a new form with the tag `<form>`, but with the difference it already set the action with the correct route. Don't worry, we'll talk about rotes later. 

And the second strange thing is the **echo base_url()** statement right below the `</form>`. It simply print the base url of our website. For example, in the case of this blog, it would print *[http://picoledelimao.github.io/](http://picoledelimao.github.io/)*. It's important because sometimes you want to put a link based on the absolute path, but you don't want to say your site domain explicitly.

*Take a breath now*

Rested? Now let's go to the *register.php* file:

``` PHP register.php
<?php echo form_open('new_register'); ?>
	<input type="text" name="name" placeholder="Name" required maxlength="100" autofocus /> 
	<input type="text" name="login" placeholder="Login" required maxlength="30" />
	<input type="password" name="password" placeholder="Password" required maxlength="30" />
	<button type="submit">Cadastrar</button>
</form>
```
It follows the same logic of the login.php file. Just noticed the additional attribute "*maxlength*" on the input fields. I put it so it can match the constraints I defined on our database. It's not really essential.

And, for last, the *success.php* and *fail.php* files, that will show messages to ther user based on his success in logging in. They don't have any trick:

``` PHP fail.php
Fail to log in. <a href="index">Try again.</a>
```

``` PHP success.php
Hello, <?php echo $user; ?>. You are logged in!
<a href="logout">Click here to log out.</a>
``` 

> Hey!! You said it didn't have any trick! So what about this variable $user?

Yea, I lied... Sorry about that :P

You can send some data to the views through the controllers (remember I said the controller was a bridge between models and views?). In this case, $user variable representates the user name. But don't worry, we'll use how it works with more details later.

**Done**! Your views folder must have the following structure:

+ views
	+ auth
		+ header.php
		+ footer.php
		+ login.php
		+ register.php
		+ fail.php
		+ success.php


## Creating the models

The models, in CodeIgniter, stand in the application > models folder. Let's start creating our own. We are just going to need one, and to it we will delegate all the database queries. 

Create a file called **usermodel.php**. Every model in CodeIgniter has the following structure:

``` PHP
<?php
class NAME extends CI_Model {

}?>
``` 

In our case, it'd be something like that:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

}?>
``` 

Another important thing is, before we use our database, we need to load it! We can do it in the own class constructor:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

}?>
``` 
Our simple model will have only two methods: *login* and *register*.

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

	function login($login, $password) {
		
	}
	
	function register($name, $login, $password) {
		
	}
	
}?>
```

Let's start with the *login* method. What it does is basically pretty simple: It looks the User table searching for a user containg the same login and password passed through the parameters. In case it finds it, it returns true.

Of course, we aren't fool to the point to put the original password on our database. We need some kind of encryption to store the password. I will use a famous one called [MD5](http://pt.wikipedia.org/wiki/MD5).

Now to search the table for a user containg the same login and password, we are going to need a SELECT clausure. Gladly, CodeIgniter gives us a simpler way to do that, using [Active Record](https://ellislab.com/codeigniter/user-guide/database/active_record.html). 

``` PHP usermodel.php
function login($login, $password) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$this->db->where("password", md5($password));
}
``` 

Active Record is called that way because some queries are kept in the memory, avoiding double work in case you use the same query again later.

The above block statement is selecting all columns where its login is equals to the passed login and its password is equals to the passed **encrypted** password.

Now to get the resulting rows, we just need to apply the method "*get*". We don't need to get any other information other than if there is any resulting row or not (if there's, it means the passed user is valid and so it can login). To check the number of resulting rows, we can use the method "*num_rows*":

``` PHP usermodel.php
function login($login, $password) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$this->db->where("password", md5($password));
	$query = $this->db->get();
	return $query->num_rows() > 0;
}
```

And so the method login is ready! It wasn't complicated, was it?

Now let's go to the register method now. It works in a similiar way, but now we aren't interesting in selecting rows, but inserting them. Gladly, there's also a magical method for this task:

``` PHP usermodel.php
function register($name, $login, $password) {
	if ($this->exists($login)) return;
	$this->db->insert('User', array(
		'name' => $name,
		'login' => $login,
		'password' => md5($password)
	));
}
```

The magical method I'm talking about is the "*$this->db->insert*". It receives two arguments: A string containing the table name, and an associative array containing the columns name and their values. 

In the above example, I'm inserting a new row to the **User** table with the name, login and password passed through the parameters. 

There's another thing in our code: The method "*exists*". What it does is to search the table for an user containing the given login and returns true if it finds it. Remember! The login is unique. So we need to check it before to insert it. 

However, it is not a built-in method. Therefore, here is its code:

``` PHP usermodel.php
private function exists($login) {
	$this->db->select("*");
	$this->db->from("User");
	$this->db->where("login", $login);
	$query = $this->db->get();
	return $query->num_rows() > 0;
}
```

I think you can figure it out from the *login* method, since they are both very similar.

And it's **done**! Our complete model is here:

``` PHP usermodel.php
<?php
class UserModel extends CI_Model {

	public function __construct() {
		$this->load->database();
	}

	function login($login, $password) {
		$this->db->select("*");
		$this->db->from("User");
		$this->db->where("login", $login);
		$this->db->where("password", md5($password));
		$query = $this->db->get();
		return $query->num_rows() > 0;
	}
	
	private function exists($login) {
		$this->db->select("*");
		$this->db->from("User");
		$this->db->where("login", $login);
		$query = $this->db->get();
		return $query->num_rows() > 0;
	}

	function register($name, $login, $password) {
		if ($this->exists($login)) return;
		$this->db->insert('User', array(
			'name' => $name,
			'login' => $login,
			'password' => md5($password)
		));
	}
	
}?>
```

## Creating the controller

Finally! Let's work on the controller. Let's start creating a file called **user.php** on application > controllers folder. This file has the following structure:

``` PHP user.php
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct() {
		parent::__construct();
	    }

}
```

That is, as you assumed, the default structure of a controller in CodeIginiter. All them inherit from CI_Controller.

We can also define which models we are going to use. It must be done inside your controller constructor in the following way:

``` PHP user.php
public function __construct() {
	parent::__construct();	
	$this->load->model("usermodel");
}
```

If you need more models, just copy/paste the "*$this->load->model*" statement and pass to it the name of the file where the model is.

We also need to load some utils:

``` PHP user.php
public function __construct() {
	parent::__construct();
        $this->load->helper(array('url', 'form'));
        $this->load->model("usermodel");
}
```

Now let's create the **view** method, that will receive a file inside the views folder and will join it with the header and the footer to make the complete page. CodeIgniter gives us an interesting method to do that, called "*$this->load->view*".

``` PHP user.php
private function view($page) {
	$this->load->view("auth/header");
	$this->load->view($page);
	$this->load->view("auth/footer");
}
``` 

Now we already have a method to visualize our pages, let's start creating methods to show those pages.

The first one is the "*index*" method, that will show the initial page.

``` PHP user.php
public function index() {
	$this->view("auth/login");
}
```

Hmmmm... Quite easy. :)
It just call the method "view" passing as argument the page "auth/login" we had create on the beginning of this tutorial.

Now let's do the same thing to the pages "*register*", "*fail*" and "*success*":

``` PHP user.php
public function register() {
	$this->view("auth/register");
}

public function fail() {
	$this->view("auth/fail");
}

public function success() {
	$this->view("auth/success");
}
```

Those are cool methods, but how do we access them through a URL? It's time to talk about routing. Routing is just like that: The process of associate a method to an URL!

By default, each public method inside the controller is accessible through the following link:

``` HTML
<url_base>/index.php/<controller_name>/<method_name>
```

But what do we really want is to reduce the URL to the following:

``` HTML
<url_base>/index.php/<method_name>
```

Because it's simpler! :)

In order to do that, go to application > config > routes.php. On line 41, change "default_controller" to "user":

``` PHP routes.php
$route['default_controller'] = "user";
```

And now let's define the routes to the methods we created in the controller:

``` PHP routes.php
$route['index'] = "user/index";
$route['success'] = "user/success";
$route['fail'] = "user/fail";
$route['register'] = "user/register";
```

It's simple to understand: The key of the *$route* array is actually the link after the base url. For example:

`$route["success"] will turn into base_url/success`

And its value is the method of the controller that it's associated. In the case of success, for example, it's associated with the method "success" of the controller "user".

Gotcha? Good! :)

We also need to define some other routes necessary for our site. They are: **login** (route that will allow us to login), **logout** (routes that will allow us to log out) and **new_register** (route that will allow us to register a new user).

``` PHP routes.php
$route['login'] = "user/login";
$route['logout'] = "user/logout";
$route['new_register'] = "user/new_register";
```

Those routes are a bit different from the others we created previously. They are not intended to show any page, but to proccess some information passed through the forms (a POST requisition). If you scroll up, remember we used the statement "*form_open("...")*" to create a new form? The passed argument to this method now representates a route here. 

Of course, they, like any other route, are associate with a controller method, methods we didn't create yet, so let's do it! 

Let's start with the login method. We know the form will send a **POST** requisition to this method. Let's get the fields data through the method "*$this->input->post*", where the passed argument is the field name.

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
}
```

The above code is getting the values of the login and password fields. 

Now we have them, we can use the **UserModel** model to validate those informations and check if the user is valid:

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {

	} else {

	}
}
```

As showed, to use a model method, you use the following syntax; "*$this->modelname->methodName(...)*".

Even more interesting: We didn't instanciate any model! So how can we use its methods? It's simple: When we load a model, CodeIgniter implicity create a class attribute named with the same name of the model but in lowercase and set it to a new instance of this model. That's why we can use "*$this->modelname*" without problems.

Now let's go back to our method. We know if the code enter on if block, the user is valid so it can login. But which actions should we do to indicate to the user that he is logged in? More importantly, how to notify the system that the *which* user is logged in? 

We are going to need the information that which user is logged in in a PHP session. CodeIgniter provides us utility methods to ease the managment of sessions. In order to use them, we need to load the library on the controller constructor:

``` PHP user.php
public function __construct() {
	...
	$this->load->library('session');
}
``` 

To raise the security level, CodeIgniter forces us to use a encription key to our sessions. To define it, go to application > config > config.php, on line 227, and set the value of the variable **$config['encription_key']** to any really long number.

Now back to our controller, add the following lines to our "*login*" method:

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
	} else {

	}
}
``` 

Basically, it's setting a new variable to our session named "user" and its value containing the login of the logged user. We can access the stored value through the following statement:

``` PHP
$this->session->userdata("user");
``` 

This way we can now know which user is logged in, or null if there's any user logged in at the moment.

If you also need to store more informations about the user, we can follow the same logic, just by replacing "user" by another variable you want to use.

Now we already store the user, let's redirect the user to the success page.

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
		redirect("success", "refresh");
	} else {

	}
}
``` 
And you need to redirect the user to the fail page in case the login is incorrect:

``` PHP user.php
public function login() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	if ($this->usermodel->login($login, $password)) {
		$this->session->set_userdata("user", $login);
		redirect("success", "refresh");
	} else {
		redirect("fail", "refresh");
	}
}
```

Now, if you remember, there was a little trick on "sucess.php" view page. The variable "*$user*"! From where did it come from? We'll work on it now. 

Before that, modify the method "view" on the controller to now receive an array called $data. This parameter will be optional, so set it as false as default value. On "$this->load->view" statement inside this method, pass the array too, so the pages can access it. 

``` PHP user.php
private function view($page, $data=false) {
	$this->load->view("auth/header.php", $data);
	$this->load->view($page, $data);
	$this->load->view("auth/footer.php", $data);
}
``` 

Now, on "success" method, add the following method before calling the "view" method: 

``` PHP user.php
public function success() {
	$data["user"] = $this->session->userdata("user");
	...
}
```

And now modify the method call right below to pass this array too:

``` PHP user.php
public function success() {
	$data["user"] = $this->session->userdata("user");
	$this->load->view("auth/success.php", $data);
}
```

This way the array $data containing the key "user" is passed to the page "*success.php*", but there each array key is accessible through independent variables. For example, $data["user"] becomes $user there. :)

Now we just need to add a little defailt on "index" method. If the user is already logged in, instead of showing the initial page where he can log in, it redirects him to the success page. It can be done easily through the "redirect" method:

``` PHP user.php
public function index() {
	if ($this->session->userdata("user")) {
		redirect("success", "refresh");
		return;
	}
	$this->view("auth/login");
}
``` 

As said previously, "*$this->session->userdata*" stores the user that is currently logged or null if there isn't any. Therefore, if there's a user logged in, this expression will evaluates true.

The "*new_register*" method is very similar to login method:

``` PHP user.php
public function new_register() {
	$login = $this->input->post("login");
	$password = $this->input->post("password");
	$password = $this->input->post("name");
	$this->usermodel->register($name, $login, $password);
	redirect("index", "refresh");
}
``` 

And now, for last, the logout method:

``` PHP user.php
public function logout() {
	$this->session->unset_userdata('user');
	session_destroy();
	redirect('index', 'refresh');
}
```

It basically destroys the session and redirects to the initial page.

And it's **done**! Our complete controller is this way:

``` PHP user.php
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct() {
        parent::__construct();
        $this->load->helper(array('url', 'form'));
        $this->load->model("usermodel");
        $this->load->library('session');
    }
    
	private function view($page, $data=false) {
		$this->load->view("auth/header.php");
		$this->load->view($page, $data);
		$this->load->view("auth/footer.php");
	}
	
	public function index() {
		if ($this->session->userdata("user")) {
			redirect("success", "refresh");
			return;
		}
		$this->view("auth/login");
	}
	
	public function register() {
		$this->view("auth/register");
	}

	public function fail() {
		$this->view("auth/fail");
	}

	public function success() {
		$data["user"] = $this->session->userdata("user");
		$this->view("auth/success", $data);
	}
	
	public function login() {
		$login = $this->input->post("login");
		$password = $this->input->post("password");
		if ($this->usermodel->login($login, $password)) {
			$this->session->set_userdata("user", $login);
			redirect("success", "refresh");
		} else {
			redirect("fail", "refresh");
		}
	}
	
	public function new_register() {
		$login = $this->input->post("login");
		$password = $this->input->post("password");
		$name = $this->input->post("name");
		$this->usermodel->register($name, $login, $password);
		redirect("index", "refresh");
	}
	
	 public function logout() {
    	$this->session->unset_userdata('user');
    	session_destroy();
    	redirect('index', 'refresh');
    }
    
}
``` 

**Wehoo!!** 
