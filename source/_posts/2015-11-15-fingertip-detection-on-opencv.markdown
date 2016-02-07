---
layout: post
title: "Fingertip detection in OpenCV"
date: 2015-11-15 00:06:15 -0300
comments: true
categories: [tutorials,c++,computer vision,opencv]
---
Hi! In this tutorial, we will learn how to detect fingertips using OpenCV. You ready? :D

->![]({{ root_url}}/images/posts/fingertip1.png)<-

<!-- more -->

In computer vision, the task of recognizing an object in the scene is very common. Unhappily, there is no "silver bullet" which can solve this problem for all kinds of objects. Each case must be treated individually (luckily it's changing with the rising of convolutional neural networks). In this case, we are interested in discover the location of fingertips (if any is present) in the image.

Firstly, let me present you OpenCV, a open-source library for computer vision and digital image processing. It has many facilities which makes our daily life so much easier. :) (If you don't have OpenCV, I recommend following [this](http://docs.opencv.org/2.4/doc/tutorials/introduction/table_of_content_introduction/table_of_content_introduction.html#table-of-content-introduction) tutorial).

The first step before detecting the fingertips is to detect the hand, obviously. But how to do it? With color segmentation! You see, let's assume you're in front of a background with a much different color from your skin. Also, let's assume that your hand is the largest part of your body showing up. In this scenario, recognizing the hand would be easy, by simply selecting the pixels belonging to the color of your skin and then retrieving the largest area. That's precisely what we'll do! 

## Segmenting the hand skin
If you ever used any image manipulation software, you should know that there are several color spaces. The most common is the RGB, where any pixel is composed by the union of three colors (red, green, blue). However, for color segmenting, the HSV color space is much better, because in there the information of color is dissociated from the information of illumination. HSV stands for **H**ue (the color information), **S** (saturation, e.g., the percentage of 'color' present) and **V** (value/brightness, e.g., the percentage of 'white' color present). Generally, human skin lies between (H=0,S=58) and (H=50,S=173).

Let's start implementing our detector. The first thing we need is to read the image from the webcam. OpenCV contains a module (imgproc) responsible for capturing images and videos. 

``` C++ fingertip_detector.cpp
#include <iostream>

#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>

int main()
{
	cv::VideoCapture cap(0);
	const char* windowName = "Fingertip detection";
	while (1)
	{
		cv::Mat frame;
		cap >> frame;
		cv::imshow(windowName, frame);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```
The argument passed to the "VideoCapture" object indicates the index of camera that we want to access (in case you have more than one connected to your computer). In a loop, we are getting a frame from the camera (through the >> operator) each 30 milliseconds (the argument of "waitKey" function, which waits x milliseconds until a key has been pressed, and returns -1 if none was pressed). Finally, we show the captured frame on the screen (through the "imshow" function).

Now, let's convert our captured frame (which is in the BGR color space, e.g, inverted RGB) to HSV and then segment the color using the "inRange" operator:

``` c++ fingertip_detector.cpp
int main()
{
	cv::VideoCapture cap(0);
	const char* windowName = "Fingertip detection";
	int minH = 130, maxH = 160, minS = 10, maxS = 40, minV = 75, maxV = 130;
	while (1)
	{
		cv::Mat frame;
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		cv::imshow(windowName, hsv);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```

The "inRange" function receives the image that we want to threshold, the interval lower bound, the interval upper bound and the output image. The result is a black and white image, where pixels that have values inside the interval are colored with white, otherwise black.

->![]({{ root_url}}/images/posts/fingertip2.png)<-

As you can notice, this is a poor segmentation. We need to do a fine-tuning of HSV bounds in order to get a good segmentation. Since changing the value and recompiling the program is boring, it's better to use trackbars for this task:

``` C++ fingertip_detector.cpp
int main()
{
	cv::VideoCapture cap(0);
	const char* windowName = "Fingertip detection";
	int minH = 130, maxH = 160, minS = 10, maxS = 40, minV = 75, maxV = 130;
	cv::namedWindow(windowName);
	cv::createTrackbar("MinH", windowName, &minH, 180);
	cv::createTrackbar("MaxH", windowName, &maxH, 180);
	cv::createTrackbar("MinS", windowName, &minS, 255);
	cv::createTrackbar("MaxS", windowName, &maxS, 255);
	cv::createTrackbar("MinV", windowName, &minV, 255);
	cv::createTrackbar("MaxV", windowName, &maxV, 255);
	while (1)
	{
		cv::Mat frame;
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		cv::imshow(windowName, hsv);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```

->![]({{ root_url}}/images/posts/fingertip3.png)<-

Even after adjusting the interval there is too much noise. We need to apply special techniques like **median blur** to remove isolated dots and **dilate** to fill "holes":

``` C++ fingertip_detector.cpp
int main()
{
	...
	while (1)
	{
		cv::Mat frame;
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		int blurSize = 5;
		int elementSize = 5;
		cv::medianBlur(hsv, hsv, blurSize);
		cv::Mat element = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(2 * elementSize + 1, 2 * elementSize + 1), cv::Point(elementSize, elementSize));
		cv::dilate(hsv, hsv, element);
		cv::imshow(windowName, hsv);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```

->![]({{ root_url}}/images/posts/fingertip4.png)<-

Hmmm... Much better! :D But there is still some outliers... We can fix it by finding the contours of separated objects present in the thresholded image and then using only the object that has the contour with largest area. 

``` C++ fingertip_detector.cpp
int main()
{
	...
	while (1)
	{
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		// Pre processing
		int blurSize = 5;
		int elementSize = 5;
		cv::medianBlur(hsv, hsv, blurSize);
		cv::Mat element = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(2 * elementSize + 1, 2 * elementSize + 1), cv::Point(elementSize, elementSize));
		cv::dilate(hsv, hsv, element);
		// Contour detection
		std::vector<std::vector<cv::Point> > contours;
		std::vector<cv::Vec4i> hierarchy;
		cv::findContours(hsv, contours, hierarchy, CV_RETR_EXTERNAL, CV_CHAIN_APPROX_SIMPLE, cv::Point(0, 0));
		size_t largestContour = 0;
		for (size_t i = 1; i < contours.size(); i++)
		{
			if (cv::contourArea(contours[i]) > cv::contourArea(contours[largestContour]))
				largestContour = i;
		}
		cv::drawContours(frame, contours, largestContour, cv::Scalar(0, 0, 255), 1);
		cv::imshow(windowName, frame);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```

->![]({{ root_url}}/images/posts/fingertip5.png)<-

The "findContours" function expects to receive a vector of vector of points, or, in another words, a vector of polygons. There are many detection methods. Here I chose "CV_RETR_EXTERNAL", which means it will just return the most external contour, ignoring eventual contours that are inside the most external region. I then compare the areas of the returned polygons (through the "contourArea" function) to get the largest and then draw it on screen (through the "drawContours" function). We can see clearly that the result is the contour of my hand with a tiny red line. So we accomplished the task of segmenting our hand successfully. Let's move to the next step.

## Detecting fingertips
In order to detect fingertips, we are going to use the **Convex Hull** technique. In mathematics, Convex Hull is the smallest convex set that contains a set of points. And a convex set is a set of points such that, if we trace a straight line from any pair of points in the set, that line must be also be inside the region. The result is then a nice, smooth region, much easier to be analised than our contour, that contains many imperfections. Luckily, this algorithm is also implemented on OpenCV through the "convexHull" function.

``` C++ fingertip_detector.cpp
int main()
{
	...
	while (1)
	{
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		// Pre processing
		int blurSize = 5;
		int elementSize = 5;
		cv::medianBlur(hsv, hsv, blurSize);
		cv::Mat element = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(2 * elementSize + 1, 2 * elementSize + 1), cv::Point(elementSize, elementSize));
		cv::dilate(hsv, hsv, element);
		// Contour detection
		std::vector<std::vector<cv::Point> > contours;
		std::vector<cv::Vec4i> hierarchy;
		cv::findContours(hsv, contours, hierarchy, CV_RETR_EXTERNAL, CV_CHAIN_APPROX_SIMPLE, cv::Point(0, 0));
		size_t largestContour = 0;
		for (size_t i = 1; i < contours.size(); i++)
		{
			if (cv::contourArea(contours[i]) > cv::contourArea(contours[largestContour]))
				largestContour = i;
		}
		cv::drawContours(frame, contours, largestContour, cv::Scalar(0, 0, 255), 1);
		// Convex hull
		if (!contours.empty())
		{
			std::vector<std::vector<cv::Point> > hull(1);
			cv::convexHull(cv::Mat(contours[largestContour]), hull[0], false);
			cv::drawContours(frame, hull, 0, cv::Scalar(0, 255, 0), 3);
		}
		cv::imshow(windowName, frame);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```
->![]({{ root_url}}/images/posts/fingertip6.png)<-

We are just calculating the convex hull of our largest contour (in order to speed the process). The "convexHull" function expects to receive a set of polygons, just like the "findContours" function. Hence, drawing the region on screen follows the same logic. 

It's already pretty easy detecting the fingertips through the Convex Hull region. Their locations coincide with the "corners" of our Convex Hull polygon. But instead of doing it manually, we are going to detect it with the aid of "**convextDefects**" function. You see, there are "gaps" between the convex hull region and our contour region. The "convexDefects" will try to approximate those gaps using straight lines. We can then use that information to find the points where our fingertips are placed. 

``` C++ fingertip_detector.cpp
int main()
{
	...
	while (1)
	{
		...
		// Convex hull
		if (!contours.empty())
		{
			std::vector<std::vector<cv::Point> > hull(1);
			cv::convexHull(cv::Mat(contours[largestContour]), hull[0], false);
			cv::drawContours(frame, hull, 0, cv::Scalar(0, 255, 0), 3);
			if (hull[0].size() > 2)
			{
				std::vector<int> hullIndexes;
				cv::convexHull(cv::Mat(contours[largestContour]), hullIndexes, true);
				std::vector<cv::Vec4i> convexityDefects;
				cv::convexityDefects(cv::Mat(contours[largestContour]), hullIndexes, convexityDefects);
				for (size_t i = 0; i < convexityDefects.size(); i++)
				{
					cv::Point p1 = contours[largestContour][convexityDefects[i][0]];
					cv::Point p2 = contours[largestContour][convexityDefects[i][1]];
					cv::Point p3 = contours[largestContour][convexityDefects[i][2]];
					cv::line(frame, p1, p3, cv::Scalar(255, 0, 0), 2);
					cv::line(frame, p3, p2, cv::Scalar(255, 0, 0), 2);
				}
			}
		}
		cv::imshow(windowName, frame);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```

->![]({{ root_url}}/images/posts/fingertip7.png)<-

I drew the convexity defects lines in blue. The "convexityDefects" function returns a vector of tuples of four values. The first value is the initial point of the defect region. The second value is the ending point of the defect region. The third value is the "middle" point of the defect region that connects the initial point and the ending point. The result is then two lines: One from the initial point to the middle point and one from middle point to the ending point. What only interests us in the initial point, that is the point where our fingertips are placed. I will draw it to make it more evident.

->![]({{ root_url}}/images/posts/fingertip8.png)<-

Ta-da! What sucks, however, is that there are far more points than just our fingertips. We need to do a filtering for only the points of our interest. We can think in some cheap but useful heuristics for that: i) Consider the inner angle between the two lines of the defect region to be between a certain interval; ii) Consider the angle between the initial point and the center of the contour region to be between a certain interval; iii) Consider the length of the line from the initial point to the middle point to be above a certain threshold. I think only those three are enough. 

