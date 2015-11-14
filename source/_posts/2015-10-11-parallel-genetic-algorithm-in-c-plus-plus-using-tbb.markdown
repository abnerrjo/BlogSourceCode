---
layout: post
title: "Parallel Genetic Algorithm in C++ using TBB"
date: 2015-10-11 09:55:50 -0300
comments: true
categories: [tutorials, c++, tbb, parallel]
---
I've just finished my AI course, and the idea of [evolutionary computing](https://en.wikipedia.org/wiki/Evolutionary_computation) has appealed me incredibly. Basically, evolutionary computing is a set of algorithms inspired by [Charles Darwin's Theory of Evolution](https://en.wikipedia.org/wiki/Evolution) with intent of providing some intel on solving optimization problems. On this category, it's included its most prominent example, the [Genetic Algorithm](https://en.wikipedia.org/wiki/Genetic_algorithm).

But what is the Genetic Algorithm? It's really pretty simple (and beautiful): Genetic Algorithm is a heuristic to search for the best solution of a optimization problem (such as the [Knapsack problem](https://en.wikipedia.org/wiki/Knapsack_problem), finding the best parameters of a neural network, and many others...), the 'best' here having direct analogy to the Theory of Evolution 'survival of the fittest'. 

<!-- more --> 

Each '**individual**' (a.k.a., candidate solution) is codified as a '**chromosome**', which is generally representated by a vector of numbers. Each vector value is called '**gene**'. A set of individuals is called '**population**'. Those 'individuals' will then compete to have a chance to 'reproduce', which is the act of mixing two chromosomes to generate a new one, different but similar to both parents. The fitter the individual, the greater the chance it has to reproduce (controlled by a function called '**crossover function**', which will always generate two new individuals, both having a certain percentage of genes of both parents. For example, if we define a crossover rate to being 30%, one child will have 30% of parent A's genes and 70% of parent B's genes, while the other will have 70% of parent A's genes and 30% of parent B's genes. There's also a chance of a gene suffer '**mutation**', e.g., changing to a random value, during the crossover process). The fitness of an individual is measured through a function called '**fitness function**'. This is an iterative algorithm, and on each iteration we have a new '**generation**' of individuals. There are many stop criterias for this algorithm, one of them being the number of generations. Crystal clear? Then let's see a simple pseudo-code, shall we? :))
 
```  
function GENETIC_ALGORITHM(population_size, max_num_generations, crossover_rate, mutation_chance) begin
	population = GENERATE_RANDOM_POPULATION(population_size) // GENERATE_RANDOM_POPULATION: problem depent. it depains on chromosome size and domain of allowed values
	for gen = 1 to max_num_generations do
		new_population = { } 
		for i = 1 to population_size / 2 do
			chromosome_a, chromosome_b = SELECT_INDIVIDUALS(population)
			new_chromosome_a, new_chromosome_b = CROSSOVER(chromosome_a, chromosome_b, crossover_rate, mutation_chance)
			INSERT(new_population, new_chromosome_a)
			INSERT(new_population, new_chromosome_b)
		endfor
		population = new_population
	endfor
	return population
end

// On this example, we are using the Roulette method for selecting the individuals. There are many other methods.
function SELECT_INDIVIDUALS(population) begin
	upper_bound = 0
	for each individual in population do
		upper_bound = upper_bound + GET_FITNESS(individual)
	endfor
	i = RAND(1, upper_bound) 
	j = RAND(1, upper_bound)
	child_a = NULL
	child_b = NULL
	count = 0
	while i > 0 or j > 0 do
		if i > 0 then
			i -= GET_FITNESS(population[count])
			if i <= 0 then 
				child_a = population[count] 
			endif
		endif
		if j > 0 then
			j -= GET_FITNESS(population[count])
			if j <= 0 then
				child_b = population[count]
			endif
		endif
		count = count + 1
	endwhile 
	return { child_a, child_b } 
end

function CROSSOVER(parent_a, parent_b, crossover_rate, mutation_chance) begin
	size = SIZE(parent_a) 
	split_index_a = FLOOR(size * crossover_rate)
	split_index_b = FLOOR(size * (1 - crossover_rate))
	child_a = CONCATENATE(SLICE(parent_a, 1, split_index_a), SLICE(parent_b, split_index_a + 1, size))
	child_b = CONCATENATE(SLICE(parent_a, 1, split_index_b), SLICE(parent_b, split_index_b + 1, size))
	for i = 1 to size do
		if RAND(0, 1) <= mutation_chance then
			MUTATE(child_a, i) // MUTATE: problem dependent. it depains on domain of allowed values.
		endif
		if RAND(0, 1) <= mutation_chance then
			MUTATE(child_b, i) 
		endif 
	endfor
	return { child_a, child_b }
end
```

