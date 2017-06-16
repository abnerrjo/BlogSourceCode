---
layout: post
title: "Solving the sliding puzzle"
date: 2015-12-06 17:01:05 -0300
comments: true
categories: [ai, algorithms, tutorials]
---
<script src="/js/sliding-puzzle/minheap.js"></script>
<script src="/js/sliding-puzzle/sliding-puzzle.js"></script>
<script src="/js/sliding-puzzle/sliding-puzzle-frontend.js"></script>

<link href="/stylesheets/sliding-puzzle.css" rel="stylesheet" type="text/css">

Sliding puzzle is a game composed by 2^n - 1 pieces dispersed along a board and a blank space. Those pieces are then shuffled and the objective is to rearrange them back to their original form, where the disposition of pieces is on ascending order, like shown below (go on, it's interactive):

<center>
	<div>
		<div id="container-a-example" class="puzzle"></div>
	</div>
</center> 

<script type="text/javascript">
	new PuzzleGUI($("#container-a-example"), 4, 50, 5, 100, 10, Algorithm.AManhattan);
</script>

You can rearrange the pieces "moving" the blank space across the board. Since you can only move it in four directions, it's a hell of a task to solve this game for a human, sometimes taking hours. Luckily, we dispose of some good algorithms to solve it, taking only few milliseconds even for the worst case. Let's explore them in this tutorial! :)

<!-- more -->

## Finding the correct abstraction
The hardest part of a problem is surely finding a useful abstraction for it, that allows a solution to be even thought! Like most path finding problems, the sliding puzzle can be correctly abstracted as a **graph**, i.e., a set of vertices connected by edges. 

It's common to use the term "**state**" to designate vertices. The meaning of a state depends on the problem. For example, for the sliding puzzle, each state is a determined disposition of pieces. Logically, there's also a "**goal state**", a state where the problem is solved. Finally, the edges are the allowed actions that takes our problem from a state to another. For example, in the sliding puzzle, the set of allowed actions is to move the blank space in four directions (up, down, left, right). The figure below illustrates well those concepts.