The inner angle is exactly the angle between our fingers. The image below illustrates the concept better:

->![](http://simena86.github.io/images/handRecognition/handangle.png)<-

Generally, the angle between our fingers is between 20° and 120°. It can be calculated by translating the vector to the origin (by subtracting both by the middle point of the defect region) and then calculating the arc cosine of the inner product divided by the norm of the vectors:

```
theta = arcos(x . y / |x||y|)
```

This nice snippet will do exactly that:

``` C++
float innerAngle(float px1, float py1, float px2, float py2, float cx1, float cy1)  
{  
  
 float dist1 = std::sqrt(  (px1-cx1)*(px1-cx1) + (py1-cy1)*(py1-cy1) );  
 float dist2 = std::sqrt(  (px2-cx1)*(px2-cx1) + (py2-cy1)*(py2-cy1) );  
  
 float Ax, Ay;  
 float Bx, By;  
 float Cx, Cy;  
  
 //find closest point to C  
 //printf("dist = %lf %lf\n", dist1, dist2);  
  
 Cx = cx1;  
 Cy = cy1;  
 if(dist1 < dist2)  
 {    
  Bx = px1;  
  By = py1;    
  Ax = px2;  
  Ay = py2;  
  
  
 }else{  
  Bx = px2;  
  By = py2;  
  Ax = px1;  
  Ay = py1;  
 }  
  
  
 float Q1 = Cx - Ax;  
 float Q2 = Cy - Ay;  
 float P1 = Bx - Ax;  
 float P2 = By - Ay;    
  
  
 float A = std::acos( (P1*Q1 + P2*Q2) / ( std::sqrt(P1*P1+P2*P2) * std::sqrt(Q1*Q1+Q2*Q2) ) );  
  
 A = A*180/CV_PI;  
  
 return A;  
}  
```

Now, the angle between the initial point and the center of contour region is necessary to erase points located in the lower part of the contour. In order to find the center of the contour, we must involve it with a bounding box. OpenCV already has a function for that called "boundingBox". We just are going to consider points that are between -30° and 160°. 

And finally, the length of line from the initial point to the middle point can be calculated by simply calculating the euclidean distance between the initial point and the middle point.

Crystal clear? Ok, here's the code:

``` C++ fingertip_detector.cpp
if (hull[0].size() > 2)
{
	std::vector<int> hullIndexes;
	cv::convexHull(cv::Mat(contours[largestContour]), hullIndexes, true);
	std::vector<cv::Vec4i> convexityDefects;
	cv::convexityDefects(cv::Mat(contours[largestContour]), hullIndexes, convexityDefects);
	cv::Rect boundingBox = cv::boundingRect(hull[0]);
	cv::rectangle(frame, boundingBox, cv::Scalar(255, 0, 0));
	cv::Point center = cv::Point(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
	std::vector<cv::Point> validPoints;
	for (size_t i = 0; i < convexityDefects.size(); i++)
	{
		cv::Point p1 = contours[largestContour][convexityDefects[i][0]];
		cv::Point p2 = contours[largestContour][convexityDefects[i][1]];
		cv::Point p3 = contours[largestContour][convexityDefects[i][2]];
		double angle = std::atan2(center.y - p1.y, center.x - p1.x) * 180 / CV_PI;
		double inAngle = innerAngle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
		double length = std::sqrt(std::pow(p1.x - p3.x, 2) + std::pow(p1.y - p3.y, 2));
		if (angle > -30 && angle < 160 && std::abs(inAngle) > 20 && std::abs(inAngle) < 120 && length > 0.1 * boundingBox.height)
		{
			validPoints.push_back(p1);
		}
	}
	for (size_t i = 0; i < validPoints.size(); i++)
	{
		cv::circle(frame, validPoints[i], 9, cv::Scalar(0, 255, 0), 2);
	}
}
```

And the result is good enough:

->![]({{ root_url}}/images/posts/fingertip10.png)<-

The final code can be found below. I improved it by removing the trackbars from the color and, instead of it, allowing the user to click on the region where the hand is located and it will automatically extract the color information from there. Click again to establish a interval of colors. I also put trackbars for the angles, so you can adjust it during the program execution and check the effect of different intervals.

<center><input id="spoiler" type="button" value="See source code" onclick="toggle_visibility('code');"></center>
<div id="code">
``` C++ fingertip_detector.cpp
#include <iostream>

#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>

int minH = 0, maxH = 20, minS = 30, maxS = 150, minV = 60, maxV = 255;
cv::Mat frame;
int count = 0;

float innerAngle(float px1, float py1, float px2, float py2, float cx1, float cy1)  
{  
  
 float dist1 = std::sqrt(  (px1-cx1)*(px1-cx1) + (py1-cy1)*(py1-cy1) );  
 float dist2 = std::sqrt(  (px2-cx1)*(px2-cx1) + (py2-cy1)*(py2-cy1) );  
  
 float Ax, Ay;  
 float Bx, By;  
 float Cx, Cy;  
  
 //find closest point to C  
 //printf("dist = %lf %lf\n", dist1, dist2);  
  
 Cx = cx1;  
 Cy = cy1;  
 if(dist1 < dist2)  
 {    
  Bx = px1;  
  By = py1;    
  Ax = px2;  
  Ay = py2;  
  
  
 }else{  
  Bx = px2;  
  By = py2;  
  Ax = px1;  
  Ay = py1;  
 }  
  
  
 float Q1 = Cx - Ax;  
 float Q2 = Cy - Ay;  
 float P1 = Bx - Ax;  
 float P2 = By - Ay;    
  
  
 float A = std::acos( (P1*Q1 + P2*Q2) / ( std::sqrt(P1*P1+P2*P2) * std::sqrt(Q1*Q1+Q2*Q2) ) );  
  
 A = A*180/CV_PI;  
  
 return A;  
}  

void CallbackFunc(int event, int x, int y, int flags, void* userdata)
{
	cv::Mat RGB = frame(cv::Rect(x, y, 1, 1));
	cv::Mat HSV;
	cv::cvtColor(RGB, HSV, CV_BGR2HSV);
	cv::Vec3b pixel = HSV.at<cv::Vec3b>(0, 0);
	if (event == cv::EVENT_LBUTTONDBLCLK) // on double left clcik
	{
		std::cout << "Click" << std::endl;
		int h = pixel.val[0];
		int s = pixel.val[1];
		int v = pixel.val[2];
		if (count == 0)
		{
			minH = h; 
			maxH = h;
			minS = s;
			maxS = s;
			minV = v;
			maxV = v;
		}
		else
		{
			if (h < minH)
			{
				minH = h;
			}
			else if (h > maxH)
			{
				maxH = h;
			}
			if (s < minS)
			{
				minS = s;
			}
			else if (s > maxS)
			{
				maxS = s;
			}
			if (v < minV)
			{
				minV = v;
			}
			else if (v > maxV)
			{
				maxV = v;
			}
			
		}
		count++;
	}
	std::cout << pixel << std::endl;
}

int main()
{
	cv::VideoCapture cap(0);
	const char* windowName = "Fingertip detection";
	cv::namedWindow(windowName);
	cv::setMouseCallback(windowName, CallbackFunc, NULL);
	int inAngleMin = 200, inAngleMax = 300, angleMin = 180, angleMax = 359, lengthMin = 10, lengthMax = 80;
	cv::createTrackbar("Inner angle min", windowName, &inAngleMin, 360);
	cv::createTrackbar("Inner angle max", windowName, &inAngleMax, 360);
	cv::createTrackbar("Angle min", windowName, &angleMin, 360);
	cv::createTrackbar("Angle max", windowName, &angleMax, 360);
	cv::createTrackbar("Length min", windowName, &lengthMin, 100);
	cv::createTrackbar("Length max", windowName, &lengthMax, 100);
	while (1)
	{
		cap >> frame;
		cv::Mat hsv;
		cv::cvtColor(frame, hsv, CV_BGR2HSV);
		cv::inRange(hsv, cv::Scalar(minH, minS, minV), cv::Scalar(maxH, maxS, maxV), hsv);
		// Pre processing
		int blurSize = 5;
		int elementSize = 5;
		cv::medianBlur(hsv, hsv, blurSize);
		cv::Mat element = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(2 * elementSize + 1, 2 * elementSize + 1), cv::Point(elementSize, elementSize));
		cv::dilate(hsv, hsv, element);
		// Contour detection
		std::vector<std::vector<cv::Point> > contours;
		std::vector<cv::Vec4i> hierarchy;
		cv::findContours(hsv, contours, hierarchy, CV_RETR_EXTERNAL, CV_CHAIN_APPROX_SIMPLE, cv::Point(0, 0));
		size_t largestContour = 0;
		for (size_t i = 1; i < contours.size(); i++)
		{
			if (cv::contourArea(contours[i]) > cv::contourArea(contours[largestContour]))
				largestContour = i;
		}
		cv::drawContours(frame, contours, largestContour, cv::Scalar(0, 0, 255), 1);
		// Convex hull
		if (!contours.empty())
		{
			std::vector<std::vector<cv::Point> > hull(1);
			cv::convexHull(cv::Mat(contours[largestContour]), hull[0], false);
			cv::drawContours(frame, hull, 0, cv::Scalar(0, 255, 0), 3);
			if (hull[0].size() > 2)
			{
				std::vector<int> hullIndexes;
				cv::convexHull(cv::Mat(contours[largestContour]), hullIndexes, true);
				std::vector<cv::Vec4i> convexityDefects;
				cv::convexityDefects(cv::Mat(contours[largestContour]), hullIndexes, convexityDefects);
				cv::Rect boundingBox = cv::boundingRect(hull[0]);
				cv::rectangle(frame, boundingBox, cv::Scalar(255, 0, 0));
				cv::Point center = cv::Point(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
				std::vector<cv::Point> validPoints;
				for (size_t i = 0; i < convexityDefects.size(); i++)
				{
					cv::Point p1 = contours[largestContour][convexityDefects[i][0]];
					cv::Point p2 = contours[largestContour][convexityDefects[i][1]];
					cv::Point p3 = contours[largestContour][convexityDefects[i][2]];
					double angle = std::atan2(center.y - p1.y, center.x - p1.x) * 180 / CV_PI;
					double inAngle = innerAngle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
					double length = std::sqrt(std::pow(p1.x - p3.x, 2) + std::pow(p1.y - p3.y, 2));
					if (angle > angleMin - 180 && angle < angleMax - 180 && inAngle > inAngleMin - 180 && inAngle < inAngleMax - 180 && length > lengthMin / 100.0 * boundingBox.height && length < lengthMax / 100.0 * boundingBox.height)
					{
						validPoints.push_back(p1);
					}
				}
				for (size_t i = 0; i < validPoints.size(); i++)
				{
					cv::circle(frame, validPoints[i], 9, cv::Scalar(0, 255, 0), 2);
				}
			}
		}
		cv::imshow(windowName, frame);
		if (cv::waitKey(30) >= 0) break;
	}
	return 0;
}
```
</div>

## Conclusion
Well... That wasn't so easy as it seemed at first. Detection tasks are indeed a pain in many cases. Even our example just works in very specific and unrealistic conditions (background with a much different color from our skin, hand is positioned in front of the camera in a certain angle, etc.,...), but, you know that they say: One step at a time. Until the next tutorial! 
