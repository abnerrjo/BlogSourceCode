---
layout: post
title: "Red-Black tree in Alloy"
date: 2015-03-15 08:30:39 -0300
comments: true
categories: [tutorials, alloy]
---
->![]({{ root_url}}/images/posts/alloy.png)<-

Everyone who once worked as an analyst knows that one of the most ambiguous, error-prone part of building a software is the requisite engineering. It's a hell of a task to know what the client *wants* and *how* to build a system that meets his expectations.

Bugs in the software specification are hundred, thousand times more expensive than bugs on internal logic, because in order to fix it you frequently need to change the behavior of your software, demanding a complete rethinking on your software architecture.

**Alloy Analyzer** is a tool for building models. Its very purpose is to find a specific instance of your model that contradicts your expectations about it. Because a model can have thousand or even infinite instances, it's restricted to a certain scope. A model can be thought as a high-high-level abstraction of your software. It may not find a bug of implementation, but it can spots illegal states that your software can assume, hence helping to find bugs in specification level.

On today tutorial, we are going to learn how to specify a red-black tree in Alloy.

<!-- more -->

The very first thing you need to know about Alloy is **Signature**. Signature is an abstraction of a real-world entity. Signature also can be thought as a set of relations. Making a parallel, signatures are equivalent to classes in object-oriented programming.

Signatures are declared as the following:

``` Alloy
sig [Name] {
	[ Relations ]
}
```

For our red-black tree, we are just going to need one signature: Node. A node of the tree.

``` Alloy RedBlackTree.als
signature Node {

}
```

In the same way that our classes in OOP need attributes, so need our signatures. With the difference that here attributes are called **relations**. Relations have a name, cardinality and set of other signatures we want to relate to. They are declared as the following:
``` Alloy
sig [Name] {
	[ RelationName] : [ Cardinality] [ SignaturesNames ] 
}
``` 
Example:
``` Alloy
sig aSignature {
	aRelation : one aSignature
}
```
A relation name must be unique inside a signature. The most common types of cardinality is `one` (one instance of signature A is related to one and only one instance of signature B), `lone` (one instance of signature A is related to zero or one instance of signature B), `set` (one instance of signature A is related to zero or more instances of signature B) and `some` (one instance of signature A is related to one or more instances of signature B), where A is the signature that contains that relation and B are the signatures refferenced by the relation.

For our red-black tree, the signature node must contain as least four relations:

``` Alloy RedBlackTree.als
sig Node {
	parent: lone Node,
	left: lone Node,
	right: lone Node, 
	children: set Node
}
```
- **parent**: The parent node. It's lone because the root node doesn't have any parent.
- **left**: The left child node. It's lone because a node may not have a left child.
- **right**: The right child node. It's lone because a node may not have a right child.
- **children**: The set of children node. It may seem redundant, but it will help us to constrain our model later on.

Now let's start validating our model! There are two ways to check models in Alloy: Automatic and manual checks. Although automatic checks are more useful for our purposes, manual checks are good enough in the building phase of our model because we can see "what's going on". 

For manual checks, first add one predicate to our model (more about predicates later on):

``` Alloy RedBlackTree.als
pred show[] {

}

run show for 5
```

The statement "run" run a predicate for a certain scope (we need a scope because there may be infinite instances of our model). Now you just need to execute it:

->![]({{ root_url}}/images/posts/alloy2.png)<-

A message will appear in the right-side of the screen indicating if any instance was found (on manual check, unlike automatic check, it's bad when none instance is found, because it means that there wasn't any instance for that scope that attended to your models contraints, meaning there is some logical contradiction). 

->![]({{ root_url}}/images/posts/alloy3.png)<-

Now you just need to click on "Instance" to start visualizing the existing instances for your current model.

->![]({{ root_url}}/images/posts/alloy4.png)<-

Here, a instance is representated like a directed graph, what's very useful for us, because the graph representation is the tree itself. :))

