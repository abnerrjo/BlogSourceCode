---
layout: post
title: "Creating your own blog on Github"
date: 2014-09-16 23:32:43 -0300
comments: true
categories: [Tutorials]
---
Hello world! Be welcomed to my newest blog (unhappily, my previous went to space...). Here you can find tutorials and tips about programming in general, and as it should be, my first post will be just about how to create your own blog on Github!

### Why create a Github blog?
Github is awesome. It allows you to host your static pages for free, and using few tools, we can create a more professional and powerful blog than on the Blogger platform, for example, with a plus it's just ideal to share code. 

### I'm interested! Where do I start?
Well, deploying this blog was a bit troublesome for me at first, but I've just discovered some simpler ways that I'll tell you right now.

<!-- more -->

**Prerequisites**

- Linux (Yea. Unhappily, there isn't a simple way to do that on Windows...); 
- Git installed (Kinda obvious).

The very first thing you need to do is create a Github repository. However, it must have the following name:

```
<Your_Github_Nickname>.github.io
```

Through the **Github pages** mechanism, Github allows you to host your static pages for free, as said previously. The thing is that it only allows one domain for each user, and this domain must have the same nickname of the user, with addition of "*github.io*" prefix. 

Created the repository, we now need a tool that helps us to create our blog. Basically, a CMS (Content Management System). We're going to use **Jekyll** for this task. 

You can install Jekyll and all its dependencies through a single line of code:

``` Bash
gem install github-pages
``` 

Beyong Jekyll, the command will also try to install Ruby, since it's the language that Jekyll is built.

Even so, Jekyll is still too "low-level", and it can be tedious to build all your blog template manually. Because of it, we are going to use another tool called **Octopress**.

Octopress exists to ease some functionalities. Through its rakes we can create posts, change themes, everything by command line.

Configuring Octopress is pretty easy. First you need to clone its repository:

``` Bash
git clone git://github.com/imathis/octopress.git octopress
cd octopress
```

Now you need to install its dependencies:

``` Bash
bundle install
```

And finally configure it in a way it can deploy automatically to your Github repository:

``` Bash
rake setup_github_pages
```

Done! Now you can start blogging! :D

To create your first post, type the following command on terminal:

``` Bash
rake new_post["Title"] 
```

And so it will generate a file on markdown format inside source/_posts folder. Markdown is a markup language that intends to be a cleaner and easier version of HTML. You can get more info about it [here](http://en.wikipedia.org/wiki/Markdown). It's simple, you can fully learn it in few minutes!

**Type #1:**
You can define a *preview* of yor post (the infamous "*read more*"). Just add the line:

``` HTML
<!-- more -->
```

wherever you want the post preview ends.

**Type #2:**
Octopress provides a code highlighting API (otherwise it wouldn't any good for a programmer :P). Currently it can support more than 100 programming languages. To use it, just follow the syntax:

```
` ` ` [Language]
    code here
` ` `
```

**PS:** Remove white spaces between the apostrophes.

Example:

```
` ` ` Java
public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}
` ` `
```

It will generate the following text:

``` Java
public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}
```

So pretty :-)

There are other cool features, like getting your code from a file. To learn more about it, I invite you to access [this link](http://octopress.org/docs/blogging/code/), it's really interesting!

### Viewing our blog
You can view your blog without deploying it. Just type the following command:

``` Bash
rake preview
```

And so it will be available on address [http://localhost:4000](http://localhost:4000).

You don't need to type it again if you modify anything. It will regenerate automatically.

### Deploying our blog
Now the more important thing is to deploy the thing! For this task, just type the following commands:

``` Bash
rake generate
rake deploy
```

At first it will ask things like your Github repository link, your account name, etc., ... But after that it will just commit everything automatically.

### Applying themes
For last, although Octopress comes with a beautiful theme, it's possible to install third-parties themes, and it's quite easy!

[This site](https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes) contains a lot of themes for Octopress. To install them, first you need to clone the theme repository into the .theme folder inside your blog. Example:

```
git clone XXX .theme/XXX
```

After that, just type:

``` Bash
rake install['XXX']
rake generate
```

Where "XXX" is the theme name inside your .theme folder.

After that it will ask if you really wish to override the files, and for that you answer yes (y). And now you can see your new theme! :D

It was pretty simple, wasn't it?!
I really hope you've liked this tutorial. Here are some interesting links to get depth on this topic:

+ [http://jekyllrb.com/docs/home/](http://jekyllrb.com/docs/home/)
+ [http://octopress.org/docs/](http://octopress.org/docs/)
+ [https://pages.github.com/](https://pages.github.com/)

Good luck with your new blog! Any question, don't hesitate to use the comments section right below.
