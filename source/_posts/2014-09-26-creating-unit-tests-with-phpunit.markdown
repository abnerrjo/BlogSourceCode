---
layout: post
title: "Creating unit tests with PHPUnit"
date: 2014-09-26 19:04:37 -0300
comments: true
categories: [PHP, Tutorials]
---
Hi there, people and aliens (I'm hoping that this post was preserved as humanity's historic treasure and it's being read by extraterrestrials civilizations right now. Joking, obviously :P).

In today's post we'll learn about something that everybody likes, it's just like cakes (whoever doesn't like cakes?! I dare you!). I'm talking about TESTS, obviously! Wehooo! It chills me just by talking about.

Our focus, however, will be tests in PHP using a tool called PHPUnit. Don't worry, it's like taking candy from a baby. Follow me!

<!-- more -->

## Installing the environment

Install is easy...

I'm assuming here that you already have PHP installed, along with a HTTP server and all those stuff.

In order to install PHPUnit, we'll use the awesome **Composer**, a dependency manager very popular in PHPUnit community.

Download the composer through [this link](https://getcomposer.org/download/) (scroll down, on Manual Download section), and place it inside your project's folder.

Now create a file inside your project's folder called **composer.json**, and write in it the following commands:

``` Javascript
{
    "require-dev": {
		"phpunit/phpunit": "4.2.*",
		"phpunit/php-invoker": "*"
    }
}

```

In order to install the dependencies (in this case, PHPUnit), the Composer receives a file in JSON format, where you just need to put the name of your dependencies and their version as a node of "*require-dev*" and it will magically install it for you. :) Fantastic, isn't it? 

Now open the terminal, go to your project's folder, and type the following command:

``` Bash
php composer.phar install
```

Done! The composer will now install it for you.

To run the downloaded tool, you just need to type it in the terminal:

``` Bash
php ./vendor/bin/phpunit <Unit_Test_File>
```

But, of course, we don't have any unit test file yet! Let's fix it on next section.

## Creating unit tests

Now here is the interesting part. Creating unit tests is an easy task with PHPHUnit. Whoever used some unit test tool will feel at ease. 

> Hey! I don't have anything to test!

Slow down, young man. I already took it for you. For didatic reasons, we are going to test some simple class that representates a number in scientific notation.

{% include_code ScientificNotation.php %}

