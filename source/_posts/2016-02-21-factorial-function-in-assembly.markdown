---
layout: post
title: "Factorial function in x86_64 Assembly"
date: 2016-02-21 17:08:47 -0300
comments: true
categories: [assembly] 
---
Lately I've been reading the book [Programming from the Ground Up](http://download-mirror.savannah.gnu.org/releases/pgubook/ProgrammingGroundUp-1-0-booksize.pdf) by Jonathan Barlett. It teaches x86 assembly language programming from the very grounding blocks. Applying the concepts learnt in the book, I'll show you how to write a factorial function in x86_64 Assembly.
<!-- more -->
There are many assembly languages: Intel, AT&T, NASM, etc,... In this tutorial, I'm going to use the AT&T syntax, which can be easily assembled in any linux machine through the GNU Assembler (GAS).

Let's start by creating a file named ```main.s``` ('s' is the standard extension for assembly programs). 

Every assembly program is composed by three sections: **data**, **bss** and **text**. The **data** section is used to initialize constants. Those constants are preallocated during the program initialization. The **bss** section is used to declare buffers, or dynamically allocated data. Finally, the **text** section is used to keep the actual code. None of them are mandatory, but it's a good pratice to define them explicitally.

```as main.s
.section .text
```
> The "." indicates that the instruction is a directive to the assembler (just like # in C is a directive to the compiler). 

In order to execute your program, the operating system needs to know where's the start of your program (like a "main" function). In Assembly, this is accomplished through the ```_start``` label. 

```as main.s
.globl _start
.section .text
_start:
```

A **label** is just a placeholder for a memory position. On [Von Neumann architecture](https://en.wikipedia.org/wiki/Von_Neumann_architecture) (which is the architecture used by most of modern computers), code is actually kept on memory along with the data that it manipulates. For the processor, there's absolutely no distinction into code and data. In the above example, the label would exercise the function of pointing to a 'code line' (This is a oversimplification).

You must have noticed the use of ```globl``` directive. It's used to make a symbol visible to the linker. We'll talk about it later, just be informed that it's mandatory to the _start label.

Alright! Now let's make our program just exit in order to obtain a basic executable program.

```as main.s
.globl _start
.section .text
_start:
	mov $1, %rax
	mov $0, %rbx
	int $0x80
```

The ```rax``` and ```rbx``` are both [general purporse registers](https://en.wikipedia.org/wiki/Processor_register). The ```int``` instruction is a **interruption**. When we use the 0x80 code, we are saying that this interruption must be handled by the linux operating system. In another words, we are performing a [system call](https://en.wikipedia.org/wiki/System_call). The code of the system call is stored in the ```rax``` register. The ```1``` is the code for the **exit** system call. The **exit** system call takes one parameter, the return value, which is stored in the ```rbx``` register. In this case, we are returning the value ```0```. By the way, the ```$``` is used to indicate constant values. If we omit it, it would be interpreted as a memory address instead.

In C, the code we just typed would be equivalent to:
```c main.c
int main() 
{
	return 0;
}
```

You can turn it into a executable code by calling:
```bash
as main.s -o main.o
ld main.o -o main
./main
```

But a program like that is of no use, right? So let's create our factorial function. Functions in assembly are a kind of a headache, because you need to explicitally manipulate the stack.

## The stack
**Stack** is a contiguous region of memory reserved for the program by the operating system. 

![](https://www.cs.umd.edu/class/sum2003/cmsc311/Notes/Mips/Figs/stack1.png)

There's a special register called ```rsp``` (stack pointer) that points to the 'top' of the stack. So how do we store things in the stack? By simply using ```mov``` instruction and manipulating the stack pointer. For example, let's suppose we want to store two values in the stack, ```1```  and ```2```. It could be accomplished that way: 

```as
sub $16, %rsp
mov $1, %rax
mov $2, %rbx
mov %rax, 16(%rsp)
mov %rbx, 8(%rsp)
```

Stack is a structure that grows upward, in the sense of it first begins with addresses of higher values and grows towards addresses of lower values. In the above example, we are using **8** bytes of the stack to store the value ```1``` and equally 8 bytes to store the value ```2```, so we need to step down the stack pointer by a value of 16 (we use 8 bytes because on x64 architecture, the registers have 8 bytes. 8 x 8 = 64 bits).

Since manipulating the stack pointer directly is boring, there are two special instructions to accomplish the same effect: ```push``` and ```pop```. ```push``` subtracts the stack pointer by 8 and stores the parameter into the current address pointed by the stack pointer. ```pop``` moves the data stored in the address currently pointed by the stack pointer to a register and adds the stack pointer by 8.  
## Recursive factorial function
Create a file named ```factorial.s```. Insert the following code:

```as factorial.s
.globl factorial
.type factorial,@function
factorial:
	
```

We use the ```globl``` directive because we want the **factorial** label to be visible to other programs (we want to use the function in other programs). Here's the first trick: "Calling" a function is simply jumping to the memory address where this function is defined. 

The new thing here is the ```type``` directive. Don't worry, it's just a directive to indicate that the label is not a common label but actually a function. 

Now let's go back to our main program and call this function:

```as main.s
.globl _start
.section .text
_start:
	push $5
	call factorial
	add $8, %rsp
	mov %rax, %rbx
	mov $1, %rax
	int $0x80
```

This may seem complicated at the first glance, but it's rather simple. We first store the value ```5``` in the stack. Since we cannot pass arguments directly while calling the function like in other languages, we need to store the arguments in the stack. In this case, 5 will be first the argument for the ```factorial``` function: The number we want to calculate the factorial. 

After that, we use the ```call``` instruction. What the ```call``` instruction actually does is just storing the current address into the stack pointer (because we need to know to where return after the function has been finished!) and jumping to the ```factorial``` label.

Finally, we increase the stack pointer (because we no longer need the function parameters stored in the stack, we can safely override them to prevent *memory leaks*) and move the function return (the function return is, by convenction, always stored in the ```rax``` register) to the ```rbx``` so we can display it after the program has been executed (through the echo $? command).

Our main program is finished. It's roughly equivalent to the following C program:

```c main.c
int factorial(int);
int main()
{
	return factorial(5);
}
```

Now let's focus on our factorial function.
The very first thing we need to do in a function is to store the ```rbp``` register. ```rbp``` is the base pointer register. It points to the beginning of the current **stack frame**. Stack frame is the region of stack where we stored our function parameters and function return address. Since we can call functions inside functions, we need to store the 'context' of the previous function call (if any).

```as factorial.s
.globl factorial
.type factorial,@function
factorial:
	push %rbp
	mov %rsp, %rbp
```

We move the current stack pointer to the ```rbp``` register. Now we are within the context of the current function. Let's retrieve the arguments:

```as factorial.s
.globl factorial
.type factorial,@function
factorial:
	push %rbp
	mov %rsp, %rbp
	mov 16(%rbp), %rbx # Get the first parameter
```

Remember: We use ```rbp + 16``` because we pushed the parameter value into the stack first (the second pushed value was the function return address, therefore it stands on top).

Since we are implementing the recursive version, we first need to define the recursion base: If the parameter value is less or equal than 1, return 1.

```as factorial.s
.globl factorial
.type factorial,@function
factorial:
	push %rbp
	mov %rsp, %rbp
	mov 16(%rbp), %rbx # Get the first parameter
	# Check recursion base
	cmp $1, %rbx
	je factorial_base
factorial_base:
	# Return value 1
	mov $1, %rax
factorial_end:
	# Restore pointer
	mov %rbp, %rsp
	pop %rbp # Restore context
	ret # Return 
```

Wow, a lot of things happened here! Let's calmly analyze each one of them. First, we compare the parameter value to one (through the ```cmp``` instruction). Then, we check if the parameter value is equal than one. If so, we jump to the ```factorial_base``` label. This **conditional jump** is accomplished by the ```je``` instruction (jump on equal). The ```cmp``` instruction sets a flag on ```flags``` register, which the **conditional jump** will look up to decide if it will jump or not.

Once within the ```factorial_base``` label, we move the value ```1``` into the ```rax``` register. The ```rax``` will store the final value of our calculation. The program flow will then move automatically to the label right below, ```factorial_end```.  

The ```factorial_end``` label will restore the stack pointer to where it was when the function was called (in case we have manipulated it inside the function body, which we didn't, but it's a good pratice to keep our code generic) and will then restore the base pointer register. Finally, there's this ```ret``` instruction, which will return to the value currently pointed by the stack pointer (the function return address).

Now let's implement the recursive calls:

```as factorial.s
.globl factorial
.type factorial,@function
factorial:
	push %rbp
	mov %rsp, %rbp
	mov 16(%rbp), %rbx # Get the first parameter
	# Check recursion base
	cmp $1, %rbx
	je factorial_base
	# Decrease the value of parameter
	dec %rbx
	# Call factorial recursively
	push %rbx
	call factorial
	add $8, %rsp
	# Multiply the current parameter by the recursive call return value
	mov 16(%rbp), %rbx
	imul %rbx, %rax
	# Finish function
	jmp factorial_end
factorial_base:
	# Return value 1
	mov $1, %rax
factorial_end:
	# Restore pointer
	mov %rbp, %rsp
	pop %rbp # Restore context
	ret # Return
```

After we checked our recursion base condition (and failed), we decremented the value of the parameter in order to pass it as argument to the same function again (through the ```decl``` instruction). The way of calling the same function is identical to the code we wrote on our main program: We push the arguments into the stack and call the ```call``` instruction. 

Once the recursive function has been finished, its return value is stored in the ```rax``` register. Before multiplying the current parameter by the return value of the recursive call, we first need to restore its original value (remember: When we made recursive call, it was overrided). We accomplish it by calling: ```mov 16(%rbp), %rbx```. We then multiply the value of ```rbx``` by ```rax``` and store the result in ```rax``` through the ```imul``` instruction. After it, we jump to the end of our function (```factorial_end```).

That's it! Not that hard, right? Take of time to ensure you have understood every piece of our code.

The above code is roughly equivalent to the following C code:
```c factorial.c
int factorial(int n)
{
	if (n == 1) return 1;
	return n * factorial(n - 1);
}
```

hehe, Assembly is such a pain. :)

## Generating executable code
Now let's generate our executable code. First, let's generate [object code](https://en.wikipedia.org/wiki/Object_code) from our both assembly programs:

```bash 
as main.s -o main.o
as factorial.s -o factorial.o 
``` 

Let's link our two object codes into a single executable code:

```bash
ld main.o factorial.o -o main
```

Now execute:
```bash
./main
```

We can check our program return by calling:

```bash
echo $?
```

A value of ```120``` must have prompted, that is the factorial of 5.

It's worth noting that if we omit the ```.globl factorial``` in ```factorial.s```, the linker would prompt an error, since it cannot resolve the symbol.

## Iterative factorial function
The factorial function can also be implemented in a single loop. Observe the following C code:

```c iterative_factorial.c
int factorial(int n)
{
	int i = n - 1;
	while (i > 1)
	{
		n *= i;
		i--;
	}
	return n;
}
```

Since the program is bigger in C than the previous version, we may think that it would be even more complex in Assembly than the previous Assembly program. However, it's actually simpler:

```as iterative_factorial.s
.section .text
.globl factorial
.type factorial, @function
factorial:
        push %rbp
        mov %rsp, %rbp
        mov 16(%rsp), %rax
        mov %rax, %rbx
        dec %rbx
        jmp factorial_loop
factorial_loop:
        cmp $1, %rbx
        je factorial_end
        imul %rbx, %rax
        dec %rbx
        jmp factorial_loop
factorial_end:
        mov %rbp, %rsp
        pop %rbp
        ret
``` 

We copy the parameter value to the ```rbx``` register. It will exercise the same function of the ```i``` variable in the C code. We then decrease the value of i and then jump to the loop. 

On our loop, we compare the value of ```rbx``` (i) to one. If it's equal, we exit our loop. Otherwise, we multiply ```rbx``` by ```rax``` and store the result in ```rax```. In the end, we return to the beginning of our loop. 

## Conclusion
Well, well... We learnt important Assembly concepts in this tutorial: System calls, the stack, functions... It's a lot! You already are able to implement some other simple algorithms (try Fibonacci!). 
