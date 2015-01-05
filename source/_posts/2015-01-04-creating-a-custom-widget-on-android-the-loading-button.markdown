---
layout: post
title: "Creating a custom widget on Android: The Loading Button"
date: 2015-01-04 18:57:51 -0300
comments: true
categories: [Tutorials, Android]
---
Here I'll ilustrate the creation of a custom widget 
through a pratical example: A Loading Button. A loading button is a 
button with a spinning indicator. It's useful for buttons that 
trigger servers requests. 

->![]({{ root_url }}/images/posts/spinning_button.png)<-

->[Click here to download the example]({{root_url}}/downloads/code/TutorialButton.zip)<-

<!-- more -->

As our first step, let's create a Java class called "LoadingButton" 
that extends of RelativeLayout view. You may be asking why we are 
extending of RelativeLayout instead of Button class. The quick answer 
is Button doesn't allow views inside of it, Layouts does, and we're 
going to need that functionality. :) (But don't worry, that won't make 
our button less than a button!). 

``` Java LoadingButton.java

import android.content.Context;
import android.util.AttributeSet;
import android.widget.RelativeLayout;

public class LoadingButton extends RelativeLayout {

    public LoadingButton(Context context) {
        super(context);
    }

    public LoadingButton(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public LoadingButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

}

```

Notice we need the three constructors to make our custom widgets 
work. They all are necessary. 

Now let's "draw" our widget. Create a method called "init" and 
call it inside the all constructors.

``` Java LoadingButton.java

public class LoadingButton extends RelativeLayout {

    private void init() {
    
    }

    public LoadingButton(Context context) {
        super(context);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

}

```

