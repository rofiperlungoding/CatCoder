import type { Lesson } from '../../types';

export const javascriptLessons: Lesson[] = [
    // =====================================================
    // JAVASCRIPT - TIER 1
    // =====================================================
    {
        id: 'js-t1-hello',
        title: 'Hello, JavaScript!',
        description: 'Write your first JavaScript program and learn console.log().',
        tier: 1,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'JavaScript: The Language of the Web',
                content: `JavaScript (JS) is the language that makes websites come **alive**!

HTML only builds structure (like bones).
CSS beautifies the look (like clothes).
JavaScript provides the "brain" and the ability to move.

Every button you click, the notifications that appear, animations on the website... that's all JavaScript's work.`
            },
            {
                id: 'console',
                type: 'text',
                title: 'Displaying Messages',
                content: `First step: How does JS display messages?

We use \`console.log()\`.
This command sends a secret message to the browser's "Console" (a special place for programmers to view logs).

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

Similar to \`print()\` in Python, but a bit longer.`
            },
            {
                id: 'syntax-details',
                type: 'text',
                title: 'Syntax Details',
                content: `Pay attention to a few important things in JS:

1.  **Parentheses** \`()\`: Enclose the message content.
2.  **Quotes** \`""\` or \`''\`: Indicate text.
3.  **Semicolon** \`;\`: Marks the end of a command line (like a period in a sentence).

Although modern JS often allows omitting \`;\`, as a beginner, **get used to using semicolons** to be neat.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Try It Yourself',
                content: `Display "Hello, World!" using console.log().

Don't forget the semicolon!`,
                codeTemplate: 'console.log("Hello, World!");',

                hints: ['Use console.log() with text in quotes', 'End with a semicolon ;']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Web Developer Challenge',
                content: `As a future Web Developer, your first task is to greet visitors.

Write code to display:
**"Welcome to my website!"**`,
                codeTemplate: 'console.log("Welcome to my website!");\n',
                hints: ['Use console.log(...)', 'Make sure the text matches exactly']
            }
        ],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'js-t1-variables',
        title: 'Variables: let, const',
        description: 'Learn modern ways to declare variables in JavaScript.',
        tier: 1,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Variables in JavaScript',
                content: `In the old days, JS only had one way to create variables: \`var\`.
But \`var\` has many issues and is confusing.

In Modern JavaScript (ES6+), we have 2 better new friends:
1.  **const** (Constant)
2.  **let**`
            },
            {
                id: 'const-vs-let',
                type: 'text',
                title: 'const vs let',
                content: `**1. const (Use this FIRST!)**
Create variables whose values will **NEVER** change.
\`\`\`javascript
const name = "Alice";
const birth_date = "1 January";
\`\`\`

**2. let (Use if needs strict changes)**
Create variables whose values **MIGHT** change later.
\`\`\`javascript
let score = 0;
score = 10;
\`\`\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Variable Practice',
                content: `Create a variable \`name\` using \`const\`, then display it.`,
                codeTemplate: 'const name = "CatCoder";\nconsole.log(name);',

                hints: ['const name = "..."', 'Don\'t forget the semicolon']
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Score Update Challenge',
                content: `Let's simulate a game score.

1.  Create variable \`score\` using \`let\`, fill with 0.
2.  Print \`score\`.
3.  Change \`score\` to 100.
4.  Print \`score\` again.`,
                codeTemplate: 'let score = 0;\n// Continue...\n',
                hints: ['Don\'t use const because the value changes', 'Use console.log to print']
            }
        ],
        xpReward: 75,
        estimatedTime: 15
    },
    // =====================================================
    // JAVASCRIPT - TIER 2
    // =====================================================
    {
        id: 'js-t2-conditionals',
        title: 'Making Decisions',
        description: 'Control the flow with if, else, and switch.',
        tier: 2,
        language: 'javascript',
        sections: [
            {
                id: 'if-else',
                type: 'text',
                title: 'If and Else',
                content: `Logic is the heart of programming.
\`\`\`javascript
if (age >= 17) {
    console.log("Can drive");
} else {
    console.log("Too young");
}
\`\`\`
Note:
- Use \`===\` for strict equality (checks value AND type).
- Avoid \`==\` (loose equality) as it can be tricky.`
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Check Temperature',
                content: `Write an if-else statement.
If \`temp > 30\`, log "**Hot**".
Otherwise, log "**Ok**".`,
                codeTemplate: 'const temp = 35;\n// Write your if-else here',
                hints: ['if (temp > 30) { ... } else { ... }']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'js-t2-loops',
        title: 'Loops and Repetition',
        description: 'Repeat actions with for and while loops.',
        tier: 2,
        language: 'javascript',
        sections: [
            {
                id: 'for-loop',
                type: 'text',
                title: 'The For Loop',
                content: `The Classic For Loop:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
    console.log("Count: " + i);
}
\`\`\`
1. **Start**: \`let i = 0\`
2. **Condition**: \`i < 5\` (Keep going while true)
3. **Step**: \`i++\` (Add 1 after each round)`
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Countdown',
                content: `Create a loop that counts **DOWN** from 5 to 1.
Print the numbers.`,
                codeTemplate: '// Write a for loop\nfor (let i = 5; ... ) {\n    console.log(i);\n}',
                hints: ['i > 0', 'i--']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'js-t2-functions',
        title: 'Functions',
        description: 'Reusable blocks of code.',
        tier: 2,
        language: 'javascript',
        sections: [
            {
                id: 'arrow-functions',
                type: 'text',
                title: 'Arrow Functions',
                content: `Modern JS uses "Arrow Functions":
\`\`\`javascript
// Old way
function add(a, b) {
    return a + b;
}

// Modern way (Arrow)
const add = (a, b) => {
    return a + b;
};
\`\`\`
They are cleaner and cooler!`
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Greet Function',
                content: `Create a function named \`greet\` that takes a \`name\` and returns "Hello [name]".`,
                codeTemplate: 'const greet = (name) => {\n    // Return the string\n};\n\nconsole.log(greet("Alex"));',
                hints: ['return "Hello " + name;']
            }
        ],
        xpReward: 100,
        estimatedTime: 20
    },
    // =====================================================
    // JAVASCRIPT - TIER 3
    // =====================================================
    {
        id: 'js-t3-arrays',
        title: 'Arrays (Lists)',
        description: 'Storing lists of data.',
        tier: 3,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Arrays',
                content: `\`\`\`javascript
const fruits = ["Apple", "Banana", "Cherry"];
console.log(fruits[0]); // Apple
console.log(fruits.length); // 3
\`\`\``
            },
            {
                id: 'push-pop',
                type: 'text',
                title: 'Push & Pop',
                content: `- \`push(item)\`: Add to end
- \`pop()\`: Remove from end`
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Shopping List',
                content: `1. Create array \`list\` with "Milk".
2. Add "Eggs".
3. Add "Bread".
4. Log the array.`,
                codeTemplate: 'const list = ["Milk"];\n// Add items\nconsole.log(list);',
                hints: ['list.push("Eggs");']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },
    {
        id: 'js-t3-array-methods',
        title: 'Array Magic: Map & Filter',
        description: 'Powerful tools to transform data.',
        tier: 3,
        language: 'javascript',
        sections: [
            {
                id: 'map',
                type: 'text',
                title: 'Map',
                content: `\`map\` transforms EVERY item in an array.
\`\`\`javascript
const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);
// [2, 4, 6]
\`\`\``
            },
            {
                id: 'filter',
                type: 'text',
                title: 'Filter',
                content: `\`filter\` keeps items that match a condition.
\`\`\`javascript
const scores = [80, 45, 90];
const pass = scores.filter(s => s >= 50);
// [80, 90]
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Data Processor',
                content: `Given prices \`[10, 20, 30]\`.
1. Use \`map\` to apply a 10% tax (multiply by 1.1).
2. Log the result.`,
                codeTemplate: 'const prices = [10, 20, 30];\nconst withTax = prices.map(p => ...);\nconsole.log(withTax);',
                hints: ['p * 1.1']
            }
        ],
        xpReward: 150,
        estimatedTime: 30
    },
    {
        id: 'js-t3-objects',
        title: 'Objects',
        description: 'Key-Value pairs.',
        tier: 3,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Object Literal',
                content: `\`\`\`javascript
const hero = {
    name: "Iron Man",
    power: 100,
    fly: true
};

console.log(hero.name); // Dot notation
console.log(hero["power"]); // Bracket notation
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Character Creator',
                content: `Create an object \`player\` with:
- \`username\`: "ProGamer"
- \`level\`: 50
Log the username.`,
                codeTemplate: 'const player = {\n    \n};\nconsole.log(player.username);',
                hints: ['key: value', 'username: "ProGamer"']
            }
        ],
        xpReward: 150,
        estimatedTime: 25
    },
    // =====================================================
    // JAVASCRIPT - TIER 4
    // =====================================================
    {
        id: 'js-t4-es6',
        title: 'Modern JS (ES6+)',
        description: 'New features that make life easier.',
        tier: 4,
        language: 'javascript',
        sections: [
            {
                id: 'destructuring',
                type: 'text',
                title: 'Destructuring',
                content: `Unpacking values from arrays or objects.
\`\`\`javascript
const user = { name: "Neo", age: 30 };
// Old
const name = user.name;
// New
const { name, age } = user;
\`\`\`
It also works for arrays!
\`\`\`javascript
const [x, y] = [10, 20];
\`\`\``
            },
            {
                id: 'spread',
                type: 'text',
                title: 'Spread Operator',
                content: `Using \`...\` to spread elements.
\`\`\`javascript
const parts = [1, 2];
const whole = [...parts, 3, 4]; // [1, 2, 3, 4]
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Object Destructuring',
                content: `Given \`const car = { brand: "Tesla", model: "X" }\`.
Use destructuring to create variables \`brand\` and \`model\`.
Log them.`,
                codeTemplate: 'const car = { brand: "Tesla", model: "X" };\n// Destructure here\nconsole.log(brand + " " + model);',
                hints: ['const { brand, model } = car;']
            }
        ],
        xpReward: 200,
        estimatedTime: 25
    },
    {
        id: 'js-t4-dom',
        title: 'DOM Interaction',
        description: 'How JS talks to HTML.',
        tier: 4,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'The DOM',
                content: `**DOM (Document Object Model)** is the tree structure of your HTML.
JS can modify it!

Common methods:
1. \`document.getElementById("my-id")\`
2. \`document.querySelector(".my-class")\`
3. \`element.innerHTML = "New Text"\`
4. \`element.style.color = "red"\``
            },
            {
                id: 'practice',
                type: 'code',
                title: 'Fake DOM Manipulation',
                content: `Imagine we have an element:
\`<h1 id="title">Old Title</h1>\`

Change its text to "**Hello DOM**" (conceptually).
In this editor, just log the command you would use.`,
                codeTemplate: '// document.getElementById("title").innerHTML = ...',
                hints: ['document.getElementById("title").innerHTML = "Hello DOM"']
            }
        ],
        xpReward: 200,
        estimatedTime: 20
    },
    // =====================================================
    // JAVASCRIPT - TIER 5
    // =====================================================
    {
        id: 'js-t5-async',
        title: 'Async & Promises',
        description: 'Handling time-consuming tasks.',
        tier: 5,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'Synchronous vs Asynchronous',
                content: `**Sync**: Wait for line 1 to finish before line 2.
**Async**: Start line 1, move to line 2 immediately.

fetching data from a server takes time. We don't want to freeze the browser!`
            },
            {
                id: 'promise',
                type: 'text',
                title: 'The Promise',
                content: `A **Promise** is essentially an IOU. "I promise to give you data later."
\`\`\`javascript
fetchData()
    .then(data => console.log(data))
    .catch(err => console.error(err));
\`\`\``
            },
            {
                id: 'async-await',
                type: 'text',
                title: 'Async/Await',
                content: `The modern way to handle Promises. It looks synchronous!
\`\`\`javascript
async function getData() {
    try {
        const data = await fetchData();
        console.log(data);
    } catch (err) {
        console.log("Error");
    }
}
\`\`\``
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Async Function',
                content: `Create an \`async\` function named \`loadUser\`.
Insidie, use \`await fakeFetch()\`.
Log "Done".`,
                codeTemplate: 'async function loadUser() {\n    await fakeFetch();\n    // Log Done\n}\n\n// Mock function\nfunction fakeFetch() { return Promise.resolve(); }',
                hints: ['console.log("Done");']
            }
        ],
        xpReward: 300,
        estimatedTime: 35
    },
    {
        id: 'js-t5-json',
        title: 'JSON Handling',
        description: 'Data format of the web.',
        tier: 5,
        language: 'javascript',
        sections: [
            {
                id: 'intro',
                type: 'text',
                title: 'JSON',
                content: `**JSON (JavaScript Object Notation)**.
It's just a text string that looks like a JS object.

- \`JSON.stringify(obj)\`: Object -> String
- \`JSON.parse(string)\`: String -> Object`
            },
            {
                id: 'challenge',
                type: 'challenge',
                title: 'Parse JSON',
                content: `Given a string:
\`const data = '{"id": 1, "isActive": true}';\`

1. Parse it into an object named \`user\`.
2. Log \`user.isActive\`.`,
                codeTemplate: 'const raw = \'{"id": 1, "isActive": true}\';\n// Parse it\nconsole.log(user.isActive);',
                hints: ['const user = JSON.parse(raw);']
            }
        ],
        xpReward: 300,
        estimatedTime: 20
    }
];