## Implementation on C++
As you can notice, the functions 'GENERATE_RANDOM_POPULATION', 'GET_FITNESS' and 'MUTATE' are all problem dependents. It depains on informations like chromosome size, domain of allowed values, etc., ... For our implementation on C++, we are letting the user provide pointers to their own-defined functions. Also, the user may use other informations other than numbers to codify their chromosomes. That's why we are going to use templates. Our little program starts as simple (or not) as follows:

``` C++ genetic_algorithm.cpp
template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	// TODO
}

```
As C++ is unable to look up an array size on runtime, we also had to add a new parameter to obtain that information (chromosomeSize). Also, notice the parameter 'maximization'. It serves to turn the algorithm flexible to both, maximization and minimization problems.

Let's advance and start implementing the main loop.

``` C++ genetic_algorithm.cpp
template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		float* fitnesses = getFitnesses(population, populationSize, getFitness, maximization);
		// Get upper bound
		float upperBound = 0;
		for (size_t i = 0; i < populationSize; i++)
		{
			upperBound += fitnesses[i];
		}
		T** newPopulation = new T*[populationSize];
		for (size_t j = 0; j < populationSize; )
		{
			// TODO
		}
		delete fitnesses;
		clear(population, populationSize);
		population = newPopulation;
	}	
	return population;
}
```
The function 'getFitnesses' is responsible to calculate the fitness value for all individuals. Since it's only necessary to do once for generation, we moved it to outside the inner loop (which populates the new population). We also calculated a 'upperBound', necessary to implementate our roullete (check the pseudo-code). We then finally allocated memory for the new populate, and after it has been populated, we deallocated memory for the old population (through the method 'clear') and assigned the reference to the new population. Implementations for the methods 'getFitnesses' and 'clear' can be found below:
``` C++ genetic_algorithm.cpp

template <typename T>
float* getFitnesses(T** population, size_t populationSize, float (*getFitness)(T*), bool maximization)
{
	float* fitnesses = new float[populationSize];
	for (size_t i = 0; i < populationSize; i++)
	{
		fitnesses[i] = getFitness(population[i]);
	}
	// Invert values on minimization problems
	if (!maximization)
	{
		float maxFitness = std::numeric_limits<float>::min();
		for (size_t i = 0; i < populationSize; i++)
		{
			if (fitnesses[i] > maxFitness) maxFitness = fitnesses[i];
		}
		for (size_t i = 0; i < populationSize; i++)
		{
			fitnesses[i] = maxFitness - fitnesses[i];
		}
	}
	return fitnesses;
}

template <typename T>
void clear(T** population, size_t populationSize)
{
	for (size_t i = 0; i < populationSize; i++)
	{
		delete population[i];
	}
	delete[] population;
}
```
Notice that on 'getFitnesses', we had to "invert" the fitness values in case of maximization is disabled. That's because the roulette always favours the individuals which have the biggest range of values. So we need to do this little trick by subtracing by the maximum value found. 

Questions, please? No? Alright, let's then advance with the implementation of the inner loop.
``` C++ genetic_algorithm.cpp
template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		float* fitnesses = getFitnesses(population, populationSize, getFitness, maximization);
		// Get upper bound
		float upperBound = 0;
		for (size_t i = 0; i < populationSize; i++)
		{
			upperBound += fitnesses[i];
		}
		T** newPopulation = new T*[populationSize];
		for (size_t j = 0; j < populationSize; )
		{
			std::pair<T*, T*> parents = selectIndividuals(population, populationSize, fitnesses, upperBound);
			std::pair<T*, T*> children = crossover(parents, chromosomeSize, crossoverRate, mutationChance, mutate);
			newPopulation[j] = children.first;
			j++;
			newPopulation[j] = children.second;
			j++;
		}	
		delete fitnesses;
		clear(population, populationSize);
		population = newPopulation;
	}
	return population;
}
```
Notice we are getting the selected individuals through the method 'selectIndividuals', that returns a pair, the parents which will generate two new children through the method 'crossover'. Let's first take a look at the method 'selectIndividuals':
``` C++ genetic_algorithm.cpp
template <typename T>
std::pair<T*, T*> selectIndividuals(T** population, size_t populationSize, float* fitnesses, float upperBound)
{
	// Get a number between 0 and upper bound
	std::pair<T*, T*> chosen = std::make_pair(population[rand() % populationSize], population[rand() % populationSize]);
	float probA = static_cast<float>(rand()) / RAND_MAX * upperBound;
	float probB = static_cast<float>(rand()) / RAND_MAX * upperBound;
	size_t i = 0;
	// Rotate the roulette
	while ((probA > 0 || probB > 0) && i < populationSize)
	{
		if (probA > 0)
		{
			probA -= fitnesses[i];
			if (probA <= 0) chosen.first = population[i];
		}
		if (probB > 0)
		{
			probB -= fitnesses[i];
			if (probB <= 0) chosen.second = population[i];
		} 
		i++;
	}
	return chosen;
}
```
It was a pretty straight-forward implementation of the pseudo-code previously shown. We first select two random numbers between 0 and the upper bound, which is the sum of population all fitness values. We then, on a loop, decrement those values until they reach a value less or equal to zero, indicating which the random individual was found (resembling, in fact, the rotation of a roulette). As a picture is worth a thousand words, here's an illustration:

->![](https://camo.githubusercontent.com/c21e4cacd4ad53ff19828005efe560bd4f0f4c20/687474703a2f2f696d6775722e636f6d2f64396c56702e706e67) <-

Hey, did you noticed we assigned the variable 'chosen' initially to two random individuals? Well, that's a protection against when the fitness value for all individuals are equal on minimization problems (can you tell me why would it bug? :)). Crystal clear? Excellent! Now let's check out the 'crossover' function:
``` C++ genetic_algorithm.cpp
template <typename T>
std::pair<T*, T*> crossover(std::pair<T*, T*> parents, size_t chromosomeSize, float crossoverRate, float mutationChance, void (*mutate)(T*, size_t))
{
	size_t sizeA = static_cast<size_t>(chromosomeSize * crossoverRate);
	size_t sizeB = chromosomeSize - sizeA;
	T* childA = new T[chromosomeSize];
	T* childB = new T[chromosomeSize];
	// Copy first part of chromosomes
	memcpy(childA, parents.first, sizeA * sizeof(T));
	memcpy(childB, parents.second, sizeA * sizeof(T));
	// Copy second part of chromosomes
	memcpy(childA + sizeA, parents.second + sizeA, sizeB * sizeof(T));
	memcpy(childB + sizeA, parents.first + sizeA, sizeB * sizeof(T));
	// Apply mutation
	for (size_t i = 0; i < chromosomeSize; i++)
	{
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childA, i);
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childB, i);
	}
	return std::make_pair(childA, childB);
}
```
There's nothing much complex happening here. We are just copying parts of chromosomes of both parents to the two new children, following the logic described right on the beginning of this tutorial. Here's an illustration to make it clearer:

-><a href="https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)">![](https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/OnePointCrossover.svg/231px-OnePointCrossover.svg.png)</a> <-

We then finally apply the mutation operator over every gene of the new children with a certain probability. Both, probability and mutation behavior are user-defined. Mutations are very useful to help preventing the solutions to get stuck on a local maxima.

And that's it! That's our simple implementation of Genetic Algorithm on C++! The full code can be found below:

``` C++ genetic_algorithm.cpp
#include <stdlib.h>
#include <cstdio>
#include <memory.h> 
#include <time.h>
#include <vector>
#include <map>
#include <fstream>
#include <iostream>
#include <limits>
#include <cmath>

template <typename T>
std::pair<T*, T*> selectIndividuals(T** population, size_t populationSize, float* fitnesses, float upperBound)
{
	// Get a number between 0 and upper bound
	std::pair<T*, T*> chosen = std::make_pair(population[rand() % populationSize], population[rand() % populationSize]);
	float probA = static_cast<float>(rand()) / RAND_MAX * upperBound;
	float probB = static_cast<float>(rand()) / RAND_MAX * upperBound;
	size_t i = 0;
	// Rotate the roulette
	while ((probA > 0 || probB > 0) && i < populationSize)
	{
		if (probA > 0)
		{
			probA -= fitnesses[i];
			if (probA <= 0) chosen.first = population[i];
		}
		if (probB > 0)
		{
			probB -= fitnesses[i];
			if (probB <= 0) chosen.second = population[i];
		} 
		i++;
	}
	return chosen;
}

template <typename T>
std::pair<T*, T*> crossover(std::pair<T*, T*> parents, size_t chromosomeSize, float crossoverRate, float mutationChance, void (*mutate)(T*, size_t))
{
	size_t sizeA = static_cast<size_t>(chromosomeSize * crossoverRate);
	size_t sizeB = chromosomeSize - sizeA;
	T* childA = new T[chromosomeSize];
	T* childB = new T[chromosomeSize];
	// Copy first part of chromosomes
	memcpy(childA, parents.first, sizeA * sizeof(T));
	memcpy(childB, parents.second, sizeA * sizeof(T));
	// Copy second part of chromosomes
	memcpy(childA + sizeA, parents.second + sizeA, sizeB * sizeof(T));
	memcpy(childB + sizeA, parents.first + sizeA, sizeB * sizeof(T));
	// Apply mutation
	for (size_t i = 0; i < chromosomeSize; i++)
	{
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childA, i);
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childB, i);
	}
	return std::make_pair(childA, childB);
}

template <typename T>
float* getFitnesses(T** population, size_t populationSize, float (*getFitness)(T*), bool maximization)
{
	float* fitnesses = new float[populationSize];
	for (size_t i = 0; i < populationSize; i++)
	{
		fitnesses[i] = getFitness(population[i]);
	}
	// Invert values on minimization problems
	if (!maximization)
	{
		float maxFitness = std::numeric_limits<float>::min();
		for (size_t i = 0; i < populationSize; i++)
		{
			if (fitnesses[i] > maxFitness) maxFitness = fitnesses[i];
		}
		for (size_t i = 0; i < populationSize; i++)
		{
			fitnesses[i] = maxFitness - fitnesses[i];
		}
	}
	return fitnesses;
}

template <typename T>
void clear(T** population, size_t populationSize)
{
	for (size_t i = 0; i < populationSize; i++)
	{
		delete population[i];
	}
	delete[] population;
}

template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		float* fitnesses = getFitnesses(population, populationSize, getFitness, maximization);
		// Get upper bound
		float upperBound = 0;
		for (size_t i = 0; i < populationSize; i++)
		{
			upperBound += fitnesses[i];
		}
		T** newPopulation = new T*[populationSize];
		for (size_t j = 0; j < populationSize; )
		{
			std::pair<T*, T*> parents = selectIndividuals(population, populationSize, fitnesses, upperBound);
			std::pair<T*, T*> children = crossover(parents, chromosomeSize, crossoverRate, mutationChance, mutate);
			newPopulation[j] = children.first;
			j++;
			newPopulation[j] = children.second;
			j++;
		}	
		delete fitnesses;
		clear(population, populationSize);
		population = newPopulation;
	}
	return population;
}
``` 

## Algorithm parallelization
If you read until here, you may feel cheated, since we didn't even mention the word 'parallel'. Fear not, my dear friend! Now is the time! However, we must first analyze what can and what cannot be parallelized. 

If you give a quick look at the algorithm we just implemented, we may notice the existence of two loops, one nested in another, inside the function 'geneticAlgorithm'. There's also a loop for calculating the fitness value for all individuals (function 'getFitnesses'). There's a loop for applying the mutation operator (function 'crossover') and finally there's a loop for selecting the individuals (function 'selectIndividuals'). So far we have five candidates. Which of them can be parallelized? All (yay!)? None (awww...)?

* **Candidate I: The outer loop on 'geneticAlgorithm'** <br>
That... cannot be parallelized. Aww... The reason is simple: The individuals of the next generation depains of the individuals of the previous generation. We cannot skip to the next generation without knowing which individuals composed the previous generation.
* **Candidate II: The inner loop on 'geneticAlgorithm'** <br>
That... can be parallelized! Yay! And the reason is as simple as the previous one: We can generate new children parallely (you see, even in the real world, parents can give birth to many children at once). In fact, we are not dealing with any collateral effect during the children creation, other than adding them to a write-only list without collision (and which will be just read on the next iteration).
* **Candidate III: Loop on 'getFitnesses'** <br>
You may be asking: Which loop? There are actually three on that function, but only one worth to be parallelized. Why? Because the computation being accomplished on last two is too low. The overhead of starting new threads would surpass the computation of the block itself. We just have the first loop now, and that... can be parallelized! Yay! Calculating the fitness for an individual *doesn't* depains of the fitness of the other individuals of a population, so it can be easily be done on parallel. 
* **Candidate IV: Mutation loop on 'crossover'** <br>
Though it can be parallelized, the mutation operator is too simple (it just assigns the position to a random value), so the overhead wouldn't compensate. So, aww... 
* **Candidate V: Roulette loop on 'selectIndividuals'** <br>
That's a though one, since we need to syncronize two values (probA and probB) among several threads. Since we use the two values during the whole block, the lock would certainly break the parallelism and turn everything in a single-thread like schema! So, the answer is no. Aww... 

Our score was 2/5, not bad, not bad at all. ;)
Now that we know *what* can be parallelized, let's find out *how* we can do it. 