As you can see, this is indeed a very simple class. I assume here it was long ago since you've been on high-school, so I'll refresh your memory about some simple operations that can be done with scientific notation... ([Click here](#tests) if you wish to cut the explanation off).

First, every number in scientific notation is composed by two parts: The mantissa (the "literal" part of the number) and the exponent. For example, in the number:
	
2,5 x 10^8

Mantissa is 2,5 and exponent is 8.

Second, in order to multiply two numbers in scientific notation, we multiply the mantissas and sum the exponents. For example:

(2,5 x 10^8) x (2,0 x 10^2) = (5,0 x 10^10)

And the division follows the same principle, we divide the mantissas and subtract the exponents.

The addition and subtraction is a bit troublesome, because it's just allowed between numbers that have the same exponent. In this case, we simply add or subtract the mantissas and keep the exponents.

The normalization of a number into scientific notation format is basically turning the mantissa in a single digit number. Doing this, we increment or decrement its exponent.

<div id="tests"></div>
**Done**! Now get to work!

Create a file called **ScientificNotationTest.php**. This file will have the following template:

``` PHP 
<?php
class ScientificNotationTest extends PHPUnit_Framework_TestCase {
	
}
?>
```
This is the default template of an unit test in PHPUnit. Notice it must inherit from **PHPUnit_Framework_TestCase** class.

Also, it's important to import the class or file that is being tested. Usually it's done inside the **setUp** method, a special method that is called every time a test is about to be runned. Therefore, our classe will now include this method:

``` PHP 
<?php
class ScientificNotationTest extends PHPUnit_Framework_TestCase {

	public function setUp() {
		require_once 'ScientificNotation.php';
	}

}
?>
```

OK! Now we finally are ready to create the tests. The testing methods must *always* contain the prefix **test**, i.e., testXXX, testXYZ, ... you got the idea.

The first test we are going to create is for the multiply operation. For this test, we just need two instances of ScientificNotation and call *multiply* over them.

``` PHP 
public function testMultiply() {
	$number1 = new ScientificNotation(2.0, 3);
	$number2 = new ScientificNotation(4.0, 2);
	$number1->multiply($number2);
}
```

Now we need some asserts to ensure our method is doing what it's supposed to do. The asserts I use most are: *testEquals* (test if two objects are equal), *assertTrue* (test if a boolean expression evaluates true) and *assertFalse*. You can see the complest list [here](https://phpunit.de/manual/current/en/appendixes.assertions.html). 

If an assert evaluate false, for example, when I use assertEquals for two objects that are not really equal, then the program will print an error on PHPUnit console denoted by the letter "F". Else, it will show the character ".", indicating that the test is OK!

I will use assertEquals to compare the expected result with the returned result:

``` PHP 
public function testMultiply() {
	$number1 = new ScientificNotation(2.0, 3);
	$number2 = new ScientificNotation(4.0, 2);
	$number1->multiply($number2);
	$this->assertEquals(8.0, $number1->getMantissa());
	$this->assertEquals(5, $number1->getExponent());
}
```

Quite easy, isn't it? :)

Let's skip the divide method, since it follows the same logic of the multiply. The next method to be tested is the **add**.

The add method must throw an exception case the parameter have a different exponent from the number I'm adding. How to test it?

Simple! Surround the call inside a try/catch block, and make the test fail case the code *pass* through the point where it should throw an exception. Example:

``` PHP
try {
	//should throw exception here
	$this->fail();
} catch(Exception $e) { } 
```

If it really throw an exception, then the $this->fail statement will never be called!


``` PHP 
public function testAdd() {
	//must be ok
	$number1 = new ScientificNotation(2.0, 5);
	$number2 = new ScientificNotation(4.0, 5);
	$number1->add($number2);
	$this->assertEquals(6.0, $number1->getMantissa());
	$this->assertEquals(5, $number1->getExponent());
	//must throw exception
	$number1 = new ScientificNotation(3.0, 4);
	$number2 = new ScientificNotation(2.0, 3);
	try {
		$number1->add($number2);
		$this->fail();
	} catch(Exception $e) { } 
}
```

In the end, here is our complete test unit class:

{% include_code ScientificNotationTest.php %}

To run the test, type in the terminal:

``` Bash
php ./vendor/bin/phpunit ScientificNotationTest.php
```

## Creating a test suite

The example above serves us well if we intent to run a single test, but what if we need to run several tests? Then testing file-by-file would be extremely boring.

Gladly, there's a thing called test suite, that allows us to inform a file containing the names of all the tests we want to run and it will run all them for us automatically. How can it be done?

Easy! On your project's folder, create a file called **phpunit.xml**. This file must contain the following structure:

``` XML
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit>
    <testsuites>
		<testsuite name="">
		</testsuite>
  </testsuites>
</phpunit>
```

For each test suite, we just need to add a new node of the type "*testsuite*" to the parent node "*testsuites*". It's important to name your test suites in order to be able to distinguish them. 
 
To add a new unit test file to a test suite, we just need to add a new node of the type "*file*" to the parent node "*testsuite*". Example:

``` XML
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit>
	<testsuites>
		<testsuite name="suite1">
			<file>ScientificNotationTest.php</file>
		</testsuite>
	</testsuites>
</phpunit>
```

Now to run the test suite, type in the terminal:

``` Bash
php ./vendor/bin/phpunit --testsuite <Name_of_the_Test_Suite>
```

## Analyzing the test coverage

An interesting thing I'd like to talk about is test coverage. It is a quite important information, since the greater the coverage, the bigger the confidence you have in your code correctness.

To run the test coverage tool, it's necessary to install **xDebug**. If you use Windows, you can install it through [this link](http://www.xdebug.org/download.php). But if you use Ubuntu, there's an even easier way:

``` Bash
sudo apt-get install php5-xdebug
```

Now that you've got the xDebug, to run the analysis you just need to type in the terminal:

``` Bash
php ./vendor/bin/phpunit --coverage-<Output_Format> <Output_File>
``` 

The *`<Output_Format>`* representantes the format of the analysis result. It can be of different types: HTML, XML, PHP... 

The *`<Output_File>`* is... the output file! Pretty obvious. :)

Example:

``` Bash
php ./vendor/bin/phpunit --coverage-html result
``` 

It will generate a HTML page called result containing the results of the analysis. When I open it, it show me the following informations:

![]({{ root_url }}/images/posts/phpunit-coverage.png)

:)

That's it guys! I really hopes you've liked. Unit tests are not so boring, are they? Sometimes it can be pretty fun, I dare to admit. hehe :)