->![](http://www.ibm.com/developerworks/library/j-ai-search/figure06.png)<-

Assimilated those concepts, our job is simply to find a path from any state to the goal state, and that can be done with any graph search algorithm. Let's discuss the pros/cons of some approaches.

## Javascript implementation of Sliding Puzzle
Before discussing about specific algorithms, let's implement the building blocks. I'll start with a class called "Puzzle", containing basically four attributes: dimension (dimension of our puzzle, i.e., 3 = 8-puzzle, 4 = 15-puzzle, etc.,...), the board (two-dimensional numeric array), the path and the last performed move (we will cover those last two later).

``` Javascript sliding-puzzle.js
function Puzzle(dimension) {
	this.dimension = dimension;
	this.board = [];
	this.path = [];
	this.lastMove = null;
	// Fill the board
	for (var i = 0; i < dimension; i++) {
		this.board.push([]);
		for (var j = 0; j < dimension; j++) {
			if (i == this.dimension - 1 && j == this.dimension - 1) {
				this.board[i].push(0);
			} else {
				this.board[i].push(dimension * i + j + 1);
			}
		}
	}
}
``` 

Let's create some utilitary methods that will help during the craft of our solution:

``` Javascript sliding-puzzle.js
// Get the (x, y) position of the blank space
Puzzle.prototype.getBlankSpacePosition = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			if (this.board[i][j] == 0) {
				return [i, j];
			}
		}
	}
};

// Swap two items on a bidimensional array
Puzzle.prototype.swap = function(i1, j1, i2, j2) {
	var temp = this.board[i1][j1];
	this.board[i1][j1] = this.board[i2][j2];
	this.board[i2][j2] = temp;
}
```

And finally, let's implement the methods that will move the pieces:

``` Javascript sliding-puzzle.js
Direction = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "dow"
};

// Return the direction that a piece can be moved, if any
Puzzle.prototype.getMove = function(piece) {
	var blankSpacePosition = this.getBlankSpacePosition();
	var line = blankSpacePosition[0];
	var column = blankSpacePosition[1];
	if (line > 0 && piece == this.board[line-1][column]) {
		return Direction.DOWN;
	} else if (line < this.dimension - 1 && piece == this.board[line+1][column]) {
		return Direction.UP;
	} else if (column > 0 && piece == this.board[line][column-1]) {
		return Direction.RIGHT;
	} else if (column < this.dimension - 1 && piece == this.board[line][column+1]) {
		return Direction.LEFT;
	}
};

// Move a piece, if possible, and return the direction that it was moved
Puzzle.prototype.move = function(piece) {
	var move = this.getMove(piece);
	if (move != null) {
		var blankSpacePosition = this.getBlankSpacePosition();
		var line = blankSpacePosition[0];
		var column = blankSpacePosition[1];
		switch (move) {
		case Direction.LEFT:
			this.swap(line, column, line, column + 1);
			break;
		case Direction.RIGHT:
			this.swap(line, column, line, column - 1);
			break;
		case Direction.UP:
			this.swap(line, column, line + 1, column);
			break;
		case Direction.DOWN:
			this.swap(line, column, line - 1, column);
			break;
		}
		if (move != null) {
			this.lastMove = piece;
		}
		return move;
	}
};
```


## Breadth-First Search (BFS)
The most well-known graph search algorithm, along with Depth-First Search (DFS). I believe you are already familiarized with this algorithm. It works really simple: For each visited node, its immediate children are stored on a queue, and it's performed recursively until the queue is empty or a goal state is reached, that way transversing the graph "level-by-level".

In order to implement the BFS, we are going to need first two method beforehand: "**isGoalState**" and "**visit**". The "isGoalState" will check if the current state is a solution to the puzzle, while "visit" will generate the immediate children of the current state in the state space.

Let's start with "isGoalState". Well, it's kinda simple: We are in a goal state if all pieces are in their places. The original place of a piece can be defined as ```[(piece - 1) % dimension, (piece - 1) / dimension]```. Let's take some examples to check if this formule makes sense: 

```
piece = 1
dimension = 3 (8-puzzle)
original place = [(1 - 1) % 3, (1 - 1) / 3] = [0, 0]

piece = 7
dimension = 4 (15-puzzle)
original place = [(7 - 1) % 4, (7 - 1) / 4] = [2, 1]
```

Seems correct so far. That way our method is as follows:

``` Javascript sliding-puzzle.js
Puzzle.prototype.isGoalState = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) return false;
			}
		}
	}
	return true;
};
```

About the "visit" method, first we need to know all allowed moves we can do in a certain state. For example, if the blank space is on the bottom-left of screen, we may not be able to move down nor left. Luckily, this functionality is already implemented through the method "getMove" described on previous section.

```
// Return all current allowed moves
Puzzle.prototype.getAllowedMoves = function() {
	var allowedMoves = [];
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (this.getMove(piece) != null) {
				allowedMoves.push(piece);
			}
		}
	}
	return allowedMoves;
};
```

But knowing the allowed moves is not enough. We need to generate new states. In order to do that, we are going to need an utilitary method that makes a copy of the current state:

```
// Return a copy of current puzzle
Puzzle.prototype.getCopy = function() {
	var newPuzzle = new Puzzle(this.dimension);
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			newPuzzle.board[i][j] = this.board[i][j];
		}
	}
	for (var i = 0; i < this.path.length; i++) {
		newPuzzle.path.push(this.path[i]);
	}
	return newPuzzle;
};
```
Notice that we are not just copying the board, but also the path. "path" is an attribute that stores the pieces that were moved so far, that way allowing us to reexecute the whole process when a goal state is found.

And now we can finally implement it:

``` Javascript sliding-puzzle.js
Puzzle.prototype.visit = function() {
	var children = [];
	var allowedMoves = this.getAllowedMoves();
	for (var i = 0; i < allowedMoves.length; i++)  {
		var move = allowedMoves[i];
		if (move != this.lastMove) {
			var newInstance = this.getCopy();
			newInstance.move(move);
			newInstance.path.push(move);
			children.push(newInstance);
		}
	}
	return children;
};
```

Notice that we are ignoring moves that are equal to "lastMove". There's a reason behind it: Moving a piece that was already moved on the last turn will only make it to turn back to its original position! In another words, going back to a state that was already explored. That why we are "prunning" the tree avoiding this kind of behavior.

\*sigh\* After all those necessary things, we are now ready to finally implement the BFS algorithm, that is ridiculously simple:

``` Javascript sliding-puzzle.js
Puzzle.prototype.solveBFS = function() {
	var startingState = this.getCopy();
	startingState.path = [];
	var states = [startingState];
	while (states.length > 0) {
		var state = states[0];
		states.shift();
		if (state.isGoalState()) {
			return state.path;
		}
		states = states.concat(state.visit());
	}
};
```

We create an array called "states" to store the states that are waiting to be visited and put the current state on it. On a loop, we remove the first element (through the "shift" method, remember we are simulating a queue) and then check if that element is a goal state. If it is, return the sets of steps from our initial state until it (the "path" attribute), otherwise visit it and append the immediate children to the list of states.

**\*BONUS\***! You can check a simulation below:

<center>
	<h3>BFS</h3>
	<div>
		<div id="container-bfs" class="puzzle"></div>
		<br>
		Time elapsed: <span id="elapsed">0</span>ms
		<br>
		<button id="shuffle">Shuffle</button>
		<button id="solve">Solve</button>
	</div>
</center>

<script type="text/javascript">
	new PuzzleGUI($("#container-bfs"), 4, 50, 5, 100, 10, Algorithm.BFS);
</script>

**PRO**: It's easy to be implemented.<br>
**CON**: Waaaaaaay too slow.

## A*
As we saw previously, the BFS can correctly find an optimal solution to our problem, i.e., find a path from the starting state to the goal state with the minimum number of steps, but it has a huge drawback: it's too slow! If you shuffle the game too much and try to run it, it will possibly freeze your browser. 

So here's the A*, the top #1 favorite algorithm for problem solving agents, and, good for us, it's pretty simple too! 

It works similarly to BFS, but with some differences: Instead of a queue, we use a priority queue (a.k.a., min-heap), that is a data structure that instead of returning the first element added, it returns the element with lowest value. And, to each discovered state, we assign a value to it, that can be defined as: 

f(n) = g(n) + h(n)

g(n) (called **real cost function**) is the cost necessary to go from the starting state to the state n. Since we already discovered the whole path to it, we can easily calculate that cost with precision (for our sliding puzzle example, that cost can be represented as the path length, for example).  

h(n) (called **heuristic function**) is the estimated cost to go from the state n to the goal state. But here's the trick: We don't know the path from state n to the goal state yet! It's called *heuristic* precisely because we use heuristics to estimate it. 

For priority-queue implementation, I'm going to use that you can you find [here](http://www.digitaltsunami.net/projects/javascript/minheap/index.html).

Let's start initializing the algorithm:

``` Javascript sliding-puzzle.js
Puzzle.prototype.solveA = function() {
	var states = new MinHeap(null, function(a, b) {
		return a.distance - b.distance;
	});
	this.path = [];
	states.push({puzzle: this, distance: 0});
};
```

Now, on a loop, we are going to retrieve the items with lowest value until the "states" variable is empty or a goal state is reached.

``` Javascript sliding-puzzle.js
Puzzle.prototype.solveA = function() {
	var states = new MinHeap(null, function(a, b) {
		return a.distance - b.distance;
	});
	this.path = [];
	states.push({puzzle: this, distance: 0});
	while (states.size() > 0) {
		var state = states.pop().puzzle;
		if (state.isGoalState()) {
			return state.path;
		}
	}
};
```

And finally, we are going to visit the retrieved state's children, calculate their weights and insert them into the queue.

``` Javascript sliding-puzzle.js
Puzzle.prototype.solveA = function() {
	var states = new MinHeap(null, function(a, b) {
		return a.distance - b.distance;
	});
	this.path = [];
	states.push({puzzle: this, distance: 0});
	while (states.size() > 0) {
		var state = states.pop().puzzle;
		if (state.isGoalState()) {
			return state.path;
		}
		var children = state.visit();
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var f = child.g() + child.h();
			states.push({puzzle : child, distance: f});
		}
	}
};
```

Good, good. Now let's implement the "g" and "h" functions. For "g" function, I'll simply count the path length (what else could be considered as the real cost?):

``` Javascript sliding-puzzle.js
Puzzle.prototype.g = function() {
	return this.path.length;
};
```

The heuristic function is the tricky part. We could think in many things. It's important the heuristic be **admissible**, i.e., it must underestimate the real cost until the goal state. The closer the estimated value by heuristic function is to the real cost to go to the goal state, the better. 

### Heuristic #1: Misplaced tiles
This function counts simply the number of pieces(tiles) that are not in their final position. This function is almost identical to the one we implemented to check if a state is the goal:

``` Javascript sliding-puzzle.js
Puzzle.prototype.h = function() {
	var count = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) count++;
			}
		}
	}	
	return count;
}
``` 

<center>
	<h3>A*: Misplaced tiles</h3>
	<div>
		<div id="container-a-misplaced" class="puzzle"></div>
		<br>
		Time elapsed: <span id="elapsed">0</span>ms
		<br>
		<button id="shuffle">Shuffle</button>
		<button id="solve">Solve</button>
	</div>
</center> 

<script type="text/javascript">
	new PuzzleGUI($("#container-a-misplaced"), 4, 50, 5, 100, 10, Algorithm.AMisplaced);
</script>

### Heuristic #2: Manhattan distance
Instead of just counting the number of misplaced tiles, this heuristic function calculates the manhattan distance (L1 distance) between the current misplaced position and the final position. Manhattan distance can be calculated as:

d(x1, y1, x2, y2) = |x1 - x2| + |y1 - y2|

``` Javascript sliding-puzzle.js
Puzzle.prototype.h = function() {
	var distance = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				distance += Math.abs(i - originalLine) + Math.abs(j - originalColumn);
			}
		}
	}	
	return distance;
}
``` 

<center>
	<h3>A*: Manhattan distance</h3>
	<div>
		<div id="container-a-manhattan" class="puzzle"></div>
		<br>
		Time elapsed: <span id="elapsed">0</span>ms
		<br>
		<button id="shuffle">Shuffle</button>
		<button id="solve">Solve</button>
	</div>
</center> 

<script type="text/javascript">
	new PuzzleGUI($("#container-a-manhattan"), 4, 50, 5, 100, 10, Algorithm.AManhattan);
</script>

This heuristic is obviously better than the previous, since it always yields a higher value and hence closer to the real cost. 

## Full code
You can get the full code here:
<center><input id="spoiler" type="button" value="See source code" onclick="toggle_visibility('code');"></center>
<div id="code">
``` Javascript sliding-puzzle.js
Direction = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "dow"
};

Algorithm = {
	BFS: "BFS",
	AMisplaced: "A*: Misplaced tiles",
	AManhattan: "A*: Manhattan distance"
};

function Puzzle(dimension, solve_func) {
	this.board = [];
	this.path = [];
	this.dimension = dimension;
	this.solve_func = solve_func;
	this.lastMove = null;
	for (var i = 0; i < dimension; i++) {
		this.board.push([]);
		for (var j = 0; j < dimension; j++) {
			if (i == this.dimension - 1 && j == this.dimension - 1) {
				this.board[i].push(0);
			} else {
				this.board[i].push(dimension * i + j + 1);
			}
		}
	}
};

// Get the (x, y) position of the blank space
Puzzle.prototype.getBlankSpacePosition = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			if (this.board[i][j] == 0) {
				return [i, j];
			}
		}
	}
};

// Swap two items on a bidimensional array
Puzzle.prototype.swap = function(i1, j1, i2, j2) {
	var temp = this.board[i1][j1];
	this.board[i1][j1] = this.board[i2][j2];
	this.board[i2][j2] = temp;
}

// Return the direction that a piece can be moved, if any
Puzzle.prototype.getMove = function(piece) {
	var blankSpacePosition = this.getBlankSpacePosition();
	var line = blankSpacePosition[0];
	var column = blankSpacePosition[1];
	if (line > 0 && piece == this.board[line-1][column]) {
		return Direction.DOWN;
	} else if (line < this.dimension - 1 && piece == this.board[line+1][column]) {
		return Direction.UP;
	} else if (column > 0 && piece == this.board[line][column-1]) {
		return Direction.RIGHT;
	} else if (column < this.dimension - 1 && piece == this.board[line][column+1]) {
		return Direction.LEFT;
	}
};

// Move a piece, if possible, and return the direction that it was moved
Puzzle.prototype.move = function(piece) {
	var move = this.getMove(piece);
	if (move != null) {
		var blankSpacePosition = this.getBlankSpacePosition();
		var line = blankSpacePosition[0];
		var column = blankSpacePosition[1];
		switch (move) {
		case Direction.LEFT:
			this.swap(line, column, line, column + 1);
			break;
		case Direction.RIGHT:
			this.swap(line, column, line, column - 1);
			break;
		case Direction.UP:
			this.swap(line, column, line + 1, column);
			break;
		case Direction.DOWN:
			this.swap(line, column, line - 1, column);
			break;
		}
		if (move != null) {
			this.lastMove = piece;
		}
		return move;
	}
};

Puzzle.prototype.isGoalState = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) return false;
			}
		}
	}
	return true;
};

// Return a copy of current puzzle
Puzzle.prototype.getCopy = function() {
	var newPuzzle = new Puzzle(this.dimension);
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			newPuzzle.board[i][j] = this.board[i][j];
		}
	}
	for (var i = 0; i < this.path.length; i++) {
		newPuzzle.path.push(this.path[i]);
	}
	return newPuzzle;
};

// Return all current allowed moves
Puzzle.prototype.getAllowedMoves = function() {
	var allowedMoves = [];
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (this.getMove(piece) != null) {
				allowedMoves.push(piece);
			}
		}
	}
	return allowedMoves;
};

Puzzle.prototype.visit = function() {
	var children = [];
	var allowedMoves = this.getAllowedMoves();
	for (var i = 0; i < allowedMoves.length; i++)  {
		var move = allowedMoves[i];
		if (move != this.lastMove) {
			var newInstance = this.getCopy();
			newInstance.move(move);
			newInstance.path.push(move);
			children.push(newInstance);
		}
	}
	return children;
};

Puzzle.prototype.solveBFS = function() {
	var startingState = this.getCopy();
	startingState.path = [];
	var states = [startingState];
	while (states.length > 0) {
		var state = states[0];
		states.shift();
		if (state.isGoalState()) {
			return state.path;
		}
		states = states.concat(state.visit());
	}
};

Puzzle.prototype.g = function() {
	return this.path.length;
};

Puzzle.prototype.getManhattanDistance = function() {
	var distance = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				distance += Math.abs(i - originalLine) + Math.abs(j - originalColumn);
			}
		}
	}
	return distance;
};

Puzzle.prototype.countMisplaced = function() {
	var count = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) count++;
			}
		}
	}	
	return count;
}

Puzzle.prototype.h = function() {
	if (this.solve_func == Algorithm.AMisplaced) {
		return this.countMisplaced();
	} else {
		return this.getManhattanDistance();
	}
};

Puzzle.prototype.solveA = function() {
	var states = new MinHeap(null, function(a, b) {
		return a.distance - b.distance;
	});
	this.path = [];
	states.push({puzzle: this, distance: 0});
	while (states.size() > 0) {
		var state = states.pop().puzzle;
		if (state.isGoalState()) {
			return state.path;
		}
		var children = state.visit();
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var f = child.g() + child.h();
			states.push({puzzle : child, distance: f});
		}
	}
};

Puzzle.prototype.solve = function() {
	if (this.solve_func == Algorithm.BFS) {
		return this.solveBFS();
	} else {
		return this.solveA();
	}
};
``` 
</div>
</input>

And since this page itself is utilizing this code for demonstration, you can also get it visualizing the source code.

## Conclusion
Well, that was a quite interesting tutorial. We discussed about **space of states**, **goal state**, **graph search algorithms**, **A\*** and **admissible heuristics**. I hope you have enjoyed reading this tutorial as much as I did writing it. See ya on the next tutorial! :D