We can do it using the library [TBB](https://www.threadingbuildingblocks.org), which stands for **T**hreading **B**uilding **B**blocks. It provides several features for parallelism, such as multi-threads, locks, concurrent containers, etc., ... Everything on a high-level abstraction. Of course it's not our intent to explain the details of the library, so let's start with the simplest example: **[the parallel for](https://www.threadingbuildingblocks.org/docs/help/reference/algorithms/parallel_for_func.htm)**. 

As the name indicates, the parallel for is a kind of loop where the iterations are executed in parallel. The syntax is as follow:

``` C++ 
#include <tbb/parallel_for.h>

tbb::parallel_for(const Range& const Body& body, [, partitioner[, task_group_context& group]]);
```
Here's an example using **[blocked_range](https://www.threadingbuildingblocks.org/docs/help/reference/algorithms/range_concept/blocked_range_cls.htm)**:

``` C++
#include <tbb/parallel_for.h>
#include <tbb/blocked_range.h>

std::vector<int> values;
int count = 0;
tbb::parallel_for(tbb::blocked_range<size_t>(0, values.size()), [&count, &values](const tbb::blocked_range<size_t>& x) {
	for (size_t i = x.begin(); i < x.end(); i++)
	{
		count += values[i];
	}
});
```
On the above example, we are summing the values of a vector in parallel. Notice the use of a lambda function to implement the 'body' of the parallel for. It always expects to receive a range of same type as defined on the 'range' parameter (in this case, size_t). A 'blocked_range' expects to receive two iterable values, a begin and an end, which can later be accessed inside the 'parallel_for' body. 
The TBB then is responsible to not assign any repeated range value for any thread. In fact, it will create *x* threads initially, where *x* is the number of cores of your processor, and will assign the first *x* values of the range to those threads. The next range values will then be distributed on a queue-like schema. 

But enough of theory! That's all we need to know for while. Let's starting turning the inner loop on 'geneticAlgorithm' into a parallel for!

``` C++ parallel_genetic_algorithm.cpp
template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		...
		tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
			for (size_t j = x.begin(); j < x.end(); j += 2)
			{
				std::pair<T*, T*> parents = selectIndividuals(population, populationSize, fitnesses, upperBound);
				std::pair<T*, T*> children = crossover(parents, chromosomeSize, crossoverRate, mutationChance, mutate);
				newPopulation[j] = children.first;
				newPopulation[j + 1] = children.second;
			}
		});	
		...
	}
	return population;
}
```
That was pretty simple. We just simply created a 'parallel_for' with a blocked range from 0 to populationSize (identical to the previous for limits), and on the parallel_for body we almost use the same block of code, with the difference we don't increment the counter 'j' before add a new child. Instead of, we increment += 2 on the internal for loop. The reason we decided to adopt this logic instead of previous one is simple: Incrementing the range inside the body would imply in a lock *before* adding a new child, hence slowing the process unnecessarily. We also don't need a lock before assigning a new child to the new population, because it's a write-only array without key collision (we don't assign two or more to the same index).

