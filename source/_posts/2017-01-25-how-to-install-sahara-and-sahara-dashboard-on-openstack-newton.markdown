---
layout: post
title: "How to install Sahara and Sahara Dashboard on OpenStack Newton (Ubuntu)"
date: 2017-01-25 06:30:52 -0300
comments: true
categories: [openstack, sahara, cloud, tutorials]
---
This week I was trying to install Sahara and tried to follow the link avaiable on [OpenStack page](http://docs.openstack.org/developer/sahara/userdoc/installation.guide.html), but that seemed kinda outdated, since I face several problems due to API compatibility. So I'll try to explain how to install it more thoroughly and explain some pitfalls that can happen.

<!-- more -->

First of all, Sahara has the following requirements:

- Keystone
- Nova
- Neutron
- Glance
- Heat
- Cinder
- Swift

I'll assume that you have all of them already installed and running properly!

## Installing Sahara

Let's install Sahara and its python binding to the OpenStack client (it enables you to use **openstack dataprocessing** ...):

``` bash
sudo apt-get install sahara python-saharaclient
```

At first it will prompt you to input some configurations. You don't need to mind them right now. Just leave them as default.

Now create a new service named `data-processing` so the dashboard can make requests to Sahara.

```
openstack service create --name sahara --description "Sahara Data Processing" data-processing
```

Create the endpoints in order to communicate with the Sahara API.

```
openstack endpoint create --region RegionOne data-processing public http://controller:8386/v1.1/%\(project_id\)s;
openstack endpoint create --region RegionOne data-processing internal http://controller:8386/v1.1/%\(project_id\)s;
openstack endpoint create --region RegionOne data-processing admin http://controller:8386/v1.1/%\(project_id\)s;
```

Replace `controller` by the IP address of your controller node.

Create a user named `sahara` and add it to the `service` project.

```
openstack user create --domain default --password SAHARA_PASS sahara;
openstack role add --project service --user sahara admin 
```

Replace `SAHARA_PASS` by a proper password. 

Now login to mysql and create a new database so the Sahara can use it.

```
mysql -u root -p 
```

``` sql
CREATE DATABASE sahara;
GRANT ALL ON sahara.* TO 'sahara'@'%' IDENTIFIED BY 'SAHARA_DBPASS'; 
```

Replace `SAHARA_DBPASS` by a proper password.

Now open the configuration file `/etc/sahara/sahara.conf` and edit:

- In the section `[DEFAULT]`, add:

``` apache
transport_url = rabbit://openstack:RABBIT_PASS@controller 
use_neutron = true 
use_floating_ips = false 
```

Replace `openstack` by the RabbitMQ username, `RABBIT_PASS` by the RabbitMQ password and `controller` by the IP address where RabbitMQ is being hosted.

- In `[DATABASE]`:

```
connection = mysql://sahara:SAHARA_DBPASS@controller/sahara 
```

Replace `SAHARA_DBPASS` by the password you set previously, and `controller` by the IP address of your controller node.

- In `[keystone_authtoken]`:

```
auth_uri = http://controller:5000/v3/
identity_uri = http://controller:35357/
memcached_servers = controller
admin_user = sahara
admin_password = SAHARA_PASS
admin_tenant_name = service
```

Replace `SAHARA_PASS` by the password you set previously, and `controller` by the IP address of your controller node.

Save and close the file.

Now in `/etc/mysql/my.cnf`, edit:

```
[mysqld]
max_allowed_packet = 256M
```

Restart MySQL.

```
sudo service mysql restart
```

Populate the database.

``` bash
sudo sahara-db-manage --config-file /etc/sahara/sahara.conf upgrade head
```

**Important step!** The new neutron version doesn't support floating ips. Hence, when Sahara go check the limits of floating ips of your network, it will prompt an Internal Error due to "Resource not found". Disable floating ips calls on Sahara API. 

Edit the file `/usr/lib/python2.7/dist-packages/sahara/service/quotas.py`.

Comment lines 152-153. Add a new line right below:

``` python
limits['floatingips'] = 0 
```

Comment lines 171-174. Add a new line right below:
``` 
limits['floatingips'] = 0 
```


Restart the Sahara services.

``` bash 
sudo service sahara-api restart;
sudo service sahara-engine restart
```

## Installing Sahara Dashboard

**Certify your Horizon is working properly!**

Install it through pip:

```
sudo pip install 'http://tarballs.openstack.org/sahara/sahara-stable-newton.tar.gz'
```

The Developer dashboard is disabled by the default on Horizon. You need to enable it before installing Sahara dashboard, orelse an error like this could happen:

``` bash
Dashboard with slug "developer" is not registered
```

(Took me hours to discover this. Damn!)

To do it, edit `/usr/share/openstack-dashboard/openstack_dashboard/settings.py`, and set:

``` python
DEBUG = true
```

Do the same to `/usr/share/openstack-dashboard/openstack_dashboard/local/local_settings.py`.

In `/etc/openstack-dashboard/local_settings.py`, add:

```
DEBUG = True
SAHARA_USE_NEUTRON = True 
```

Now install the dashboard.

``` bash
sudo cp /usr/local/lib/python2.7/dist-packages/sahara_dashboard/enabled/* /usr/share/openstack-dashboard/openstack_dashboard/local/enabled/
```

Compress the new assets.

```
sudo python /usr/share/openstack-dashboard/manage.py compress
```

Restart Apache.

```
sudo service apache2 restart
```

Check if a new dashboard appeared under the Project tab.

![](http://www.admin-magazine.com/var/ezflow_site/storage/images/archive/2015/30/openstack-sahara-brings-hadoop-as-a-service/figure-2/119327-1-eng-US/Figure-2_large.png)