Now, inside this method, let's begin defining our layout as 
"clickable" (it's false as default) and setting its background as the 
same as a button background. 

```  Java LoadingButton.java

    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
    }

``` 

For our button, we need two children: A TextView and a ProgressBar. 
The TextView will display the button text, while the progressbar will 
display the spinning indicator. 

``` Java LoadingButton.java

    private TextView mTextView;
    private ProgressBar mProgressBar;
    
    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
        mTextView = new TextView(getContext());
        mProgressBar = new ProgressBar(getContext());
        addView(mTextView);
        addView(mProgressBar);
    }

```

Simple like that! By using the "addView" method we are adding a new view to 
our layout. But we still need to define things like: width, 
height and style. For width and height, we're going to use something called 
LayoutParams, that acts the same as android:layout_* attributes on XML 
Layout files.

``` Java LoadingButton.java

    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
        LayoutParams textViewParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        textViewParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        LayoutParams progressBarParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        progressBarParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        mTextView = new TextView(getContext());
        mTextView.setLayoutParams(textViewParams);
        mProgressBar = new ProgressBar(getContext());
        mProgressBar.setLayoutParams(progressBarParams);
        mProgressBar.setVisibility(View.INVISIBLE);
        addView(mTextView);
        addView(mProgressBar);
    }

```

It's pretty straight-forward. We're here setting width and height to 
"wrap_content" and centering both widgets. Of course, we're not going 
to show both at the same time, that's why I hid the progressbar using 
the "setVisibility" method. 

Now we just need two others methods, that either will display the spinning 
indicator either will display the text. 

``` Java LoadingButton.java

    public void startLoading() {
        mProgressBar.setVisibility(View.VISIBLE);
        mTextView.setVisibility(View.INVISIBLE);
    }

    public void stopLoading() {
        mProgressBar.setVisibility(View.INVISIBLE);
        mTextView.setVisibility(View.VISIBLE);
    }

```

And here's the complete class:

``` Java LoadingButton.java

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class LoadingButton extends RelativeLayout {

    private TextView mTextView;
    private ProgressBar mProgressBar;

    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
        LayoutParams textViewParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        textViewParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        LayoutParams progressBarParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        progressBarParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        mTextView = new TextView(getContext());
        mTextView.setLayoutParams(textViewParams);
        mProgressBar = new ProgressBar(getContext());
        mProgressBar.setLayoutParams(progressBarParams);
        mProgressBar.setVisibility(View.INVISIBLE);
        addView(mTextView);
        addView(mProgressBar);
    }

    public void startLoading() {
        mProgressBar.setVisibility(View.VISIBLE);
        mTextView.setVisibility(View.INVISIBLE);
    }

    public void stopLoading() {
        mProgressBar.setVisibility(View.INVISIBLE);
        mTextView.setVisibility(View.VISIBLE);
    }

    public LoadingButton(Context context) {
        super(context);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

}

```
> Wait! Something is missing! We are using a RelativeLayout to simulate 
a button, but layouts don't have the attribute "android:text". So how 
do you set the text? 

For that we're going to need a styleable.

Styleable is, in short, a set of custom attributes. For example, when 
you declare in your layouts xml files on your top-parent view the 
following attribute: 
`xmlns:android="http://schemas.android.com/apk/res/android"`, you are 
actually saying where are Android default styleables and naming it "android", 
so you can access the attributes through the prefix "android:". 

To create a new styleable, go to res > values > attrs.xml. If this 
file is not created yet, create it with the following structure:

``` XML attrs.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
</resources>
``` 

Now, inside of the newly created file, type the following structure:

``` XML attrs.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <declare-styleable name="LoadingButton">
    </declare-styleable>
    
</resources>
```

Through the tag `<declare-styleable>` we are setting a new styleable 
and its name attribute defines its... name (it has no impact, it's 
just a matter of identification).

Now let's define a custom attribute called "text" to serve as a way to 
set our button text.


``` XML attrs.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <declare-styleable name="LoadingButton" >
        <attr name="text" format="string" />
    </declare-styleable>

</resources>
```

To create a new attribute just create a new tag of type `<attr>` 
inside the `<declare-styleable>` tag. A tag has a name (the attribute 
name) and a format, namely the input type it accepts. The format can 
be of the several types, among them: string, integer, boolean, ... 


And we are done with styleables! If we need to pass more informations 
for our button beyond its text, like, for example, text color, just 
create a new attribute! 

Now let's go back to our Java class. Now we need to link our newly 
created styleble to our class. For that create a method called 
"setAttributes" that receives as parameter a variable of kind "Context" 
and another of kind "AttributeSet" and returns void and calls this 
method inside all constructors except the one that just receives one 
parameter.

``` Java LoadingButton.java

    private void setAttributes(Context context, AttributeSet attrs) {
        
    }
    
    public LoadingButton(Context context) {
        super(context);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
        setAttributes(context, attrs);
    }

    public LoadingButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
        setAttributes(context, attrs);
    }

``` 

Now, inside this method, we are going to link to our styleable 
throught the following code:

``` Java LoadingButton.java

    private String mText;
    
    private void setAttributes(Context context, AttributeSet attrs) {
        TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.LoadingButton, 0, 0);
        try {
            mText = ta.getString(R.styleable.LoadingButton_text);
        } finally {
            ta.recycle();
        }
    }

``` 

I created a new class member called "mText" to store the string we are 
going to get through the attribute "text". To link to our styleable se 
use the method "obtainStyledAttributes", that receives as parameter 
the set of attributes (attrs) and the styleable name. Finally, we 
extract an attribute value calling the called "get*", where * is the 
type of attribute we want to extract. This type is related to the 
"format" we defined on our XML file. 

Now we just need to adjust the method "init" to now set the text of 
EditText to our variable "mText".

``` Java LoadingButton.java

    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
        LayoutParams textViewParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        textViewParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        LayoutParams progressBarParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        progressBarParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        mTextView = new TextView(getContext());
        mTextView.setLayoutParams(textViewParams);
        mTextView.setText(mText);
        mProgressBar = new ProgressBar(getContext());
        mProgressBar.setLayoutParams(progressBarParams);
        mProgressBar.setVisibility(View.INVISIBLE);
        addView(mTextView);
        addView(mProgressBar);
    }

```

And now here is our fully completed class:

``` Java LoadingButton.java

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class LoadingButton extends RelativeLayout {

    private TextView mTextView;
    private ProgressBar mProgressBar;
    private String mText;

    private void init() {
        setClickable(true);
        setBackgroundResource(android.R.drawable.btn_default);
        LayoutParams textViewParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        textViewParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        LayoutParams progressBarParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        progressBarParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        mTextView = new TextView(getContext());
        mTextView.setLayoutParams(textViewParams);
        mTextView.setText(mText);
        mProgressBar = new ProgressBar(getContext());
        mProgressBar.setLayoutParams(progressBarParams);
        mProgressBar.setVisibility(View.INVISIBLE);
        addView(mTextView);
        addView(mProgressBar);
    }

    public void startLoading() {
        mProgressBar.setVisibility(View.VISIBLE);
        mTextView.setVisibility(View.INVISIBLE);
    }

    public void stopLoading() {
        mProgressBar.setVisibility(View.INVISIBLE);
        mTextView.setVisibility(View.VISIBLE);
    }

    private void setAttributes(Context context, AttributeSet attrs) {
        TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.LoadingButton, 0, 0);
        try {
            mText = ta.getString(R.styleable.LoadingButton_text);
        } finally {
            ta.recycle();
        }
    }

    public LoadingButton(Context context) {
        super(context);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        setAttributes(context, attrs);
        init();
    }

    public LoadingButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        setAttributes(context, attrs);
        init();
    }

}

``` 

And now it's ready to be used! 

``` XML

    <PACKAGE_NAME.LoadingButton
        xmlns:app="http://schemas.android.com/apk/res-auto"
        android:id="@+id/loading_button"
        android:layout_width="150dp"
        android:layout_height="wrap_content"
        app:text="Hello world!" />

```

You must replace "PACKAGE_NAME" for the package where the 
LoadingButton class is within. Also, notice I must define to where my 
styleable is before using its attribute. You could pass the real path 
(http://schemas.android.com/apk/res/values/attrs.xml), but the res-auto 
automatically redirects to "attrs.xml". After naming it "app", I could 
have access to the "text" attribute through the prefix "app:".  

And here's a snippet to demonstrate it working:

``` Java MyActivity.java

    private LoadingButton button;
    private boolean loading = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my);

        button = (LoadingButton) findViewById(R.id.loading_button);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (loading) {
                    button.stopLoading();
                    loading = false;
                } else {
                    button.startLoading();
                    loading = true;
                }
            }
        });
    }

```

->![]({{ root_url }}/images/posts/spinning_button.png)<-

->[Click here to download the example]({{root_url}}/downloads/code/TutorialButton.zip)<-
 
