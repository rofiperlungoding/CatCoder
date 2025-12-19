import type { Lesson } from '../../types';

export const cppLessons: Lesson[] = [
    // =====================================================
    // C++ - TIER 1
    // =====================================================
    {
        id: 'cpp-t1-hello',
        title: 'Hello, C++!',
        description: 'Write your first C++ program and understand its structure.',
        tier: 1,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'C++: High Performance Language',
                content: `C++ is the king of speed.

This language is used to create:
- Large Game Engines (Unreal Engine)
- Browsers (Chrome, Firefox)
- Operating Systems (Windows)

C++ is a bit more complex than Python, but gives you full control over the computer.`
            },
            {
                id: 'structure',
                type: 'text',
                title: 'C++ Anatomy',
                content: `C++ programs have a mandatory structure. You can't just write commands directly.

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "Hello";
    return 0;
}
\`\`\`

**What is that??**
1.  \`#include <iostream>\`: Import input-output tools.
2.  \`int main() { ... }\`: Main function. Code starts here.
3.  \`std::cout\`: Print command ("Character Output").
4.  \`return 0\`: Tells the OS that the program succeeded.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Hello World Practice',
                content: `Rewrite the C++ Hello World program correctly.`,
                codeTemplate: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',

                hints: ['Don\'t forget std::cout', 'Notice the << signs (left arrows)', 'Semicolons are mandatory!']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'C++ Challenge',
                content: `Create a C++ program that displays your own name.

Remember the structure:
1. Include library
2. Main function
3. Cout your name
4. Return 0`,
                codeTemplate: '#include <iostream>\n\nint main() {\n    // Write your code here\n}',
                hints: ['std::cout << "YourName";', 'Don\'t forget return 0;']
            }
        ],
        xpReward: 50,
        estimatedTime: 12
    },
    {
        id: 'cpp-t1-variables',
        title: 'Variables & Types',
        description: 'Learn data types and variable declaration in C++.',
        tier: 1,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Statically Typed',
                content: `C++ is "Statically Typed".

Meaning: **You must tell the computer what type of data you want to store.**

-   If you want to store numbers, say "This is an Integer".
-   If you want to store text, say "This is a String".

No changing allowed halfway!`
            },
            {
                id: 'types',
                type: 'text',
                title: 'Data Type Dictionary',
                content: `Memorize these basic data types:

-   \`int\`: Whole numbers (42)
-   \`double\`: Decimal numbers (3.14)
-   \`char\`: Single character ('A')
-   \`string\`: Text ("Hello") -> Needs \`#include <string>\`
-   \`bool\`: True/False`
            },
            {
                id: 'syntax',
                type: 'text',
                title: 'Variable Declaration',
                content: `**Formula:**
\`DataType variableName = Value;\`

**Example:**
\`\`\`cpp
int age = 17;
double height = 170.5;
std::string name = "Budi";
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Variable Practice',
                content: `Complete the following code to display the age.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 17;\n    cout << "Age: " << age;\n    return 0;\n}',

                hints: ['Use cout << "Text" << variable', 'using namespace std; so you don\'t need to write std:: every time']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'C++ Bio',
                content: `Create 2 variables inside main():
1.  \`int level\` with value 5.
2.  \`double exp\` with value 50.5.

Display both. Use \`std::endl\` or \`\\n\` for new line.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Create variables and print\n    return 0;\n}',
                hints: ['cout << level << endl;', 'cout << exp << endl;']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },
    // =====================================================
    // C++ - TIER 2
    // =====================================================
    {
        id: 'cpp-t2-conditionals',
        title: 'Making Decisions',
        description: 'If, Else, and Switch logic.',
        tier: 2,
        language: 'cpp',
        sections: [
            {
                id: 'if-else',
                type: 'text',
                title: 'Conditionals',
                content: `Same as other languages, but remember to use \`()\`.

\`\`\`cpp
if (score > 90) {
    cout << "A";
} else if (score > 80) {
    cout << "B";
} else {
    cout << "C";
}
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Check Age',
                content: `Create a comprehensive if-else check.
- Age >= 18: Print "Adult"
- Age < 18: Print "Minor"`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 20;\n    // Write logic here\n    return 0;\n}',
                hints: ['if (age >= 18)', 'else']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'cpp-t2-loops',
        title: 'Loops',
        description: 'For and While loops in C++.',
        tier: 2,
        language: 'cpp',
        sections: [
            {
                id: 'for',
                type: 'text',
                title: 'Standard For Loop',
                content: `\`\`\`cpp
for (int i = 0; i < 5; i++) {
    cout << i << " ";
}
\`\`\`
Output: \`0 1 2 3 4\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Looping Sum',
                content: `Calculate sum of numbers from 1 to 5 using a loop.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int sum = 0;\n    // Loop here\n    cout << sum;\n    return 0;\n}',
                hints: ['sum += i;']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'cpp-t2-functions',
        title: 'Functions',
        description: 'Modularizing code.',
        tier: 2,
        language: 'cpp',
        sections: [
            {
                id: 'decl',
                type: 'text',
                title: 'Declaration',
                content: `In C++, you must declare the return type.
\`\`\`cpp
// Returns integer
int add(int a, int b) {
    return a + b;
}

// Returns nothing
void greet() {
    cout << "Hello";
}
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Multiplier',
                content: `Create a function \`multiply\` that accepts 2 integers and returns their product.
Call it in main.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\n// Create function here\n\nint main() {\n    cout << multiply(5, 4);\n    return 0;\n}',
                hints: ['int multiply(int a, int b)', 'return a * b;']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    // =====================================================
    // C++ - TIER 3
    // =====================================================
    {
        id: 'cpp-t3-arrays',
        title: 'C-Style Arrays',
        description: 'Fixed size collections.',
        tier: 3,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Fixed Arrays',
                content: `\`\`\`cpp
int numbers[3] = {1, 2, 3};
cout << numbers[0]; // 1
\`\`\`
Warning: You CANNOT change the size of this array once created!`
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Access Array',
                content: `1. Create array \`arr\` with 3 integers: 10, 20, 30.
2. Change the second element (index 1) to 99.
3. Print it.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}',
                hints: ['int arr[3] = {10, 20, 30};', 'arr[1] = 99;']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },
    {
        id: 'cpp-t3-vectors',
        title: 'Vectors (Dynamic Arrays)',
        description: 'The better array.',
        tier: 3,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'std::vector',
                content: `Requires \`#include <vector>\`.
Unlike arrays, vectors can grow!
\`\`\`cpp
vector<int> nums;
nums.push_back(10);
nums.push_back(20);
cout << nums.size(); // 2
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Vector push_back',
                content: `1. Create \`vector<string>\` named \`names\`.
2. Add "Alice".
3. Add "Bob".
4. Print the first name.`,
                codeTemplate: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // code here\n    return 0;\n}',
                hints: ['vector<string> names;', 'names.push_back("Alice");']
            }
        ],
        xpReward: 150,
        estimatedTime: 30
    },
    {
        id: 'cpp-t3-strings',
        title: 'std::string',
        description: 'Text manipulation.',
        tier: 3,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Strings',
                content: `Use \`std::string\`, not \`char[]\` (usually).
\`\`\`cpp
string a = "Hello";
string b = "World";
string c = a + " " + b; // Concatenation
cout << c.length(); // Length
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Greetings',
                content: `Combine variables \`first\` and \`last\` into \`full\`.
Add a space in between.
Print \`full\`.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    string first = "John";\n    string last = "Doe";\n    // Combine\n    return 0;\n}',
                hints: ['string full = first + " " + last;']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },
    // =====================================================
    // C++ - TIER 4
    // =====================================================
    {
        id: 'cpp-t4-pointers',
        title: 'Pointers',
        description: 'Direct memory manipulation.',
        tier: 4,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'The Pointer (*)',
                content: `A variable stores data.
A **Pointer** stores the ADDRESS of data.
\`\`\`cpp
int score = 100;
int* ptr = &score; // Store address of score
cout << ptr; // 0x7ffee... (Memory address)
cout << *ptr; // 100 (Value at address)
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Address Hunt',
                content: `1. Create \`int x = 50\`.
2. Create pointer \`p\` pointing to \`x\`.
3. Print the value of \`x\` using the pointer (dereference).`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Code here\n    return 0;\n}',
                hints: ['int* p = &x;', 'cout << *p;']
            }
        ],
        xpReward: 200,
        estimatedTime: 30
    },
    {
        id: 'cpp-t4-memory',
        title: 'References & Memory',
        description: 'Efficient data passing.',
        tier: 4,
        language: 'cpp',
        sections: [
            {
                id: 'ref',
                type: 'text',
                title: 'References (&)',
                content: `A reference is an alias (another name) for a variable.
\`\`\`cpp
int a = 10;
int& b = a; // b is now a
b = 20;
cout << a; // 20
\`\`\`
Useful for passing large objects to functions without copying!`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Swap Function',
                content: `Write a function \`swap_nums(int &a, int &b)\` that swaps their values.
We use \`&\` so the original variables change.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nvoid swap_nums(int &a, int &b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 1, y = 2;\n    swap_nums(x, y);\n    cout << x << " " << y;\n    return 0;\n}',
                hints: ['Already implemented, strictly study logic']
            }
        ],
        xpReward: 200,
        estimatedTime: 25
    },
    // =====================================================
    // C++ - TIER 5
    // =====================================================
    {
        id: 'cpp-t5-classes',
        title: 'Classes & Objects',
        description: 'Object Oriented Programming in C++.',
        tier: 5,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Class Definition',
                content: `\`\`\`cpp
class Car {
public:
    string brand;
    void honk() {
        cout << "Beep!";
    }
};

int main() {
    Car myCar;
    myCar.brand = "Ford";
    myCar.honk();
}
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Dog Class',
                content: `1. Create class \`Dog\`.
2. Add public \`string name\`.
3. Add public method \`bark()\` that prints "Woof".
4. In main, create a Dog, name it "Buddy", and make it bark.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\n// Define class here\n\nint main() {\n    // Use class here\n    return 0;\n}',
                hints: ['class Dog { public: ... }', 'Dog d;', 'd.bark();']
            }
        ],
        xpReward: 300,
        estimatedTime: 35
    },
    {
        id: 'cpp-t5-inheritance',
        title: 'Inheritance',
        description: 'Reusing code from parent classes.',
        tier: 5,
        language: 'cpp',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Deriving Classes',
                content: `\`\`\`cpp
class Animal {
public:
    void eat() { cout << "Nom nom"; }
};

class Cat : public Animal {
    // Cat has eat() automatically
};
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Super Hero',
                content: `1. Class \`Person\` with \`walk()\`.
2. Class \`Hero\` inherits \`Person\`.
3. \`Hero\` adds \`fly()\`.
4. Create Hero and call both methods.`,
                codeTemplate: '#include <iostream>\nusing namespace std;\n\nclass Person { public: void walk() { cout<<"Walk"; } };\n\n// Create Hero class\n\nint main() {\n    return 0;\n}',
                hints: ['class Hero : public Person']
            }
        ],
        xpReward: 300,
        estimatedTime: 30
    }
];