> OBS: As we are using lambda functions, don't forget to add the ```-std=c++11``` flag to the compiler, since lambda functions are a feature from C++11. Also, don't forget to link the TBB library (```-ltbb```).

Now let's parallelize our second candidate, the function 'getFitnesses'. That's also very simple. Indeed, simpler than the previous one. 

``` C++ parallel_genetic_algorithm.cpp
float* getFitnesses(T** population, size_t populationSize, float (*getFitness)(T*), bool maximization)
{
	float* fitnesses = new float[populationSize];
	tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
		for (size_t i = x.begin(); i < x.end(); i++)
		{
			fitnesses[i] = getFitness(population[i]);
		}
	});
	...
	return fitnesses;
}
```

And that's all! You can check the full code here:

``` C++ parallel_genetic_algorithm.cpp
#include <stdlib.h>
#include <cstdio>
#include <memory.h> 
#include <time.h>
#include <vector>
#include <map>
#include <fstream>
#include <iostream>
#include <limits>
#include <cmath>

#include <tbb/parallel_for.h>
#include <tbb/blocked_range.h>

template <typename T>
std::pair<T*, T*> selectIndividuals(T** population, size_t populationSize, float* fitnesses, float upperBound)
{
	// Get a number between 0 and upper bound
	std::pair<T*, T*> chosen = std::make_pair(population[rand() % populationSize], population[rand() % populationSize]);
	float probA = static_cast<float>(rand()) / RAND_MAX * upperBound;
	float probB = static_cast<float>(rand()) / RAND_MAX * upperBound;
	size_t i = 0;
	// Rotate the roulette
	while ((probA > 0 || probB > 0) && i < populationSize)
	{
		if (probA > 0)
		{
			probA -= fitnesses[i];
			if (probA <= 0) chosen.first = population[i];
		}
		if (probB > 0)
		{
			probB -= fitnesses[i];
			if (probB <= 0) chosen.second = population[i];
		} 
		i++;
	}
	return chosen;
}

template <typename T>
std::pair<T*, T*> crossover(std::pair<T*, T*> parents, size_t chromosomeSize, float crossoverRate, float mutationChance, void (*mutate)(T*, size_t))
{
	size_t sizeA = static_cast<size_t>(chromosomeSize * crossoverRate);
	size_t sizeB = chromosomeSize - sizeA;
	T* childA = new T[chromosomeSize];
	T* childB = new T[chromosomeSize];
	// Copy first part of chromosomes
	memcpy(childA, parents.first, sizeA * sizeof(T));
	memcpy(childB, parents.second, sizeA * sizeof(T));
	// Copy second part of chromosomes
	memcpy(childA + sizeA, parents.second + sizeA, sizeB * sizeof(T));
	memcpy(childB + sizeA, parents.first + sizeA, sizeB * sizeof(T));
	// Apply mutation
	for (size_t i = 0; i < chromosomeSize; i++)
	{
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childA, i);
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childB, i);
	}
	return std::make_pair(childA, childB);
}

template <typename T>
float* getFitnesses(T** population, size_t populationSize, float (*getFitness)(T*), bool maximization)
{
	float* fitnesses = new float[populationSize];
	tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
		for (size_t i = x.begin(); i < x.end(); i++)
		{
			fitnesses[i] = getFitness(population[i]);
		}
	});
	// Invert values on minimization problems
	if (!maximization)
	{
		float maxFitness = std::numeric_limits<float>::min();
		for (size_t i = 0; i < populationSize; i++)
		{
			if (fitnesses[i] > maxFitness) maxFitness = fitnesses[i];
		}
		for (size_t i = 0; i < populationSize; i++)
		{
			fitnesses[i] = maxFitness - fitnesses[i];
		}
	}
	return fitnesses;
}

template <typename T>
void clear(T** population, size_t populationSize)
{
	for (size_t i = 0; i < populationSize; i++)
	{
		delete population[i];
	}
	delete[] population;
}

template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		float* fitnesses = getFitnesses(population, populationSize, getFitness, maximization);
		// Get upper bound
		float upperBound = 0;
		for (size_t i = 0; i < populationSize; i++)
		{
			upperBound += fitnesses[i];
		}
		T** newPopulation = new T*[populationSize];
		tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
			for (size_t j = x.begin(); j < x.end(); j += 2)
			{
				std::pair<T*, T*> parents = selectIndividuals(population, populationSize, fitnesses, upperBound);
				std::pair<T*, T*> children = crossover(parents, chromosomeSize, crossoverRate, mutationChance, mutate);
				newPopulation[j] = children.first;
				newPopulation[j + 1] = children.second;
			}
		});	
		delete fitnesses;
		clear(population, populationSize);
		population = newPopulation;
	}
	return population;
}
```