And **oops**... We already found a bug (many, actually). First: A node is being parent of itself (what's not allowed in trees, because trees don't allow cycles), and a node is being at the same time parent and left child of another node (what's not allowed, again, because the non-cycle constraint). 

As you can see, the sole reason of those bugs is because we are allowing our tree to make cycles. We need to add some constraint to forbid it. But how? With *facts*!

Facts are constraints that must be valid *all the time*. They are declared as the following:

``` Alloy 
fact [Name] {
	[ FactBody ]
}
```

The very first fact we are going to add is that the set of children is the union of right and left child. We need that before going on with the next facts.

``` Alloy RedBlackTree.als
fact makeChildren {
	all n : Node | n.children = n.left + n.right
} 
``` 

Wow, slow down, slow down! 

First, "all" has the same semantic of the universal quantifier. It means that something must be valid for all elements of a set. In this case, we are using as set "Node", meaning all instances of the signature Node, and we are naming each particular instance being iterated as "n", so we can access it on the "all" body. 

In the "all" body, we are setting the "children" set as the union (in Alloy, unions are representated as the "+" operator) between left and right children (that also are sets, but unitary ones). Yea, that's the dirty fact about Alloy: As it's a formal specification tool, everything is grounded on the Set Theory.

Now let's specify a fact about the parent of the nodes: If a Node A is parent of another Node B, then Node B is inside Node A's children. Makes sense, right? :)) 

But before that, we need to specify that the tree must there be have one and only one root. Root is a node that has no parent, so it's pretty straight-forward:

``` Alloy RedBlackTree.als
fact theresOnlyOneRoot {
	one n: Node | no n.parent
}
```

"no" is a operator that returns true if the set is empty.
"one" indicates that there must be one and only one element inside the set that attends to its condition.

Now we have everything necessary to constrain a node parent:

``` Alloy RedBlackTree.als
fact makeParent {
	all n: Node |
		(all c : n.children | c.parent = n) 
	all n1, n2 : Node | n1 = n2.parent => n2 in n1.children
}
```

First, for every element inside a node's children, then the child parent is the node itself. Nothing more fair! 

Second, if a Node A is parent of another Node B, then Node B must be inside Node A's children. The "=>" operator means "implies". If the left side of implies is true, then, by definition, the right side must also be true (however, if the left side is false, nothing can be said about the right side).

If you run a manual check now, you will notice that many inconsistences were fixed, but many remain. Let's fix some of them:

First, in none moment we define that left and right child must be different. Hence, something like that can happen in our current model:

->![]({{ root_url}}/images/posts/alloy5.png)<-

That's the tricky part about understanding modeling in Alloy: If we don't define anything, everything may be possible! 

Let's fix partially this problem:

``` Alloy RedBlackTree.als
fact leftAndRightAreDisjoint {
	no left & right
}
``` 

Actually, this is a more strong constraint than if we defined something like that:

```
fact leftAndRightAreDisjoint {
	all n : Node | n.left != n.right
}
```

Because, in the latter, only the left and right child of the *immediate* node must be different, but nothing is said about their possible children. So, something like that could happen: Node A has Node B as left child and Node C as right child, and Node B has Node C as right child. So, the disjunction must be tree level, not node level. That's why I came with the first solution. 

Yea, you *can* use the relation name independent of the signature. It will return a set of tuples <Node, Node> representating the relation. The "&" operator is equals to "disjoint". It returns true if, for each element in the first set, it's not inside the second set.

Just that solved a lot of trouble for us, but we still have the "cycle" problem, our, oh! so hated bug. Let's solve it once for all!

```Alloy RedBlackTree.als
fact noCycles {
	all n1, n2: Node |
			(n1 in n2.children) => n2 !in n1.*children
}
```

Hmmm.... What's going on? We get any two nodes: n1 and n2. If n1 is a child of n2, then n2 can't be a child of n1, otherwise, there would be a cycle! 

Of course, the same rule is valid for all the children of n1 downto the leaves nodes: n2 can't be a child of any node on a level below n1. But how do we get all children below n1 level? Using the "*" operator! It applies the relation (children, in our case) recursively until it can't be applied anymore (when the node is leaf). 

Now let's get everything together:
``` Alloy RedBlackTree.als
sig Node {
	parent: lone Node,
	left: lone Node,
	right: lone Node, 
	children: set Node
}

fact makeChildren {
  all n : Node | n.children = n.left + n.right
}

fact theresOnlyOneRoot {
  one n: Node | no n.parent
}

fact makeParent {
	all n: Node |
		(all c : n.children | c.parent = n) 
	all n1, n2 : Node | n1 = n2.parent => n2 in n1.children
}

fact leftAndRightAreDisjoint {
	no left & right
}

fact noCycles {
	all n1, n2: Node |
			(n1 in n2.children) => n2 !in n1.*children
}

pred show[] {
	some n : Node | n.left = n.right
}

run show for 5
``` 

Wow!! All this work just to specify a *consistent* tree, not even a BST, imagine a red-black tree! Fortunately, a good part of Alloy syntax was covered in this simple tutorial. On the next part of this tutorial, we will learn how to make our tree a red-black tree. Until there!

And if you can't hold the curiosity, here's the complete code for the red-black tree:

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
