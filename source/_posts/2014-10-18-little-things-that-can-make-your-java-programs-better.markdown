---
layout: post
title: "Little things that can make your Java programs better"
date: 2014-10-18 11:17:45 -0300
comments: true
categories: [Java, Tutorials]
---
On the past months I've been reading this incredible book called [Refactoring: Improving the design of existing code](http://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672), by Martin Fowler. 

This one is classic on Software Engineering, and somewhat changed the way I think about software design in general.

In the book there are dozens or hundreds of examples and tips. I gathered **five** that I consider easier and simpler to be applied but still have some impact on final product. Those tips, though inspired in the book, are also product of my own experience.

I picked Java cause that's my more familiar language and it's also the book language choice. 

<!-- more -->

## 1. Do not create a "set" method for an attribute that can't change 
This tip seems a bit foolish, and it really is, but you won't believe the amount of times this mistake is done over and over again.  

But, wait! Does an attribute that can't change really make sense? It does! It's too common nowadays to use some form of ORM (Object Relation Mapping), where some attribute will become the primary key. Allowing the programmer to change the attribute that representates the primary key may lead to some form of inconsistency in some extreme cases. 

If you aren't still convinced, just remember: Why wasting time doing something unnecessary? Less lines = better!

## 2. Do not allow classes modify other classes collections 
This tip seems bit "fishy" at first. Actually, classes can indeed modify other classes collections, the problem here is the way it's done. Let me show you by example:

``` Java System.java
public class System {

	private Set<User> users;
	
	public void setUsers(Set<User> users) {
		this.users = users;
	}
	
	public Set<Usuario> getUsers() {
		return this.users;
	}
	
	...
	
}
```
``` Java PrivacyInvader.java
public class PrivacyInvader {

	private System system;
	
	public boolean addUser(String login, String password) {
		return system.getUsers().add(new User(login, password));
	}
	
	public boolean removeUser(User user) {
		return system.getUsers().remove(user);
	}
	
	...
	
}
``` 

What's the problem of this design?

The problem is that the "PrivacyInvader" class is adding and removing elements of "users" collection from System in a direct way. Let's suppose you are using this collection to persist into your database from times to times. Now imagine that any class can insert any user, not respecting any constraint you put in this process, as, for example, a repeated user login. What will happen? Yea, you guessed right...

Another problem, this way a bit more subtile, is that "User" is being created in an inappropriated place. If we allow such things to happen, the User construtor will be called all over the code. What if now you want to change its signature? That's a classic problem of coupling. PrivacyInvader is knowing too much about User, where the only one who should know that much is that one that will really use it, in this case, "System". 

Now how do we fix all that? Let's start fixing the second problem listed. 

``` Java System.java
public class System {

	private Set<User> users;
	
	public void setUsers(Set<Usuario> users) {
		this.users = users;
	}
	
	public Set<Usuario> getUsers() {
		return this.users;
	}
	
	public boolean addUser(String login, String password) {
		return this.users.add(new User(login, password));
	}
	
	public boolean removeUser(User user) {
		return this.users.remove(user);
	}
	
	...
	
}
```
``` Java PrivacyInvader.java
public class PrivacyInvader {

	private System system;
	
	public boolean addUser(String login, String password) {
		return system.addUser(login, password);
	}
	
	public boolean removeUser(User user) {
		return system.remove(user);
	}
	
	...
	
}
``` 

Much better now! Now User class coupling was reduced to System class. So what do we do now to avoid direct access to our collection? One way would be to remove the "get" method, but this is a sub-optimal solution, since sometimes we do really need to access the collection. 

Happily, Java provides us an elegant solution to solve this problem: Collections.unmodifiable!
 
Collections.unmodifiable is a set of methods which receive a collection and return this collection modified in such way that it doesn't allow any insert or delete method, only search methods as "get"! Awesome, isn't it? :P 

Here is some supported methods:

- Collections.unmodifiableList(originalList);
- Collections.unmodifiableSet(originalSet);
- Collections.unmodifiableMap(originalMap);
- Collections.unmodifiableCollection(originalCollection);

And that's our solution using this little trick:

``` Java Sistema.java
import java.util.Collections;

public class System {

  private Set<User> users;
  
  public Set<User> getUsers() {
      return Collections.unmodifiableSet(this.users);
  }
  
  public boolean addUser(String login, String password) {
      return this.users.add(new User(login, password));
  }
  
  public boolean removeUser(User user) {
      return this.users.remove(user);
  }
  
  ...
  
}
```

