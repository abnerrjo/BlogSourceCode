---
layout: post
title: "Building a RESTful web service in C++"
date: 2015-10-13 08:38:35 -0300
comments: true
categories: Tutorials, C++, Web, Service, REST
---
If you ever thought about building a multi-platform system, you should know that a [Web Service](https://en.wikipedia.org/wiki/Web_service) will be an essential part of your system. Instead of duplicating common operations among the devices, like registering an user or retrieving a list of items sorted by price, for example, it's better to move all those operations to a common Web Service and establish the communication through [HTTP requests](https://en.wikipedia.org/wiki/HTTP). 

<!-- more --> 
 
Recently, a class of web services has become pretty popular: [The REST web service](https://en.wikipedia.org/wiki/Representational_state_transfer). REST stands for **Re**presentational **S**tate **T**transfer. It's an architectural pattern where the requisitions are totally independent and don't keep any state on server. (It's different from a web service that keeps a "session" for the user, for example). Another remarking aspect of the REST is the use of common HTTP methods to implement "CRUD-like" systems.

-> ![](https://www.chemaxon.com/app/themes/chemaxon/images/product_pages/jws/rest.jpg) <-

Web services can be implemented in almost any programming language you wish, though somes are more adequated to this task than others, like PHP or Javascript. When we are talking about programming languages which process HTTP requests, it's common the use of the term "[CGI](http://www.w3.org/CGI/)", which stands for **C**ommon **G**ateway **I**nterface. So here comes the C++ language: Can it be used as a CGI language? The answer is **yes**, THOUGH not recommended, and the reason is simple: Taks which could be easily implemented in languages like PHP would be a hell to be done in C++. But sometimes we have no choice. If that's your case, let's continue. 

First, I'll assume that you are using a Unix-Variant SO with [Apache2](http://www.apache.org/) installed. For this tutorial, we are going to use the [FastCGI++](http://www.nongnu.org/fastcgipp/).

The very first step is to install mods on Apache2 to enable support for FastCGI. The mods are: ```mod_fastcgi``` and ```mod_fcgid``` (Download link: [here](http://www.fastcgi.com/mod_fastcgi/docs/mod_fastcgi.html) and [here](http://httpd.apache.org/mod_fcgid/)). On Ubuntu, you can simply call:

```

sudo apt-get install libapache2-mod-fastcgi libapache2-mod-fcgid

```

Once installed, restart the Apache2 service by calling ```sudo service apache2 restart```. 

Now it's necessary to download and install Boost. You can do it [here](http://www.boost.org/). Download it from the official website, unpack it and call the following commands on terminal:

```
./boostrap
sudo ./b2 install
```

And finally, download FastCGI++ through the following link: http://www.nongnu.org/fastcgipp/

The procedure to install it is the default one:

```

./configure
make
sudo make install

```

In order to check if everything is working, let's compile a simple program. Create a new .cpp file named hello_world.cpp and copy/past the following content:

<center><input id="spoiler" type="button" value="See source code" onclick="toggle_visibility('code');"></center>
<div id="code">
``` C++ hello_world.cpp
#include <boost/date_time/posix_time/posix_time.hpp>
#include <fstream>
#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>
void error_log(const char* msg)
{
   using namespace std;
   using namespace boost;
   static ofstream error;
   if(!error.is_open())
   {
      error.open("/tmp/errlog", ios_base::out | ios_base::app);
      error.imbue(locale(error.getloc(), new posix_time::time_facet()));
   }
   error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}
class HelloWorld: public Fastcgipp::Request<wchar_t>
{
   bool response()
   {
      wchar_t russian[]={ 0x041f, 0x0440, 0x0438, 0x0432, 0x0435, 0x0442, 0x0020, 0x043c, 0x0438, 0x0440, 0x0000 };
      wchar_t chinese[]={ 0x4e16, 0x754c, 0x60a8, 0x597d, 0x0000 };
      wchar_t greek[]={ 0x0393, 0x03b5, 0x03b9, 0x03b1, 0x0020, 0x03c3, 0x03b1, 0x03c2, 0x0020, 0x03ba, 0x03cc, 0x03c3, 0x03bc, 0x03bf, 0x0000 };
      wchar_t japanese[]={ 0x4eca, 0x65e5, 0x306f, 0x4e16, 0x754c, 0x0000 };
      wchar_t runic[]={ 0x16ba, 0x16d6, 0x16da, 0x16df, 0x0020, 0x16b9, 0x16df, 0x16c9, 0x16da, 0x16de, 0x0000 };
      out << "Content-Type: text/html; charset=utf-8\r\n\r\n";
      out << "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8' />";
      out << "<title>fastcgi++: Hello World in UTF-8</title></head><body>";
      out << "English: Hello World<br />";
      out << "Russian: " << russian << "<br />";
      out << "Greek: " << greek << "<br />";
      out << "Chinese: " << chinese << "<br />";
      out << "Japanese: " << japanese << "<br />";
      out << "Runic English?: " << runic << "<br />";
      out << "</body></html>";
      err << "Hello apache error log";
      return true;
   }
};
int main()
{
   try
   {
      Fastcgipp::Manager<HelloWorld> fcgi;
      fcgi.handler();
   }
   catch(std::exception& e)
   {
      error_log(e.what());
   }
}
```
</div>
</input>

Now compile by calling:

``` Bash 

g++ hello_world.cpp -lfastcgipp -lboost_date_time -lboost_system -lboost_thread -o hello_world.fcgi

```

After compiled, try to execute it. If an error similar to this appear:

```

hello_world.fcgi: error while loading shared libraries: libfastcgipp.so.2: cannot open shared object file: No such file or directory

```

You may need to copy the libraries inside /usr/local/lib to /usr/lib. Copy and past the following commands on terminal:

```

cd /usr/lib
ln -s /usr/local/lib/libboost_* . 
ln -s /usr/local/lib/libfast* .

```

It may solve your problem. 

Now create a folder on /var/www/html called "hello_world" and move the executable to there. Now if you try to access the following URL: http://localhost/hello_world/hello_world.fcgi, an error like the following is likely to happen:

```

You don't have permission to access /hello_world/hello_world.fcgi on this server.

```

In this case, go to ```/etc/apache2/``` and edit the file ```apache2.conf```, by substituing:

``` XML

<Directory />
        Options FollowSymLinks
        AllowOverride None
        Require all granted
</Directory>

...

<Directory /var/www/>
        Options Indexes FollowSymLinks 
        AllowOverride None
        Require all granted
</Directory>

```

to

``` XML

<Directory />
        Options  Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Allow from all
</Directory>

...

<Directory /var/www/>
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Allow from all 
</Directory>

```

Now restart the Apache2 service by calling ```sudo service apache2 restart``` and try to access the link again: http://localhost/hello_world/hello_world.fcgi. 

A message like that must be displayed:

```

English: Hello World
Russian: Привет мир
Greek: Γεια σας κόσμο
Chinese: 世界您好
Japanese: 今日は世界
Runic English?: ᚺᛖᛚᛟ ᚹᛟᛉᛚᛞ

```

Got the message? Excellent! Now we can continue (otherwise either check the previous steps to verify if you didn't mistake anything or reply with a comment to this tutorial). 

## Our dummy system (the comics shop)

We are going to design a dummy system in order to implementate our RESTful web service in C++. This system is very simple: An owner of a comics shop asked us to implementate a system for him. Our system will have only one entity/resource: The comic itself. A comic has:

- A name;
- A publisher;
- A release date;
- An edition number.

We are going to use MySQL to persist those data. You can dowload MySQL [here](https://www.MySQL.com/) (or alternativelly you can use ```sudo apt-get install MySQL-server``` on Ubuntu).

Let's initialize MySQL by calling on terminal:

```

mysql -u USERNAME -p

```

Once logged in, create a new database named "comics_shop" by calling:

``` SQL 
CREATE DATABASE comics_shop;
```

Now select the recently created database:

``` SQL
USE comics_shop;
```

And finally let's create a table for "comic":

``` SQL
CREATE TABLE comic(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(30) NOT NULL, 
	publisher VARCHAR(30) NOT NULL, 
	date TIMESTAMP, 
	edition INT
);
```
Aaaaaand the database part is done for now! Now, in order to establish the communication among our C++ programs and our MySQL database, we need to install the [MySQL C++ connector](https://dev.mysql.com/doc/connector-cpp/en/index.html). You can download it [here](https://dev.mysql.com/downloads/connector/cpp/1.1.html). Once downloaded, unpack it and move the content of "lib" folder to your /usr/lib folder, while moving the content of "include" to /usr/local/include/mysqlcppconn folder.

Now go to /var/www/html and create a new folder called "comics". The first method we are going to implementate is the CREATE/POST. For that reason, inside the recently created folder, create a new folder named "comic" and inside of it create a new .cpp file named "post.cpp". Let's start by creating the skeleton of our application:

``` C++ post.cpp
#include <fstream>

#include <boost/date_time/posix_time/posix_time.hpp>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

void error_log(const char* msg)
{
	using namespace std;
	using namespace boost;
	static ofstream error;
	if(!error.is_open())
	{
		error.open("/tmp/errlog", ios_base::out | ios_base::app);
		error.imbue(locale(error.getloc(), new posix_time::time_facet()));
	}
	error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}

class PostComic : public Fastcgipp::Request<char>
{
	bool response()
	{
		// TODO
		return true;
	}
};

int main()
{
	try 
	{
		Fastcgipp::Manager<PostComic> fcgi;
		fcgi.handler();
	} 
	catch (std::exception& e)
	{
			error_log(e.what());	
	}
	return 0;
}
``` 
The method "error_log" is one created only for logging reasons. It creates a new file inside the /tmp/errlog folder containing the date and the error message. 

The very first thing we are going to implementate is the connection with our database. Since it's something which will be repeated for every HTTP method, let's create a separated file named "connector.hpp" with the same skeleton as shown above:

``` C++ connector.hpp
#include <fstream>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

class Connector : public Fastcgipp::Request<char>
{

};
```
We will then, on constructor, simply initialize a new connection with the database.
``` C++ connector.hpp
#include <fstream>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

class Connector : public Fastcgipp::Request<char>
{
public:
	Connector()
	{
		driver = get_driver_instance();
		con = driver->connect("tcp://127.0.0.1:3306", "USERNAME", "PASSWORD");
		con->setSchema("comics_shop");
	}
	virtual ~Connector()
	{
		delete con;
	}
protected:
	sql::Driver* driver;
	sql::Connection* con;
};
```
And after that, we'll modify our PostComic class to extend the Connector class.
``` C++ post.cpp
#include <fstream>

#include <boost/date_time/posix_time/posix_time.hpp>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

#include "connector.hpp"

void error_log(const char* msg)
{
	using namespace std;
	using namespace boost;
	static ofstream error;
	if(!error.is_open())
	{
		error.open("/tmp/errlog", ios_base::out | ios_base::app);
		error.imbue(locale(error.getloc(), new posix_time::time_facet()));
	}
	error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}

class PostComic : public Connector
{
	bool response()
	{
		// TODO
		return true;
	}
};

int main()
{
	try 
	{
		Fastcgipp::Manager<PostComic> fcgi;
		fcgi.handler();
	} 
	catch (std::exception& e)
	{
			error_log(e.what());	
	}
	return 0;
}
```
Now let's get the POST parameters. We expect the parameters be the same of the table attributes (except for ID). We can access the post parameters through the ```environment().posts``` list:

``` C++ post.cpp
bool response()
{
	out << "Content-Type: application/json; charset=ISO-8859-1\r\n\r\n";
	std::map<std::string, std::string> parameters;
	if (environment().posts.size())
	{
		for (Fastcgipp::Http::Environment<char>::Posts::const_iterator it = environment().posts.begin(); it != environment().posts.end(); ++it)
		{
			parameters[it->first] = it->second.value;
		}
	}
	return true;
}
```
In the above example, we are saving the parameters in a map. Now let's check if all parameters are OK:
``` C++ post.cpp
inline void sendError(const std::string& errorMsg)
{
	out << "{ \"success\" : 0, \"message\" : \"" + errorMsg + "\" }" << std::endl;
}
inline void sendSuccess()
{
	out << "{ \"success\" : 1 }" << std::endl;
}
bool response()
{
	out << "Content-Type: application/json; charset=ISO-8859-1\r\n\r\n";
	std::map<std::string, std::string> parameters;
	for (Fastcgipp::Http::Environment<char>::Posts::const_iterator it = environment().posts.begin(); it != environment().posts.end(); ++it)
	{
		parameters[it->first] = it->second.value;
	}
	if (parameters.find("name") == parameters.end())
	{
		sendError("Name is missing");
	}
	else if (parameters.find("publisher") == parameters.end())
	{
		sendError("Publisher is missing");
	}
	else if (parameters.find("date") == parameters.end())
	{
		sendError("Date is missing");
	}
	else if (parameters.find("edition") == parameters.end())
	{	
		sendError("Edition is missing");
	}
	else 
	{		
		// TODO
	}
	return true;
}
```
As you can notice, we are sending a JSON file indicating if the operation was successful or not. Using JSON or XML files as a protocol of communitation is another remarking aspect of REST architectures.

Now compile it using:

``` Bash
sudo g++ post.cpp -I/usr/local/include/mysqlcppconn/ -lfastcgipp -lboost_date_time -lboost_system -lboost_thread -lmysqlcppconn -o post.fcgi
```

The other methods follow a very similar logic. For example, here's the PUT (edit) method:

``` C++ put.cpp
#include <fstream>

#include <boost/date_time/posix_time/posix_time.hpp>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>
#include <fastcgi++/http.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

#include "connector.hpp"

void error_log(const char* msg)
{
	using namespace std;
	using namespace boost;
	static ofstream error;
	if(!error.is_open())
	{
		error.open("/tmp/errlog", ios_base::out | ios_base::app);
		error.imbue(locale(error.getloc(), new posix_time::time_facet()));
	}
	error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}

class PutComic : public Connector
{
	inline void sendError(const std::string& errorMsg)
	{
		out << "{ \"success\" : 0, \"message\" : \"" + errorMsg + "\" }" << std::endl;
	}
	inline void sendSuccess()
	{
		out << "{ \"success\" : 1 }" << std::endl;
	}
	bool response()
	{
		out << "Content-Type: application/json; charset=ISO-8859-1\r\n\r\n";
		std::map<std::string, std::string> parameters;
		for (Fastcgipp::Http::Environment<char>::Posts::const_iterator it = environment().posts.begin(); it != environment().posts.end(); ++it)
		{
			parameters[it->first] = it->second.value;
		}
		if (parameters.find("id") == parameters.end())
		{
			sendError("Missing id");
		}
		else
		{
			std::map<std::string, std::string> columns;
			if (parameters.find("name") != parameters.end())
			{
				columns["name"] = "\"" + parameters["name"] + "\"";
			}
			if (parameters.find("publisher") != parameters.end())
			{
				columns["publisher"] = "\"" + parameters["publisher"] + "\"";
			}
			if (parameters.find("date") != parameters.end())
			{
				columns["date"] = "FROM_UNIXTIME('" + parameters["date"] + "')";
			}
			if (parameters.find("edition") != parameters.end())
			{	
				columns["edition"] = parameters["edition"];
			}		
			if (columns.empty())
			{
				sendError("There is no column to be updated");
			}
			else
			{
				std::string query = "UPDATE comic SET ";
				for (std::map<std::string, std::string>::iterator it = columns.begin(); it != columns.end(); ++it)
				{
					if (it != columns.begin()) query += ", ";
					query += it->first + "=" + it->second;
				}
				query += " WHERE id=" + parameters["id"];
				sql::Statement* stmt = con->createStatement();
				try 
				{
					stmt->execute(query);
					sendSuccess();
				} catch (sql::SQLException& e)
				{
					sendError(e.what());
				}
				delete stmt;
			}
		}
		return true;
	}
};

int main()
{
	try 
	{
		Fastcgipp::Manager<PutComic> fcgi;
		fcgi.handler();
	} 
	catch (std::exception& e)
	{
			error_log(e.what());	
	}
	return 0;
}
```
We are simply getting a row by ID and then updating the columns from which values exist on the POST request (unhappily, FastCGI++ doesn't provide support for PUT requests, so we have to implement it as a POST request). 

The DELETE method is even simpler:
``` C++ delete.php
#include <fstream>

#include <boost/date_time/posix_time/posix_time.hpp>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>
#include <fastcgi++/http.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

#include "connector.hpp"

void error_log(const char* msg)
{
	using namespace std;
	using namespace boost;
	static ofstream error;
	if(!error.is_open())
	{
		error.open("/tmp/errlog", ios_base::out | ios_base::app);
		error.imbue(locale(error.getloc(), new posix_time::time_facet()));
	}
	error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}

class PutComic : public Connector
{
	inline void sendError(const std::string& errorMsg)
	{
		out << "{ \"success\" : 0, \"message\" : \"" + errorMsg + "\" }" << std::endl;
	}
	inline void sendSuccess()
	{
		out << "{ \"success\" : 1 }" << std::endl;
	}
	bool response()
	{
		out << "Content-Type: application/json; charset=ISO-8859-1\r\n\r\n";
		std::map<std::string, std::string> parameters;
		for (Fastcgipp::Http::Environment<char>::Posts::const_iterator it = environment().posts.begin(); it != environment().posts.end(); ++it)
		{
			parameters[it->first] = it->second.value;
		}
		if (parameters.find("id") == parameters.end())
		{
			sendError("Missing id");
		}
		else
		{
		
			sql::Statement* stmt = con->createStatement();
			try 
			{
				stmt->execute("DELETE FROM comic WHERE id = " + parameters["id"]);
				sendSuccess();
			} catch (sql::SQLException& e)
			{
				sendError(e.what());
			}
			delete stmt;
		}
		return true;
	}
};

int main()
{
	try 
	{
		Fastcgipp::Manager<PutComic> fcgi;
		fcgi.handler();
	} 
	catch (std::exception& e)
	{
			error_log(e.what());	
	}
	return 0;
}
```
Now the only method missing is the GET, to retrieve informations of a comic by ID. That's also very simple:
``` C++ get.cpp
#include <fstream>

#include <boost/date_time/posix_time/posix_time.hpp>

#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <fastcgi++/request.hpp>
#include <fastcgi++/manager.hpp>
#include <fastcgi++/http.hpp>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

#include "connector.hpp"

void error_log(const char* msg)
{
	using namespace std;
	using namespace boost;
	static ofstream error;
	if(!error.is_open())
	{
		error.open("/tmp/errlog", ios_base::out | ios_base::app);
		error.imbue(locale(error.getloc(), new posix_time::time_facet()));
	}
	error << '[' << posix_time::second_clock::local_time() << "] " << msg << endl;
}

class PutComic : public Connector
{
	inline void sendError(const std::string& errorMsg)
	{
		out << "{ \"success\" : 0, \"message\" : \"" + errorMsg + "\" }" << std::endl;
	}
	bool response()
	{
		out << "Content-Type: application/json; charset=ISO-8859-1\r\n\r\n";
		std::map<std::string, std::string> parameters;
		for (Fastcgipp::Http::Environment<char>::Gets::const_iterator it = environment().gets.begin(); it != environment().gets.end(); ++it)
		{
			parameters[it->first] = it->second;
		}
		if (parameters.find("id") == parameters.end())
		{
			sendError("Missing id");
		}
		else
		{
			sql::Statement* stmt = con->createStatement();
			try 
			{
				sql::ResultSet* res = stmt->executeQuery("SELECT name, publisher, UNIX_TIMESTAMP(date) as date, edition FROM comic WHERE id = " + parameters["id"]);
				if (!res->next())
				{
					sendError("Could not found comic with id = " + parameters["id"]);
				}
				else
				{
					std::string result = "{ \"success\" : 1, ";
					result += "\"name\": \"" + res->getString("name") + "\",";
					result += "\"publisher\": \"" + res->getString("publisher") + "\",";
					result += "\"date\": " + res->getString("date") + ",";
					result += "\"edition\": " + res->getString("edition");
					result += "}";
					delete res;
					out << result << std::endl;
				}
			} catch (sql::SQLException& e)
			{
				sendError(e.what());
			}
			delete stmt;
		}
		return true;
	}
};

int main()
{
	try 
	{
		Fastcgipp::Manager<PutComic> fcgi;
		fcgi.handler();
	} 
	catch (std::exception& e)
	{
			error_log(e.what());	
	}
	return 0;
}
```
Instead of ```environment().posts```, now we are using ```environment().gets```. Also, "get" parameters are a pair of string-string (instead of a POST, where the second value of the pair is an object), that's why we don't need to use ```it->second.value```. ```sql::ResultSet``` representates a set of retrieved rows. Since we are indexing by the primary key, it will just return either 0 or 1 rows (that's why we don't need to put it on a loop). If the method ```getNext()``` return false, it indicates which none row with given ID was found, otherwise, we build a JSON string with the columns values and then output it to the user.

## Rewriting URLs
So we finally finished our four methods (GET, POST, PUT and DELETE), but one of annoying thing is that you must put the ".fcgi" extension in order to access the page. A more elegant solution would be, instead of ```GET /comics/comic.fcgi?id=10```, the following: ```GET /comics/10```. It's shorter and now the user don't need to know we are using a FCGI script.  URL rewriting is completely possible on Apache Web Server. You just need to do the following:

``` Bash 
sudo a2enmod rewrite
sudo service apache2 restart
```

Now, on folder "comics" located on "/var/www/html", create a new ```.htaccess``` file, and inside of it write the following:

```

RewriteEngine on
RewriteRule comic/([0-9]+)$ comic/get.fcgi?id=$1

```

Now if you save it, you'll notice that calling the URL http://localhost/comics/comic/10 has the same effect as http://localhost/comics/comic/get.fcgi?id=10. The reason is simple: We created a mapping rule where, if you call ```comics/comic/<A number>```, it will internally call the right URL defined on RewriteRule. $1 is the Regex ID (1 = the first one), from which the value will be 'copied'. 
The other mapping rules are much more easier:

```

RewriteEngine on
RewriteRule comic/([0-9]+)$ comic/get.fcgi?id=$1
RewriteRule comic/put comic/put.fcgi
RewriteRule comic/delete comic/delete.fcgi
RewriteRule comic/post comic/post.fcgi

```

## Conclusion
On this tutorial, we learnt about i) Web services ii) RESTful web services iii) CGI scripts iv) An easy way to use C++ as a CGI language v) MySQL connection with C++ vi) A complete dummy system containing all four HTTP methods to manipulate a resource vii) Apache URL rewriting. That was a lot of things! :) I really hope you have enjoyed this tutorial. Until the next!
