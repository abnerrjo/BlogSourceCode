---
layout: post
title: "Red-Black Tree in Alloy II"
date: 2015-03-21 09:23:26 -0300
comments: true
categories: [tutorials, alloy]
---
On the previous tutorial, we learnt how to build a consistent tree in Alloy.

On this tutorial, we are finally going to build a Red-Black Tree, respecting all its properties. 

<!-- more -->

If you remember, a Red-Black Tree is also a BST (Binary Search Tree). So we need to make a BST *before* we can do a RBT. 

BST properties are pretty simple:

For each node X:<br/>
- Left child data is always smaller than X's.<br/>
- Right child data is always greater than X's.<br/>

And that's it!

The first thing we need to increment on our previous model is the "data" concept. Data will be representated as an integer number:

``` Alloy RedBlackTree.als
sig Node {
	...
	data : one Int
}
```

With only that, we already can see a difference in our model:

->![]({{ root_url}}/images/posts/alloy6.png)<-

As you can see, each node is associated with an integer number. In order to ease the visualization, let's modify our theme to put the "data" relation inside each node.

Click on "theme":

->![]({{ root_url}}/images/posts/alloy7.png)<-

On "relations", select "data" (1), turn "Show as arcs" off and "Show as attribute" on (2). After that, click on "Apply" (3).

->![]({{ root_url}}/images/posts/alloy8.png)<-

Much better, right? :))

Now we need only one fact in order to transform our current model in a BST:

``` Alloy RedBlackTree.als
fact organizeLeftAndRightUsingData {
	all n: Node |
		(all l: n.left.*children | n.data > l.data) and
		(all r: n.right.*children | n.data < r.data)
}
```

It's pretty easy to understand what it is doing: For each node (all), its data is greater than *all* its left children (recursively), and is smaller than *all* its right children (recursively).

That's it! 

Now let's do our next step toward a Red-Black Tree. As you know, in a red-black tree, each node has one of those two colors: red or black. We play with those colors in order to make the tree balanced, that is, make left and right children with more or less with the same height. In order to ensure that, there are two properties we must respect: 

1) All children of a red node is black.

2) The black height, that is, the number of black nodes from the root node of the three until a leaf, is the same for all the leaves.

By convenction, we always make the root node as black.

Similar to the BST, the first thing we need to add is the "color" concept. Color will be representated as an *enum*. In Alloy, enumerations have the following syntax:

``` Alloy
enum [Name] {
	[ Values ]
}
``` 

For our case:

``` Alloy RedBlackTree.als
enum Color {
	RED, BLACK
}
```

And now we just need to add a relation to our signature "Node":

``` Alloy RedBlackTree.als
sig Node {
	...
	color: one Color
}
```

If you try to execute the model, we may get something like this (alike data, I also transformed "color" in an attribute):

->![]({{ root_url}}/images/posts/alloy9.png)<-

As expected, it's not respecting the red-black tree properties. Let's fix it, starting by the most trivial fact:

``` Alloy RedBlackTree.als
fact rootIsBlack {
	all n: Node |
		no children.n => n.color = BLACK
}
```

"If a node has no parent, then its color is black!".

As we defined previously that there was only a node that has no parent, then, by definition, it's the root.

The second fact we are going to add is going to make all children of a red node black:

``` Alloy RedBlackTree.als
fact redNodeChildrenAreBlack {
	all n: Node |
		n.color = RED => 
			all c: n.children | c.color = BLACK
}
```

Also easy to understand!

And finally, let's fix the black height:

``` Alloy RedBlackTree.als
fact blackHeightIsSameToAllPaths {
	all n: Node |
		#(n.left.*children - color.RED)  = #(n.right.*children - color.RED)
}
```

"#" is an operator in Alloy that returns the number of elements in a set. So, in our fact above, we are saying that, for all nodes, the number of red nodes in the left child is equals to the number of red nodes in the right child. It's the same thing as to say that the number of black nodes is equal to them both, hence, respecting the black-height property.

If you try to execute the model right now, you will see a very different scenario:

->![]({{ root_url}}/images/posts/alloy10.png)<-

Our red-black tree is alive!

You can see the source code below:


<center><input id="spoiler" type="button" value="See source code" onclick="toggle_visibility('code');"></center>
<div id="code">
``` Alloy RedBlackTree.als
module RedBlackTree

enum Color { BLACK, RED }

sig Node {
	parent: lone Node,
	left: lone Node,
	right: lone Node,
	children: set Node,
	data: one Int,
	color: one Color	
}

pred isRoot[n: Node] {
	no n.parent
}

// facts about nodes 
fact makeChildren {
	all n: Node | n.children = n.left + n.right
}

fact makeParent {
	all n: Node |
		(all c : n.children | c.parent = n) 
	all n1, n2 : Node | n1 = n2.parent => n2 in n1.children
}

fact noCycles {
	all n1, n2: Node |
			(n1 in n2.children) => n2 !in n1.*children
}

fact leftAndRightAreDisjoint {
	no left & right
}

fact theresOnlyOneRoot {
	one n: Node | isRoot[n]
}

// facts about data
fact dataIsUnique {
	all n1, n2: Node | n1 != n2 => n1.data != n2.data
}

fact organizeLeftAndRightUsingData {
	all n: Node |
		(all l: n.left.*children | n.data > l.data) and
		(all r: n.right.*children | n.data < r.data)
}

// facts about node colors
fact rootIsBlack {
	all n: Node |
		no children.n => n.color = BLACK
}

fact redNodeChildrenAreBlack {
	all n: Node |
		n.color = RED => 
			all c: n.children | c.color = BLACK
}

fact blackHeightIsSameToAllPaths {
	all n: Node |
		#(n.left.*children - color.RED)  = #(n.right.*children - color.RED)
}

pred show[] { 
	#left > 2
	#right > 2
	all d: Node.data | d > 0
}

run show for 10
``` 
</div>
</input>