Also notice we removed the "set" method for the collection. The reason was explained in topic #1 :P

## 3. Let a method be public only if really necessary
Some OOPs gurus say that the worth of a class is its interface. And I can't agree more. Simpler interfaces are easier to use, you don't need to search the method that does "this" or "that" because they are fewer. 

Of course, I'm not saying: Create as less methods as possible. What I'm saying is: Create as much methods as possible (indeed, it's even encouraged, since more methods lead to smaller methods and smaller methods are easier to understand), but let all the auxiliar methods **private**. 

## 4. Know when to use Enum and when to use Inheritance 
That's a trick one, isn't it? Enum is a big ally. It saves times. But enums are almost always followed by switch statements. And switch statements are evil. Why? Because they are not flexible enough to change. If you want to add a new enum value, for example, you must have to change ALL the switch statements that use that enum. And it's **bad**! Changes like that almost always lead to bugs. Here is an example:

``` Java Role.java
public enum Role {

	TRAINEE, JUNIOR, EXPERT, SENIOR
	
}
```
``` Java Developer.java 
public class Developer {
	
	private Role role; 
	
	public double getSalary() {
		switch(this.role) {
			case TRAINEE:
				return 500;
			case JUNIOR:
				return 1000;
			case EXPERT:
				return 2000;
			case SENIOR:
				return 4000;
			default:
				throw new RoleException("Invalid role.");
		}
	}
	
	public boolean promote() {
		switch(this.role) {
			case TRAINEE:
				this.role = Role.JUNIOR;
				break;
			case JUNIOR:
				this.role = Role.EXPERT;
				break;
			case EXPERT:
				this.role = Role.SENIOR;
				break;
			default:
				return false;
		}
		return true;
	}
	
	... 
	 
} 
```

This could be done is a similar way using Inheritance and polymorphism:

``` Java Role.java
public interface Role {

	public double getSalary();
	public boolean promote(Developer context);
	
}
``` 
``` Java Trainee.java
public class Trainee implements Role {
	
	@Override
	public double getSalary() {
		return 500;
	}
	
	@Override
	public boolean promote(Developer context) {
		context.setRole(new Junior());
		return true;
	}
	
}
``` 
``` Java Junior.java
public class Junior implements Role {
	
	@Override
	public double getSalary() {
		return 1000;
	}
	
	@Override
	public boolean promote(Developer context) {
		context.setRole(new Expert());
		return true;
	}
	
}
``` 
``` Java Expert.java
public class Expert implements Role {
	
	@Override
	public double getSalary() {
		return 2000;
	}
	
	@Override
	public boolean promote(Developer context) {
		context.setRole(new Senior());
		return true;
	}
	
}
``` 
``` Java Senior.java
public class Senior implements Role {
	
	@Override
	public double getSalary() {
		return 4000;
	}
	
	@Override
	public boolean promote(Developer context) {
		return false;
	}
	
}
``` 
``` Java Developer.java
public class Developer {

	private Role role;
	
	protected void setRole(Role role) {
		this.role = role;
	}
	
	public double getSalary() {
		return this.role.getSalary();
	}
	
	public boolean promote() {
		return this.role.promote(this);
	}
	
}
```

This is very similar to *State* pattern from the Gange Of Four. 

But anyway, what's the advantages of one over another? 

The advantage of the second solution in comparison to the first is that, if we want to add a new role in the hierarchy, we don't need to modify any line of code other than the new class itself.

But, hey! I'm not saying to throw the Enum in the gargabe and never use it again. Far from it. What I'm trying to say is that there are situations where the enum is not really appropriate. A role of thumb is: Never use enum to representate a hierarchy that can change. Use inheritance instead!

## 5. Use affirmatives instead of negatives sentences in conditionals
This tip is really simple. It won't affect your code quality directly, but it may make your code more readable, and that's so important that I can't emphasize it enough! 

But why are affirmatives sentences more readable than negatives? Well, just try to read the following sentences:

> I do not want to not to go to Shopping

And then compare to this:

> I want to go to Shopping

Because in the core they mean the same things, with the difference the second contains redundant informations. Most of negatives sentences contain some kind of redundant information. 

## Final thoughts
Some tips were quite obvious and intuitives, and some weren't. Well, but so is life... I don't expect you to agree with all I said here, neither you should! It's through discussion we can grow up, so, if you have a different opinion from mine, don't hesitate to comment! See ya!
