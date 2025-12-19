import type { Lesson } from '../../types';

export const pythonLessons: Lesson[] = [
    // =====================================================
    // PYTHON - TIER 1: SEEDLING (Complete Beginner)
    // =====================================================
    {
        id: 'py-t1-hello',
        title: 'Hello, World!',
        description: 'Write your very first Python program and understand how computers execute code.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'welcome',
                type: 'text',
                title: 'Welcome to Programming!',
                content: `Welcome to the world of programming! 

In this first lesson, you will write your very first program. Don't worry, we'll start from the absolute basics.

Your journey to becoming a Software Engineer starts here.`
            },
            {
                id: 'what-is-programming',
                type: 'text',
                title: 'What is Programming?',
                content: `Before we start coding, let's understand the basic concept.

Programming is essentially just how we **"speak"** to a computer.

Just like humans have languages (English, Spanish), computers also have languages. We write instructions in a language the computer understands, and the computer obediently executes those instructions.`
            },
            {
                id: 'why-python',
                type: 'text',
                title: 'Why Python?',
                content: `In this course, we use the **Python** language.
                
Python is a very popular and beginner-friendly language because:
- Its syntax is simple (similar to English)
- No complicated setup required
- It's widely used in big companies (Google, NASA, Netflix)`
            },
            {
                id: 'concept',
                type: 'text',
                title: 'Concept: print()',
                content: `Every journey starts with a single step. In programming, the first step is usually to display text on the screen.
                
In Python, we use a function called \`print()\`.

**Imagine this:**
You tell a robot to "say something".
In Python, the command is: \`print("something")\``
            },
            {
                id: 'anatomy',
                type: 'text',
                title: 'Code Anatomy',
                content: `Let's look at the anatomy of the \`print\` command:

\`\`\`
print("text you want to display")
\`\`\`

**The Rules:**
1. \`print\` is the command keyword.
2. Parentheses \`(...)\` are where we put the "message content".
3. Quotes \`"..."\` tell the computer that this is Text, not a command.

If you forget the quotes, the computer will get confused!`
            },
            {
                id: 'examples',
                type: 'text',
                title: 'Real Examples',
                content: `Here are some examples of correct usage:

**Greeting the World:**
\`\`\`python
print("Hello, World!")
\`\`\`
Output: \`Hello, World!\`

**Stating a Fact:**
\`\`\`python
print("Python is fun")
\`\`\`
Output: \`Python is fun\`

**Cat Sound:**
\`\`\`python
print("Meow!")
\`\`\`
Output: \`Meow!\``
            },
            {
                id: 'guided-practice',
                type: 'code',
                title: 'Your Turn!',
                content: `Now it's your turn to try it yourself.
                
Your first task: Write code to display **"Hello, World!"** on the screen.

**Checklist:**
- [ ] Type \`print\`
- [ ] Open parenthesis \`(\`
- [ ] Open quote \`"\`
- [ ] Write **Hello, World!**
- [ ] Close quote \`"\`
- [ ] Close parenthesis \`)\`

The code is already prepared, try clicking **Run Code** to see the result!`,
                codeTemplate: 'print("Hello, World!")',

                hints: ['Make sure to use double quotes (" ")', 'Pay attention to upper/lower case']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Final Challenge',
                content: `Amazing! You've run your first program.

Final challenge before moving to the next chapter:
**Change the code to greet yourself!**

Example: \`print("Hello, Budi!")\``,
                codeTemplate: 'print("Hello, ...")',
                hints: ['Replace the text inside the quotes with your name']
            }
        ],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'py-t1-variables',
        title: 'Variables: Storing Data',
        description: 'Learn how to store and use data with variables.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a Variable?',
                content: `Imagine a variable like a **box** with a name label.

Inside this box, you can store various things (data).
- A box labeled "name" can store the text "Budi".
- A box labeled "age" can store the number 17.

In programming, a variable is the most basic concept for storing information.`
            },
            {
                id: 'why-vars',
                type: 'text',
                title: 'Why are Variables Important?',
                content: `Why not just write the data directly?

Variables make your code:
1.  **Flexible**: You can change the box contents without changing other code.
2.  **Readable**: \`area = l * w\` is easier to understand than \`50 = 10 * 5\`.
3.  **Reusable**: The data stored can be called multiple times.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'How to Create Variables',
                content: `In Python, creating a variable is very simple. You don't need to "declare" the data type (like in C++ or Java).

Just write the variable name, an equal sign, and then the value.

**Formula:**
\`variable_name = value\`

**Example:**
\`\`\`python
name = "Budi"
age = 17
height = 170.5
\`\`\``
            },
            {
                id: 'naming-rules',
                type: 'text',
                title: 'Naming Rules',
                content: `You can't just name variables whatever you want. There are rules:

**Allowed:**
-   Letters (a-z, A-Z)
-   Numbers (0-9)
-   Underscore (_)

**Not Allowed:**
-   Starts with a number (Wrong: \`1name\`)
-   Contains spaces (Wrong: \`my name\`)
-   Uses Python keywords (like \`print\`, \`if\`, \`for\`)

**Tip:** Use **snake_case** (all lowercase separated by underscores) for readability. Example: \`full_name\`.`
            },
            {
                id: 'examples',
                type: 'text',
                title: 'Usage Examples',
                content: `See how we use variables in real code.

**Example 1: Greeting with a Name**
\`\`\`python
name = "Sarah"
print(name)
\`\`\`
Output: \`Sarah\`

**Example 2: Combining with Text**
\`\`\`python
name = "Andy"
print("Hello, " + name)
\`\`\`
Output: \`Hello, Andy\``
            },
            {
                id: 'guided',
                type: 'code',
                title: 'Try It Yourself',
                content: `Now it's your turn.

Task:
1.  Create a variable named \`animal_name\`
2.  Fill it with your favorite animal (e.g., "Cat")
3.  Display the contents of that variable.

The base code is ready.`,
                codeTemplate: 'animal_name = "..."\nprint(animal_name)',

                hints: ['Fill in the dots with text', 'Don\'t forget quotes for text']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Variable Challenge',
                content: `Let's create a short introduction program.

Create two variables:
1.  \`name\` containing your name
2.  \`hobby\` containing your hobby

Then print both of them.

Example Output:
\`Alice\`
\`Fishing\``,
                codeTemplate: 'name = "..."\nhobby = "..."\n\nprint(name)\nprint(hobby)',
                hints: ['Create one variable per line', 'Use separate print statements for each variable']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },
    {
        id: 'py-t1-datatypes',
        title: 'Basic Data Types',
        description: 'Learn the difference between text, whole numbers, and decimal numbers.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Types of Data',
                content: `Computers distinguish data based on their type. You can't add "Hello" + 10, right?

In Python, there are 3 basic data types you must know right now:
1.  **String** (Text)
2.  **Integer** (Whole Numbers)
3.  **Float** (Decimal Numbers)`
            },
            {
                id: 'string',
                type: 'text',
                title: 'String (Text)',
                content: `String is a collection of characters or text. It is always enclosed in **quotes** (either single \`'\` or double \`"\`).

**Examples:**
\`"Hello World"\`
\`'Python is cool'\`
\`"12345"\` (This is still considered text because it has quotes!)`
            },
            {
                id: 'number',
                type: 'text',
                title: 'Integer & Float (Numbers)',
                content: `For numbers, we have two types:

**1. Integer (int)**
Whole numbers without decimals. Can be positive or negative.
Example: \`10\`, \`0\`, \`-5\`, \`1000\`

**2. Float**
Decimal numbers. In programming, we use a **dot** \`.\` not a comma.
Example: \`3.14\`, \`2.5\`, \`-0.01\``
            },
            {
                id: 'check-type',
                type: 'text',
                title: 'Checking Data Types',
                content: `Sometimes we wonder, "what type of data is this?".

Python has a helper tool called \`type()\`.

\`\`\`python
print(type("Hello"))
print(type(17))
\`\`\`

Output:
\`<class 'str'>\` (means String)
\`<class 'int'>\` (means Integer)`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Data Type Experiment',
                content: `Let's see the difference between String and Integer when adding them.

The code below will error if you add a string to an integer directly.

Task:
1. Fix the variable \`num_two\` so it becomes an integer (remove the quotes).
2. Run the code.`,
                codeTemplate: 'num_one = 5\nnum_two = "10" # Remove these quotes!\n\nresult = num_one + num_two\nprint(result)',

                hints: ['Remove the quotes around number 10', 'Integers do not use quotes']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Bio Challenge',
                content: `Create 3 variables with the correct data types to store this bio:

1.  \`name\` (String): Fill with "CatCoder"
2.  \`level\` (Integer): Fill with 1
3.  \`rating\` (Float): Fill with 5.0

Then print all three in order.`,
                codeTemplate: '# Write your code here\n',
                hints: ['String uses quotes, number does not', 'Float uses a dot']
            },
        ],
        xpReward: 75,
        estimatedTime: 12
    },
    {
        id: 'py-t1-math',
        title: 'Math & Numbers',
        description: 'Master Python\'s calculator powers: arithmetic, powers, and remainders.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Python as a Calculator',
                content: `Python is amazing at math. You can use it like a super-powered calculator.

Basic Operators:
- \`+\` Addition
- \`-\` Subtraction
- \`*\` Multiplication
- \`/\` Division

Example:
\`\`\`python
print(10 + 5) # 15
print(10 * 2) # 20
\`\`\``
            },
            {
                id: 'division',
                type: 'text',
                title: 'Types of Division',
                content: `Division in Python is special.

1. **Float Division (\`/\`)**: Always returns a decimal.
   \`10 / 2\` -> \`5.0\`
   \`5 / 2\` -> \`2.5\`

2. **Integer Division (\`//\`):** Rounds DOWN to the nearest whole number.
   \`10 // 3\` -> \`3\` (because 3.333...)
   \`5 // 2\` -> \`2\``
            },
            {
                id: 'modulo',
                type: 'text',
                title: 'Modulo (%) - Remainder',
                content: `This symbol \`%\` doesn't mean percent! It means **Remainder**.

It gives you what's left over after division.

Examples:
- \`10 % 3\` -> \`1\` (10 divided by 3 is 3, remainder 1)
- \`14 % 5\` -> \`4\` (5 x 2 = 10, left with 4)
- \`8 % 2\` -> \`0\` (Perfectly divisible)

**Pro Tip:** This is super useful to check if a number is Even or Odd!
(If \`num % 2 == 0\`, it's even).`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Math Practice',
                content: `Calculate the area of a rectangle with:
- \`length\` = 10
- \`width\` = 5

Create a variable \`area\` that multiplies them.`,
                codeTemplate: 'length = 10\nwidth = 5\n\n# Calculate area\narea = ...\n\nprint(area)',
                hints: ['Use the * symbol for multiplication']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Even or Odd?',
                content: `Let's use the Modulo operator!

1. Create a variable \`number\` with value 15.
2. Create a variable \`remainder\` that stores the result of \`number % 2\`.
3. Print the \`remainder\`.`,
                codeTemplate: 'number = 15\n\n# Calculate remainder\nremainder = ...\n\nprint(remainder)',
                hints: ['Use % 2']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },
    {
        id: 'py-t1-input',
        title: 'Input: Receiving User Input',
        description: 'Create interactive programs that accept input from users.',
        tier: 1,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Two-Way Communication',
                content: `So far, our program only "talks" to itself (output).
                
To make it more fun, the program needs to "listen" (input) from the user.
Imagine a chat bot:
Bot: "What is your name?"
You: "Buddy"
Bot: "Hello Buddy!"`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'The input() Function',
                content: `We use the \`input()\` function to request data.

**Syntax:**
\`\`\`python
variable_name = input("Question message for user")
\`\`\`

The program will **pause** and wait for the user to type something and press Enter.`
            },
            {
                id: 'example',
                type: 'text',
                title: 'Simple Example',
                content: `Let's see a greeting program code.

\`\`\`python
name = input("What is your name? ")
print("Hello " + name)
\`\`\`

When executed:
1. "What is your name? " appears
2. User types "Andy"
3. Variable \`name\` now contains "Andy"
4. Print displays "Hello Andy"`
            },
            {
                id: 'important',
                type: 'text',
                title: 'Important: Input is Always String',
                content: `Here is a golden rule beginners often forget:
**Anything typed by the user in input() is considered TEXT (String).**

Even if the user types the number \`100\`, Python considers it as text \`"100"\`.

If you want to do math with it, you must convert it to a number first.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Input Simulation',
                content: `Since this is a text editor, we can't do interactive input directly. We will simulate it.

Task:
Use variables to combine the greeting words.`,
                codeTemplate: 'name = "Programmer"\nmessage = "Keep learning, " + name\nprint(message)',

                hints: ['Use the + operator to join strings']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Chatbot Challenge',
                content: `Create a simple chatbot program.

1.  Create a variable \`name\` filled with your name.
2.  Create a variable \`food\` filled with your favorite food.
3.  Print the sentence: "Hello [name], I know you like [food]"

Use string concatenation (+)`,
                codeTemplate: 'name = "..."\nfood = "..."\n\n# Combine and print here',
                hints: ['Example: print("Hello " + name + "...")']
            },
        ],
        xpReward: 75,
        estimatedTime: 15
    },

    // =====================================================
    // PYTHON - TIER 2: SPROUT (Basic Control Flow)
    // =====================================================
    {
        id: 'py-t2-conditionals',
        title: 'Conditionals: If/Else',
        description: 'Create programs that can make decisions based on conditions.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Making Decisions',
                content: `In real life, we often make decisions:
-   **If** it rains, bring an umbrella.
-   **If** exam score >= 75, pass. **Else**, remedial.

Computer programs need this ability too. In Python, we use Branching with \`if\`, \`elif\`, and \`else\`.`
            },
            {
                id: 'syntax-if',
                type: 'text',
                title: 'Basic Concept: If',
                content: `Let's start with the simplest one: \`if\`.

The code inside the \`if\` block will only run **IF** the condition is True.

**Syntax:**
\`\`\`python
if condition:
    do_something()
\`\`\`

**Example:**
\`\`\`python
score = 80
if score > 75:
    print("Congrats, you passed!")
\`\`\`
Since 80 > 75, the message will appear.`
            },
            {
                id: 'syntax-else',
                type: 'text',
                title: 'Multiple Choice: Else',
                content: `What if the condition is false? We use \`else\`.

\`\`\`python
score = 50
if score > 75:
    print("Passed")
else:
    print("Not passed yet")
\`\`\`
Since 50 is not greater than 75, the program will jump to the \`else\` part.`
            },
            {
                id: 'operators',
                type: 'text',
                title: 'Comparison Operators',
                content: `To create conditions, use these symbols:

-   \`==\` (Equal to) <- Careful, different from \`=\`
-   \`!=\` (Not equal to)
-   \`>\` (Greater than)
-   \`<\` (Less than)
-   \`>=\` (Greater than or equal to)
-   \`<=\` (Less than or equal to)`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Check Positive Number',
                content: `Try making a simple logic to check if a number is positive or negative.

Task:
Complete the code to check if \`number\` is less than 0.`,
                codeTemplate: 'number = -5\n\nif number > 0:\n    print("Positive")\nelif number < 0:\n    # Write your code here\n    print("Negative")',

                hints: ['Use elif number < 0:', 'Don\'t forget the colon (:)']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Driver License Challenge',
                content: `Create an age verification system for a Driver's License.

1.  Create a variable \`age\`.
2.  If \`age\` >= 17, print "Eligible for license".
3.  Else, print "Not old enough".

Try setting \`age\` to 16 to see the result.`,
                codeTemplate: 'age = 16\n# Write if/else logic here\n',
                hints: ['Use if age >= 17:', 'Use else: for other conditions']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'py-t2-loops-for',
        title: 'Loops: For Loop',
        description: 'Run code repeatedly with for loops.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Why do we need Loops?',
                content: `Imagine if you had to displayed the text "I will not be late again" 100 times.

Tiring to type manually, right?
\`\`\`python
print("I will not be late again")
print("I will not be late again")
# ... 98 more lines ...
\`\`\`

Programmers are lazy (in a good way), so we use **Loops** to repeat it automatically!`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Concept: for loop',
                content: `In Python, a \`for\` loop is used to repeat code a specified number of times.

We usually use the \`range(n)\` function to create a sequence of numbers.

**Example:**
\`\`\`python
for i in range(5):
    print("Hello")
\`\`\`
The code above will display "Hello" 5 times (0 to 4).`
            },
            {
                id: 'range-detail',
                type: 'text',
                title: 'Understanding range()',
                content: `The \`range()\` function is unique.

-   \`range(5)\` = 0, 1, 2, 3, 4 (5 numbers, starting from 0)
-   \`range(1, 4)\` = 1, 2, 3 (start from 1, stop BEFORE 4)

**Important:** The upper limit (second number) is never included.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Countdown',
                content: `We can use range with a backward step.

Task: Explore the code below and try running it.`,
                codeTemplate: 'print("Start countdown...")\nfor i in range(3, 0, -1):\n    print(i)\nprint("Liftoff!")',

                hints: ['The third parameter of range is "step"', '-1 means backward']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Multiples Challenge',
                content: `Display multiples of 5 from 5 to 25.
(Result: 5, 10, 15, 20, 25)

Tips: Use \`range(start, stop, step)\`. Remember, *stop* is excluded, so you might need the number 26?`,
                codeTemplate: '# Use for loop and range here\n',
                hints: ['range(5, 26, 5)', 'start=5, stop=26, step=5']
            }
        ],
        xpReward: 125,
        estimatedTime: 20
    },
    {
        id: 'py-t2-loops-while',
        title: 'Loops: While Loop',
        description: 'Repeat code as long as a condition is true.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'The While Loop',
                content: `Unlike \`for\` loops which run a specific number of times, \`while\` loops run **as long as** a condition is True.
                
Think of it like: "While it is raining, keep using the umbrella."`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Syntax',
                content: `\`\`\`python
while condition:
    # do something
\`\`\`

**Example:**
\`\`\`python
battery = 10
while battery > 0:
    print("Phone is on")
    battery = battery - 1
\`\`\``
            },
            {
                id: 'infinite',
                type: 'text',
                title: 'Warning: Infinite Loops',
                content: `Be careful! If the condition NEVER becomes False, the loop will run forever and freeze your program.

\`\`\`python
# DON'T DO THIS
while True:
    print("Forever...")
\`\`\`

Always ensure there's a line of code that changes the condition (like \`battery = battery - 1\`).`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Guessing Game',
                content: `Simulate a guessing game loop.
Run the loop while \`guess\` is not equal to \`secret\`.`,
                codeTemplate: 'secret = 7\nguess = 0\n\nwhile guess != secret:\n    print("Wrong, try again")\n    guess = guess + 1 # Simulate user trying next number\n    \nprint("Correct!")',
                hints: ['Use != for not equal']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Countdown with While',
                content: `Create a countdown from 5 to 1 using a while loop.
1. Start with \`count = 5\`.
2. While \`count > 0\`:
   - Print \`count\`
   - Decrease \`count\` by 1.`,
                codeTemplate: 'count = 5\n\n# proper while loop here\n',
                hints: ['while count > 0:', 'count = count - 1']
            }
        ],
        xpReward: 125,
        estimatedTime: 15
    },
    {
        id: 'py-t2-lists',
        title: 'Lists (Arrays)',
        description: 'Organize data with Lists: create, access, and modify collections.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a List?',
                content: `Variables are great, but what if you have 100 students? 
Creating \`student1\`, \`student2\`, ..., \`student100\` is a nightmare.

Enter **Lists**.
A List is a container that can hold multiple values in a single variable.

Syntax: Square brackets \`[]\`.
\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]
scores = [90, 85, 88]
\`\`\``
            },
            {
                id: 'access',
                type: 'text',
                title: 'Accessing Items',
                content: `Each item in a list has an **Address** (Index).

**IMPORTANT:** Computers start counting from **0**.

\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]
#           0        1         2
\`\`\`

- \`fruits[0]\` is "Apple"
- \`fruits[1]\` is "Banana"
- \`fruits[2]\` is "Cherry"`
            },
            {
                id: 'methods',
                type: 'text',
                title: 'Changing Lists',
                content: `Lists are mutable (changeable).

**Adding Items:**
\`\`\`python
fruits.append("Durian") 
# Now fruits has ["Apple", "Banana", "Cherry", "Durian"]
\`\`\`

**Changing Items:**
\`\`\`python
fruits[0] = "Orange"
# Replaces "Apple" with "Orange"
\`\`\``
            },
            {
                id: 'len',
                type: 'text',
                title: 'List Length',
                content: `How many items are in the list?
Use \`len()\`.

\`\`\`python
print(len(fruits)) # Based on previous example, output might be 4
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'My Shopping List',
                content: `Task:
1. Create a list called \`shopping\` with 3 items: "Milk", "Bread", "Eggs".
2. Print the second item ("Bread").`,
                codeTemplate: 'shopping = ["Milk", "Bread", "Eggs"]\n\n# Print the second item (Index 1)\nprint(...)',
                hints: ['Use shopping[1]', 'Remember index starts at 0']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Inventory Manager',
                content: `You manage a game inventory.
1. Start with an empty list \`inventory = []\`.
2. Add "Sword" to it.
3. Add "Shield" to it.
4. Print the entire inventory.`,
                codeTemplate: 'inventory = []\n\n# Use .append()\n\nprint(inventory)',
                hints: ['inventory.append("Sword")', 'Do it twice']
            }
        ],
        xpReward: 125,
        estimatedTime: 20
    },
    {
        id: 'py-t2-functions',
        title: 'Functions: Reusable Code',
        description: 'Create blocks of code that can be called multiple times.',
        tier: 2,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a Function?',
                content: `A Function is a **named block of code**.

Think of it like a recipe. You write the recipe once (\`def\`), then you can cook it (\`call\`) anytime you want without remembering every detail step by step.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'How to Create a Function',
                content: `Use the keyword \`def\` (define).

**Syntax:**
\`\`\`python
def function_name():
    # code here
    print("Function executed")
\`\`\`

**How to Call:**
\`\`\`python
function_name()
\`\`\``
            },
            {
                id: 'parameters',
                type: 'text',
                title: 'Parameters (Input)',
                content: `Functions can accept data to be more flexible. This data is called **Parameters**.

\`\`\`python
def greet(name):
    print("Hello " + name)

greet("Andy")  # Output: Hello Andy
greet("Sarah")  # Output: Hello Sarah
\`\`\`

Here, \`name\` is a special variable whose content changes depending on what we send when calling the function.`
            },
            {
                id: 'return',
                type: 'text',
                title: 'Return (Output)',
                content: `Functions can also **return a value** using \`return\`.

What's the difference with print?
-   \`print\` only displays text on the screen.
-   \`return\` gives the value back to the program code, which can be stored in a variable.

\`\`\`python
def add(a, b):
    return a + b

result = add(5, 3)
print(result) # 8
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Function Practice',
                content: `Create a simple function named \`square\` that takes one number, and returns the square of it (power of two).`,
                codeTemplate: 'def square(number):\n    # Write your code here\n    return number ** 2\n\nprint(square(4))',

                hints: ['Use operator ** 2 for power of two']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Discount Challenge',
                content: `Create a function named \`calculate_discount\`.
1.  Accepts parameter \`price\`.
2.  Returns the price after 10% discount.

Formula: \`price - (price * 0.1)\`

Example: \`calculate_discount(10000)\` should return \`9000\`.`,
                codeTemplate: 'def calculate_discount(price):\n    # Return final price\n    return price - (price * 0.1)\n\nprint(calculate_discount(10000))',
                hints: ['Use return price * 0.9 or the formula above']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },

    // =====================================================
    // PYTHON - TIER 3: SAPLING (Data Structures)
    // =====================================================
    {
        id: 'py-t3-dictionaries',
        title: 'Dictionaries',
        description: 'Key-Value pairs: Store data like a real dictionary.',
        tier: 3,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a Dictionary?',
                content: `Lists are indexed by numbers (0, 1, 2...).
Dictionaries are indexed by **Keys** (usually text).

Think of a real dictionary:
- Key: "Apple"
- Value: "A red fruit..."

In Python, we use curly braces \`{}\` and colons \`:\`.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Creating a Dictionary',
                content: `\`\`\`python
user = {
    "name": "Budi",
    "age": 17,
    "city": "Jakarta"
}
\`\`\``
            },
            {
                id: 'access',
                type: 'text',
                title: 'Accessing Data',
                content: `Use the Key inside square brackets.

\`\`\`python
print(user["name"]) # Output: Budi
print(user["city"]) # Output: Jakarta
\`\`\``
            },
            {
                id: 'modify',
                type: 'text',
                title: 'Modifying Data',
                content: `\`\`\`python
# Change value
user["age"] = 18

# Add new key-value
user["hobby"] = "Coding"
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Phone Book',
                content: `Create a phone book dictionary.
- Key: "Mom", Value: "08123456"
- Key: "Dad", Value: "08987654"

Then print Dad's number.`,
                codeTemplate: 'phone_book = {\n    "Mom": "08123456",\n    "Dad": "..."\n}\n\n# Print Dad\'s number\nprint(...)',
                hints: ['phone_book["Dad"]']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Student Database',
                content: `1. Create dictionary \`student\`.
2. Add keys: "name" (your name), "score" (100).
3. Print: "Student [name] got [score]".`,
                codeTemplate: 'student = {}\n\n# Add keys\n\n# Print sentence',
                hints: ['student["name"] = "..."', 'Concatenate strings']
            }
        ],
        xpReward: 150,
        estimatedTime: 20
    },

    {
        id: 'py-t3-tuples',
        title: 'Tuples',
        description: 'Immutable lists: Learn to use data that should not change.',
        tier: 3,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a Tuple?',
                content: `A Tuple is like a List, but with one major difference:
                
**IT CANNOT BE CHANGED (Immutable).**

No adding, no removing, no modifying items.
Why? Because sometimes you want to guarantee data safety (like GPS coordinates that shouldn't change accidentally).`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Syntax',
                content: `Use parentheses \`()\`.

\`\`\`python
# List
my_list = [1, 2, 3]

# Tuple
my_tuple = (1, 2, 3)
\`\`\``
            },
            {
                id: 'unpacking',
                type: 'text',
                title: 'Tuple Unpacking',
                content: `This is a superpower of Tuples. You can extract values into variables instantly.

\`\`\`python
point = (10, 20)
x, y = point

print(x) # 10
print(y) # 20
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Coordinates',
                content: `Create a tuple named \`coords\` with values 5 and 10.
Then unpack it into \`x\` and \`y\`.`,
                codeTemplate: 'coords = (5, 10)\n\n# Unpack here\nx, y = ...\n\nprint("X:", x)\nprint("Y:", y)',
                hints: ['x, y = coords']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Swap Variables',
                content: `In other languages, swapping two variables requires a temporary "temp" variable.
In Python with tuples, it's one line!

Swap \`a\` and \`b\`.`,
                codeTemplate: 'a = 100\nb = 50\n\n# Swap using tuple unpacking syntax\na, b = ...\n\nprint("a:", a)\nprint("b:", b)',
                hints: ['a, b = b, a']
            }
        ],
        xpReward: 150,
        estimatedTime: 15
    },
    {
        id: 'py-t3-sets',
        title: 'Sets',
        description: 'Unique collections: Managing data without duplicates.',
        tier: 3,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is a Set?',
                content: `A Set is a collection of items that are **UNIQUE**.
                
If you try to add the same number twice, the Set will ignore the second one.
Perfect for tasks like "Find all unique visitors" or "List all colors used".`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Syntax',
                content: `Use curly braces \`{}\` like Dictionaries, but without keys/colons.

\`\`\`python
# Create directly
colors = {"Red", "Blue", "Red", "Green"}
print(colors) 
# Output might be: {'Red', 'Green', 'Blue'} 
# (Duplicate "Red" is gone!)
\`\`\``
            },
            {
                id: 'methods',
                type: 'text',
                title: 'Set Methods',
                content: `\`\`\`python
my_set = {1, 2, 3}

my_set.add(4)    # Add item
my_set.remove(2) # Remove item
\`\`\``
            },
            {
                id: 'mathematics',
                type: 'text',
                title: 'Math Operations',
                content: `Sets support Venn Diagram math!
- Union \`|\`: Combine both
- Intersection \`&\`: Only what's in BOTH`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Remove Duplicates',
                content: `You have a list with duplicates. Convert it to a set to clean it up.`,
                codeTemplate: 'dirty_list = [1, 2, 2, 3, 3, 3, 4]\nclean_set = set(dirty_list)\n\nprint(clean_set)',
                hints: ['Use set() function']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Common Interests',
                content: `Find hobbies that BOTH Alice and Bob like.
1. Create \`alice = {"Coding", "Music"}\`
2. Create \`bob = {"Music", "Gaming"}\`
3. Find intersection.`,
                codeTemplate: 'alice = {"Coding", "Music"}\nbob = {"Music", "Gaming"}\n\n# Find intersection\ncommon = ...\n\nprint(common)',
                hints: ['Use & operator']
            }
        ],
        xpReward: 150,
        estimatedTime: 15
    },
    {
        id: 'py-t3-strings',
        title: 'String Mastery',
        description: 'Advanced text manipulation: Slicing, formating, and methods.',
        tier: 3,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Strings are Powerful',
                content: `Text processing is 50% of a programmer's life.
Python has the BEST string tools in the world.`
            },
            {
                id: 'methods',
                type: 'text',
                title: 'Common Methods',
                content: `\`\`\`python
text = "  Hello Python  "

print(text.lower())      # "  hello python  "
print(text.upper())      # "  HELLO PYTHON  "
print(text.strip())      # "Hello Python" (Removes spaces)
print(text.replace("o", "a")) # "Hella Pythan"
\`\`\``
            },
            {
                id: 'slicing',
                type: 'text',
                title: 'Slicing',
                content: `Cut text like a ninja.
Syntax: \`text[start:stop]\`

\`\`\`python
code = "PYTHON"
print(code[0:2]) # "PY"
print(code[2:])  # "THON" (to the end)
print(code[::-1]) # "NOHTYP" (Reverse!)
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Format Input',
                content: `User typed "  budi  ". Clean it up to be "Budi".
1. Strip spaces.
2. Capitalize first letter (use \`.title()\`).`,
                codeTemplate: 'raw_input = "  budi  "\n\nclean = ...\n\nprint(clean)',
                hints: ['raw_input.strip().title()']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Secret Code',
                content: `Extract the word "Code" from "HiddenCodeHere".
It starts at index 6 and ends at index 10.`,
                codeTemplate: 'text = "HiddenCodeHere"\n\nsecret = ...\n\nprint(secret)',
                hints: ['Use slicing text[6:10]']
            }
        ],
        xpReward: 150,
        estimatedTime: 20
    },
    {
        id: 'py-t3-modules',
        title: 'Modules & Libraries',
        description: 'Don\'t reinvent the wheel: Import existing code.',
        tier: 3,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'The Power of Imports',
                content: `Python is famous for its "Standard Library".
Thousands of tools are ready for you to use. You just need to \`import\` them.`
            },
            {
                id: 'math',
                type: 'text',
                title: 'Math Module',
                content: `\`\`\`python
import math

print(math.pi)    # 3.14159...
print(math.sqrt(16)) # 4.0
\`\`\``
            },
            {
                id: 'random',
                type: 'text',
                title: 'Random Module',
                content: `Need to roll a dice?
\`\`\`python
import random

roll = random.randint(1, 6) # Random number 1-6
print(roll)
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Dice Roller',
                content: `Simulate rolling 2 dice.
Print the sum of both.`,
                codeTemplate: 'import random\n\ndice1 = random.randint(1, 6)\ndice2 = ...\n\nprint(dice1 + dice2)',
                hints: ['Call randint again for dice2']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Area of Circle',
                content: `Calculate area of circle with radius 5.
Formula: \`pi * r * r\`.
Use \`math.pi\`.`,
                codeTemplate: 'import math\nradius = 5\n\narea = ...\n\nprint(area)',
                hints: ['math.pi * radius ** 2']
            }
        ],
        xpReward: 150,
        estimatedTime: 15
    },

    // =====================================================
    // PYTHON - TIER 4: TREE (Advanced Concepts)
    // =====================================================
    {
        id: 'py-t4-errors',
        title: 'Error Handling',
        description: 'Writing safe code: try, except, and avoiding crashes.',
        tier: 4,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'When Things Go Wrong',
                content: `Programs crash. Users input text when you asked for numbers. Files are missing.
                
A good programmer anticipates this.
We use \`try\` and \`except\` to catch errors before they crash the program.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Try / Except',
                content: `\`\`\`python
try:
    # Dangerous code
    print(10 / 0)
except:
    # Backup plan
    print("You can't divide by zero!")
\`\`\`

If you run this, it won't show a scary red error. It will just print the proper message.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Safe Division',
                content: `Wrap the division in a try/except block so it doesn't crash.`,
                codeTemplate: 'num = 10\ndenom = 0\n\n# Wrap this in try/except\nresult = num / denom\nprint(result)',
                hints: ['Indent the division under try:', 'Add print("Error") under except:']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Number Validator',
                content: `Try to convert string "abc" to integer \`int("abc")\`.
It will crash.
Handle it to print "Not a number".`,
                codeTemplate: 'data = "abc"\n\n# try converting int(data)\n# except print warning',
                hints: ['try: x = int(data)', 'except: print("...")']
            }
        ],
        xpReward: 200,
        estimatedTime: 20
    },
    {
        id: 'py-t4-classes',
        title: 'Intro to OOP (Classes)',
        description: 'Object Oriented Programming: Modeling the real world.',
        tier: 4,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Blueprints (Classes)',
                content: `Imagine you are building a robot factory.
You need a Blueprint (**Class**).
From that blueprint, you can build thousands of Robots (**Objects**).`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Creating a Class',
                content: `\`\`\`python
class Robot:
    def __init__(self, name):
        self.name = name
        
    def say_hello(self):
        print("Hello, I am " + self.name)
\`\`\`

**Breakdown:**
- \`class Robot\`: The name of the blueprint.
- \`__init__\`: The constructor (runs when you create a new robot).
- \`self\`: Reters to "this specific robot".`
            },
            {
                id: 'objects',
                type: 'text',
                title: 'Creating Objects',
                content: `\`\`\`python
# Build robots
r1 = Robot("Wall-E")
r2 = Robot("R2D2")

r1.say_hello() # Hello, I am Wall-E
r2.say_hello() # Hello, I am R2D2
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Cat Class',
                content: `Create a \`Cat\` class.
1. \`__init__\` takes \`name\`.
2. \`meow\` method prints "Meow".
3. Create a cat named "Luna" and make it meow.`,
                codeTemplate: 'class Cat:\n    def __init__(self, name):\n        self.name = name\n        \n    def meow(self):\n        print("Meow")\n\nluna = Cat("Luna")\n# Call meow',
                hints: ['luna.meow()']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'RPG Character',
                content: `1. Create class \`Hero\`.
2. \`__init__\` sets \`self.hp = 100\`.
3. Method \`take_damage(amount)\` reduces hp.
4. Create hero, take 20 damage, print hp.`,
                codeTemplate: 'class Hero:\n    def __init__(self):\n        self.hp = 100\n    \n    def take_damage(self, amount):\n        # Reduce hp\n        pass\n\np1 = Hero()\np1.take_damage(20)\nprint(p1.hp)',
                hints: ['self.hp = self.hp - amount']
            }
        ],
        xpReward: 200,
        estimatedTime: 25
    },

    {
        id: 'py-t4-list-comprehensions',
        title: 'List Comprehensions',
        description: 'The Pythonic way to create lists in a single line.',
        tier: 4, // Keeping in Tier 4 as it fits with "Advanced"
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Compact Loops',
                content: `In other languages, creating a new list based on an existing one takes 3-4 lines.
In Python, we do it in **one line**.

This is called **List Comprehension**.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Syntax',
                content: `\`[expression for item in list]\`

**Old Way:**
\`\`\`python
squares = []
for x in range(5):
    squares.append(x**2)
\`\`\`

**New Way:**
\`\`\`python
squares = [x**2 for x in range(5)]
\`\`\`
Both produce \`[0, 1, 4, 9, 16]\`.`
            },
            {
                id: 'filtering',
                type: 'text',
                title: 'Filtering',
                content: `You can even add an \`if\` condition!

\`[x for x in numbers if x > 10]\`

Example:
\`\`\`python
# Get only even numbers
evens = [x for x in range(10) if x % 2 == 0]
# Result: [0, 2, 4, 6, 8]
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Make it Upper',
                content: `You have a list of words. Create a new list \`loud_words\` where everything is UPPERCASE using list comprehension.`,
                codeTemplate: 'words = ["hello", "world", "python"]\n\n# Use list comprehension\nloud_words = [...]\n\nprint(loud_words)',
                hints: ['[w.upper() for w in words]']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Filter Short Names',
                content: `Create a list \`long_names\` that only contains names with more than 3 letters.`,
                codeTemplate: 'names = ["Bo", "Ali", "Sara", "Tom", "Jerry"]\n\nlong_names = ...\n\nprint(long_names)',
                hints: ['[n for n in names if len(n) > 3]']
            }
        ],
        xpReward: 200,
        estimatedTime: 15
    },
    {
        id: 'py-t4-lambdas',
        title: 'Lambdas (Anonymous Functions)',
        description: 'Create small, one-time use functions on the fly.',
        tier: 4,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Nameless Functions',
                content: `Sometimes you need a tiny function for just one moment.
You don't want to use \`def\` and give it a name.

Use \`lambda\`.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Syntax',
                content: `\`lambda input: output\`

Example:
\`\`\`python
double = lambda x: x * 2

print(double(5)) # 10
\`\`\`

It is exactly the same as:
\`\`\`python
def double(x):
    return x * 2
\`\`\``
            },
            {
                id: 'usage',
                type: 'text',
                title: 'Why use this?',
                content: `Lambdas are powerful when combined with functions like \`map()\` or \`filter()\`.

\`\`\`python
nums = [1, 2, 3, 4]
# Filter evens
evens = list(filter(lambda x: x % 2 == 0, nums))
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Square Lambda',
                content: `Create a lambda function named \`square\` that returns the square of a number.`,
                codeTemplate: 'square = ...\n\nprint(square(4))',
                hints: ['lambda x: x ** 2']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Sorter',
                content: `Sort this list of pairs based on the **second** number.
Use \`key=lambda ...\`.`,
                codeTemplate: 'pairs = [(1, 5), (2, 3), (4, 1)]\n\n# Sort by second element\npairs.sort(key=...)\n\nprint(pairs)',
                hints: ['lambda p: p[1]']
            }
        ],
        xpReward: 200,
        estimatedTime: 20
    },

    // =====================================================
    // PYTHON - TIER 5: FOREST (Expert)
    // =====================================================
    {
        id: 'py-t5-json',
        title: 'JSON Data Handling',
        description: 'Read and write JSON data, the language of the web APIs.',
        tier: 5,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'What is JSON?',
                content: `JSON (JavaScript Object Notation) is the format used by almost all websites to send data.
It looks almost exactly like a Python Dictionary!`
            },
            {
                id: 'parsing',
                type: 'text',
                title: 'Parsing (Reading)',
                content: `Convert JSON string -> Python Dict.
Use \`json.loads()\`.

\`\`\`python
import json

data_str = '{"name": "Budi", "age": 20}'
data = json.loads(data_str)

print(data["name"]) # Budi
\`\`\``
            },
            {
                id: 'dumping',
                type: 'text',
                title: 'Dumping (Writing)',
                content: `Convert Python Dict -> JSON string.
Use \`json.dumps()\`.

\`\`\`python
profile = {"user": "admin", "active": True}
json_str = json.dumps(profile)

print(json_str) 
# '{"user": "admin", "active": true}'
# Note: True became true (lowercase)
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Parse API Response',
                content: `You received a response string. Parse it and print the status.`,
                codeTemplate: 'import json\n\nresponse = \'{"status": "success", "id": 123}\'\n\n# Parse it\ndata = ...\n\nprint(data["status"])',
                hints: ['json.loads(response)']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Config Generator',
                content: `Create a config dict and convert it to a JSON string.`,
                codeTemplate: 'import json\n\nconfig = {\n    "theme": "dark",\n    "version": 1.0\n}\n\n# Convert to string\nresult = ...\n\nprint(result)',
                hints: ['json.dumps(config)']
            }
        ],
        xpReward: 300,
        estimatedTime: 25
    },
    {
        id: 'py-t5-dates',
        title: 'Date & Time',
        description: 'Working with dates, times, and timestamps.',
        tier: 5,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Time is Relational',
                content: `Computers track time as "Seconds since Jan 1, 1970".
We humans like "25 Dec 2025".

Python's \`datetime\` module bridges this gap.`
            },
            {
                id: 'now',
                type: 'text',
                title: 'What time is it?',
                content: `\`\`\`python
from datetime import datetime

now = datetime.now()
print(now)
# 2024-03-20 14:30:05.123456
\`\`\``
            },
            {
                id: 'properties',
                type: 'text',
                title: 'Parts of Date',
                content: `You can access specific parts:

\`\`\`python
print(now.year)  # 2024
print(now.month) # 3
print(now.day)   # 20
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Current Year',
                content: `Print usage of \`datetime.now().year\`.`,
                codeTemplate: 'from datetime import datetime\n\n# Print current year\nprint(...)',
                hints: ['datetime.now().year']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'New Year Countdown',
                content: `If today is month 12, print "Almost there!".
Else, print "Long way to go".
Use \`datetime.now().month\`.`,
                codeTemplate: 'from datetime import datetime\n\nmonth = datetime.now().month\n\n# Logic here',
                hints: ['if month == 12:']
            }
        ],
        xpReward: 300,
        estimatedTime: 20
    },
    {
        id: 'py-t5-regex',
        title: 'Regular Expressions (Regex)',
        description: 'Advanced pattern matching for text validation.',
        tier: 5,
        language: 'python',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Magic Patterns',
                content: `Regex allows you to find complex patterns in text.
- "Is this a valid email?"
- "Find all phone numbers."

It looks cryptic, but it represents patterns.`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Basic Patterns',
                content: `\`\`\`python
import re

text = "My number is 0812345"

# Find digits (\d)
match = re.search(r"\d+", text) 

print(match.group()) # 0812345
\`\`\`

Common symbols:
- \`\d\`: Any digit
- \`\w\`: Any letter/number
- \`.\`: Any character
- \`+\`: One or more`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Find the Price',
                content: `Extract the number from "Price: $99".
Use \`re.search\` with pattern \`\d+\`.`,
                codeTemplate: 'import re\ntext = "Price: $99"\n\nmatch = re.search(r"\d+", text)\nprint(match.group())',
                hints: ['Pattern is r"\\d+"']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Email Validator',
                content: `Check if "user@email.com" contains "@".
Use \`re.search\`.`,
                codeTemplate: 'import re\nemail = "user@email.com"\n\nif re.search(r"...", email):\n    print("Valid")\nelse:\n    print("Invalid")',
                hints: ['re.search(r"@", email)']
            }
        ],
        xpReward: 350,
        estimatedTime: 30
    }
];