## A concrete example: Finding roots of a polynomium
Until now, we just touched the realm of theory, without showing the practicability of the genetic algorithms. After all, for what they are for? So here's a "simple" minimization problem: Given any polynomium:

a*x^n + b*x^(n - 1) + cx^(n - 2) + ... + C

The objective is to find the roots of the equation, e.g., the value of 'x' which evaluates the expression to zero when substituted. 

I chose this problem because it's non-trivial and in fact proved to be NP-Hard. However, numerical approximations do exist. So why not use a genetic algorithm to provide us an approximated result too? 

Let's formalize our problem:

**Input:** <br>
A real value X indicating the min value of a gene allowed; A real value Y indicating the max value of a gene allowed (X < Y); An integer value N indicating the population size (N > 10); An integer value M indicating the maximum number of generations (M > 0); A real value C indicating the mutation chance (0 <= C <= 1); A real value P indicating the crossover rate (0 <= P <= 1); An integer value I (I > 0) followed by I real values, the coefficients of the polynomial equation. For example: ```4 3 4.5 2 1``` translates to 3*x^3 + 4.5*x^2 + 2x + 1.

**Output:** <br>
A list of the 10 most fittest individuals after M generations.

Our first step: Let's start reading the input.

``` C++ root_finder.cpp
float minValue;
float maxValue;
size_t populationSize;
size_t maxNumGenerations;
float mutationChance;
float crossoverRate;
std::vector<float> coefficients;

int main()
{
	std::cin >> minValue >> maxValue >> populationSize >> maxNumGenerations >> mutationChance >> crossoverRate;
	int numCoefficients;
	std::cin >> numCoefficients;
	for (int i = 0; i < numCoefficients; i++)
	{
		float coefficient;
		std::cin >> coefficient;
		coefficients.push_back(coefficient);
	}
	return 0;
}
```

That's a piece of cake. The next step is to create our own definition of the fitness function. It seems that simply substituing the value of 'x' on the polynomial expression will be enough. The closer the result it is to zero, the fitter the solution. As we are dealing with a minimization problem, we have to be careful to prevent negative values. 

``` C++ root_finder.cpp
float getFitness(float* chromosome)
{
	float x = chromosome[0];
	float value = 0;
	for (size_t i = 0; i < coefficients.size(); i++)
	{
		value += coefficients[i] * std::pow(x, coefficients.size() - i - 1);
	}
	return std::abs(value);
}
```

Now let's implementate the functions 'generateRandomPopulation' and 'mutate'. Those are also very simple:

``` C++ root_finder.cpp
float getRandomValue()
{
	float r = static_cast<float>(rand()) / static_cast<float>(RAND_MAX);
	return r * (maxValue - minValue) + minValue;
}

float** generateRandomPopulation(size_t chromosomeSize, size_t populationSize)
{
	float** population = new float*[populationSize];
	for (size_t i = 0; i < populationSize; i++)
	{
		population[i] = new float[chromosomeSize];
		population[i][0] = getRandomValue();
	}
	return population;
}

void mutate(float* chromosome, size_t index)
{
	chromosome[index] = getRandomValue();
}
``` 
Notice we are using chromosome of size 1. That's because we just want to find one value (the value of 'x'). Clear? Excellent, because that's all we need! Now let's just connect the dots:

``` C++ root_finder.cpp
int main()
{
	std::cin >> minValue >> maxValue >> populationSize >> maxNumGenerations >> mutationChance >> crossoverRate;
	int numCoefficients;
	std::cin >> numCoefficients;
	for (int i = 0; i < numCoefficients; i++)
	{
		float coefficient;
		std::cin >> coefficient;
		coefficients.push_back(coefficient);
	}
	srand(time(0));
	float** solutions = geneticAlgorithm(1, populationSize, maxNumGenerations, crossoverRate, mutationChance, 
		&generateRandomPopulation, &getFitness, &mutate, false);
	std::map<float, float*> orderedSolutions;
	for (size_t i = 0; i < populationSize; i++)
	{
		orderedSolutions[getFitness(solutions[i])] = solutions[i];
	}
	int count = 0;
	for (std::map<float, float*>::iterator it = orderedSolutions.begin(); it != orderedSolutions.end(); ++it)
	{
		if (++count > 10) break;
		std::cout << "#" << count << " x = " << it->second[0] << " (fitness = " << it->first << ")" << std::endl;
	}
	clear(solutions, populationSize);
	return 0;
}
```

We use ```srand(time(0))``` to send a random seed every time the program is executed, and then a map to sort the retrieved results by the fitness value. The full code can be found below:

<center><input id="spoiler" type="button" value="See source code" onclick="toggle_visibility('code');"></center>
<div id="code">
``` C++ root_finder.cpp
#include <stdlib.h>
#include <cstdio>
#include <memory.h> 
#include <time.h>
#include <vector>
#include <map>
#include <fstream>
#include <iostream>
#include <limits>
#include <cmath>

#include <tbb/parallel_for.h>
#include <tbb/blocked_range.h>

template <typename T>
std::pair<T*, T*> selectIndividuals(T** population, size_t populationSize, float* fitnesses, float upperBound)
{
	// Get a number between 0 and upper bound
	std::pair<T*, T*> chosen = std::make_pair(population[rand() % populationSize], population[rand() % populationSize]);
	float probA = static_cast<float>(rand()) / RAND_MAX * upperBound;
	float probB = static_cast<float>(rand()) / RAND_MAX * upperBound;
	size_t i = 0;
	// Rotate the roulette
	while ((probA > 0 || probB > 0) && i < populationSize)
	{
		if (probA > 0)
		{
			probA -= fitnesses[i];
			if (probA <= 0) chosen.first = population[i];
		}
		if (probB > 0)
		{
			probB -= fitnesses[i];
			if (probB <= 0) chosen.second = population[i];
		} 
		i++;
	}
	return chosen;
}

template <typename T>
std::pair<T*, T*> crossover(std::pair<T*, T*> parents, size_t chromosomeSize, float crossoverRate, float mutationChance, void (*mutate)(T*, size_t))
{
	size_t sizeA = static_cast<size_t>(chromosomeSize * crossoverRate);
	size_t sizeB = chromosomeSize - sizeA;
	T* childA = new T[chromosomeSize];
	T* childB = new T[chromosomeSize];
	// Copy first part of chromosomes
	memcpy(childA, parents.first, sizeA * sizeof(T));
	memcpy(childB, parents.second, sizeA * sizeof(T));
	// Copy second part of chromosomes
	memcpy(childA + sizeA, parents.second + sizeA, sizeB * sizeof(T));
	memcpy(childB + sizeA, parents.first + sizeA, sizeB * sizeof(T));
	// Apply mutation
	for (size_t i = 0; i < chromosomeSize; i++)
	{
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childA, i);
		if (static_cast<float>(rand()) / RAND_MAX <= mutationChance) mutate(childB, i);
	}
	return std::make_pair(childA, childB);
}

template <typename T>
float* getFitnesses(T** population, size_t populationSize, float (*getFitness)(T*), bool maximization)
{
	float* fitnesses = new float[populationSize];
	tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
		for (size_t i = x.begin(); i < x.end(); i++)
		{
			fitnesses[i] = getFitness(population[i]);
		}
	});
	// Invert values on minimization problems
	if (!maximization)
	{
		float maxFitness = std::numeric_limits<float>::min();
		for (size_t i = 0; i < populationSize; i++)
		{
			if (fitnesses[i] > maxFitness) maxFitness = fitnesses[i];
		}
		for (size_t i = 0; i < populationSize; i++)
		{
			fitnesses[i] = maxFitness - fitnesses[i];
		}
	}
	return fitnesses;
}

template <typename T>
void clear(T** population, size_t populationSize)
{
	for (size_t i = 0; i < populationSize; i++)
	{
		delete population[i];
	}
	delete[] population;
}

template <typename T>
T** geneticAlgorithm(size_t chromosomeSize, size_t populationSize, size_t maxNumGenerations, float crossoverRate, float mutationChance, 
	T** (*generateRandomPopulation)(size_t, size_t), float (*getFitness)(T*), void (*mutate)(T*, size_t), bool maximization)
{
	T** population = generateRandomPopulation(chromosomeSize, populationSize);
	for (size_t i = 0; i < maxNumGenerations; i++)
	{
		float* fitnesses = getFitnesses(population, populationSize, getFitness, maximization);
		// Get upper bound
		float upperBound = 0;
		for (size_t i = 0; i < populationSize; i++)
		{
			upperBound += fitnesses[i];
		}
		T** newPopulation = new T*[populationSize];
		tbb::parallel_for(tbb::blocked_range<size_t>(0, populationSize), [=](const tbb::blocked_range<size_t>& x) {
			for (size_t j = x.begin(); j < x.end(); j += 2)
			{
				std::pair<T*, T*> parents = selectIndividuals(population, populationSize, fitnesses, upperBound);
				std::pair<T*, T*> children = crossover(parents, chromosomeSize, crossoverRate, mutationChance, mutate);
				newPopulation[j] = children.first;
				newPopulation[j + 1] = children.second;
			}
		});	
		delete fitnesses;
		clear(population, populationSize);
		population = newPopulation;
	}
	return population;
}

//----------------------------------------------------------------------
float minValue;
float maxValue;
size_t populationSize;
size_t maxNumGenerations;
float mutationChance;
float crossoverRate;
std::vector<float> coefficients;

float getRandomValue()
{
	float r = static_cast<float>(rand()) / static_cast<float>(RAND_MAX);
	return r * (maxValue - minValue) + minValue;
}

float** generateRandomPopulation(size_t chromosomeSize, size_t populationSize)
{
	float** population = new float*[populationSize];
	for (size_t i = 0; i < populationSize; i++)
	{
		population[i] = new float[chromosomeSize];
		population[i][0] = getRandomValue();
	}
	return population;
}

void mutate(float* chromosome, size_t index)
{
	chromosome[index] = getRandomValue();
}

float getFitness(float* chromosome)
{
	float x = chromosome[0];
	float value = 0;
	for (size_t i = 0; i < coefficients.size(); i++)
	{
		value += coefficients[i] * std::pow(x, coefficients.size() - i - 1);
	}
	return std::abs(value);
}

int main()
{
	std::cin >> minValue >> maxValue >> populationSize >> maxNumGenerations >> mutationChance >> crossoverRate;
	int numCoefficients;
	std::cin >> numCoefficients;
	for (int i = 0; i < numCoefficients; i++)
	{
		float coefficient;
		std::cin >> coefficient;
		coefficients.push_back(coefficient);
	}
	srand(time(0));
	float** solutions = geneticAlgorithm(1, populationSize, maxNumGenerations, crossoverRate, mutationChance, 
		&generateRandomPopulation, &getFitness, &mutate, false);
	std::map<float, float*> orderedSolutions;
	for (size_t i = 0; i < populationSize; i++)
	{
		orderedSolutions[getFitness(solutions[i])] = solutions[i];
	}
	int count = 0;
	for (std::map<float, float*>::iterator it = orderedSolutions.begin(); it != orderedSolutions.end(); ++it)
	{
		if (++count > 10) break;
		std::cout << "#" << count << " x = " << it->second[0] << " (fitness = " << it->first << ")" << std::endl;
	}
	clear(solutions, populationSize);
	return 0;
}
```
</div>
</center>

Let's make some simple experiments. For example, for the input: ```-100 100 100 1000 0.05 0.5 2 1 0``` representating the polynomial equation x = 0, we get values similar to that:

```

#1 x = 0.749847 (fitness = 0.749847)
#2 x = -1.20491 (fitness = 1.20491)
#3 x = -5.58772 (fitness = 5.58772)
#4 x = -13.276 (fitness = 13.276)
#5 x = -13.3722 (fitness = 13.3722)
#6 x = -15.1434 (fitness = 15.1434)
#7 x = 15.5566 (fitness = 15.5566)
#8 x = -18.8777 (fitness = 18.8777)
#9 x = 34.1902 (fitness = 34.1902)
#10 x = -35.9019 (fitness = 35.9019)

```

As you can notice, the values are approximating to zero, which is, indeed, the solution for this equation.

Let's try a harder example. For the input: ```-100 100 100 1000 0.05 0.5 3 1 30 2``` representating the polynomial equation x^2 + 30x + 2 = 0, we get values similar to that:

```

#1 x = -31.4706 (fitness = 48.2811)
#2 x = -1.91303 (fitness = 51.7313)
#3 x = -31.9963 (fitness = 65.8752)
#4 x = -3.68965 (fitness = 95.076)
#5 x = -4.05705 (fitness = 103.252)
#6 x = -33.503 (fitness = 119.36)
#7 x = 3.54279 (fitness = 120.835)
#8 x = -8.37109 (fitness = 179.057)
#9 x = -9.4042 (fitness = 191.687)
#10 x = -36.7524 (fitness = 250.166)

```

Where the real solution is ```x' ~= -0.066``` and ```x'' ~= -29.933``` (make the calculations). As you can notice, it tried to approximate both roots, through the values -31.4706 and -1.913. That's already an impressive fact, indeed. 

## Conclusion
Wow! This tutorial was longer than I expected. Here we learnt about i) Genetic Algorithms ii) Implementation of Genetic Algorithms on C++ iii) Use of a TBB element, the parallel for, to speed up our algorithm iv) A pratical example using Genetic Algorithm. That's a lot of things! I really hope you guys had enjoyed as much as I had writing this tutorial. See you on next tutorial! ;)
