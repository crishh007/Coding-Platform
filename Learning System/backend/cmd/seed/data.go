package main

type SeedTopic struct {
	Title   string
	Lessons []string
}

var dsaCurriculumData = []SeedTopic{
	{
		Title: "Mathematics & Basics",
		Lessons: []string{
			"Time Complexity", "Big O Notation", "Omega Notation", "Theta Notation", "Asymptotic Analysis",
			"Space Complexity", "Recursion", "Base Case", "Recursive Calls", "Tail Recursion", "Backtracking Basics",
			"GCD / LCM", "Prime Numbers", "Sieve of Eratosthenes", "Modular Arithmetic", "Fast Exponentiation",
			"Bit Manipulation", "Pointer Concepts",
		},
	},
	{
		Title: "Arrays",
		Lessons: []string{
			"1D Array", "2D Array / Matrix", "Prefix Sum", "Sliding Window", "Two Pointer Technique",
			"Kadane Algorithm", "Rotation", "Searching in Arrays", "Sorting in Arrays",
			"Transpose", "Spiral Traversal", "Matrix Rotation",
		},
	},
	{
		Title: "Strings",
		Lessons: []string{
			"String Operations", "Naive Pattern Matching", "KMP Algorithm", "Rabin Karp", "Z Algorithm",
			"Palindrome Problems", "Trie Applications", "Hashing in Strings",
		},
	},
	{
		Title: "Linked List",
		Lessons: []string{
			"Singly Linked List", "Doubly Linked List", "Circular Linked List",
			"Insert in Linked List", "Delete in Linked List", "Reverse Linked List", "Search in Linked List",
			"Loop Detection", "Floyd Cycle Detection", "Merge Lists",
		},
	},
	{
		Title: "Stack",
		Lessons: []string{
			"Array Implementation of Stack", "Linked List Implementation of Stack",
			"Parenthesis Matching", "Infix to Postfix", "Prefix Conversion", "Expression Evaluation",
			"Next Greater Element", "Monotonic Stack",
		},
	},
	{
		Title: "Queue",
		Lessons: []string{
			"Linear Queue", "Circular Queue", "Priority Queue", "Deque",
			"BFS using Queue", "Scheduling Applications",
		},
	},
	{
		Title: "Hashing",
		Lessons: []string{
			"Hash Table Basics", "Chaining", "Open Addressing", "HashMap", "HashSet", "Frequency Count Problems",
		},
	},
	{
		Title: "Trees",
		Lessons: []string{
			"Binary Tree", "Inorder Traversal", "Preorder Traversal", "Postorder Traversal", "Level Order Traversal",
			"Height of Tree", "Diameter of Tree", "LCA in Tree", "Top View", "Bottom View", "Left View", "Right View",
			"Binary Search Tree (BST)", "Insert in BST", "Delete in BST", "Search in BST", "Validation of BST",
			"AVL Tree", "Red Black Tree", "Min Heap", "Max Heap", "Heap Sort", "Priority Queue in Trees",
			"Segment Tree", "Fenwick Tree (BIT)", "Trie", "B Tree / B+ Tree",
		},
	},
	{
		Title: "Graphs",
		Lessons: []string{
			"Adjacency Matrix", "Adjacency List", "BFS Traversal", "DFS Traversal",
			"Dijkstra Shortest Path", "Bellman Ford", "Floyd Warshall", "Prim Algorithm", "Kruskal Algorithm",
			"Topological Sort", "Union Find (DSU)", "Strongly Connected Components (SCC)", "Bridges",
			"Articulation Points", "Network Flow",
		},
	},
	{
		Title: "Searching Algorithms",
		Lessons: []string{
			"Linear Search", "Binary Search", "Jump Search",
		},
	},
	{
		Title: "Sorting Algorithms",
		Lessons: []string{
			"Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort",
			"Heap Sort", "Counting Sort", "Radix Sort", "Bucket Sort",
		},
	},
	{
		Title: "Greedy Algorithms",
		Lessons: []string{
			"Activity Selection", "Fractional Knapsack", "Huffman Coding", "Job Scheduling", "Minimum Platforms",
		},
	},
	{
		Title: "Dynamic Programming (DP)",
		Lessons: []string{
			"Memoization", "Tabulation", "1D DP", "2D DP", "Knapsack DP",
			"Longest Common Subsequence (LCS)", "Longest Increasing Subsequence (LIS)",
			"Matrix Chain Multiplication", "Digit DP", "Bitmask DP", "DP on Trees",
		},
	},
	{
		Title: "Backtracking",
		Lessons: []string{
			"N Queen Problem", "Sudoku Solver", "Rat in a Maze", "Permutations", "Combinations",
		},
	},
	{
		Title: "Advanced Topics",
		Lessons: []string{
			"Divide and Conquer", "Branch and Bound", "Advanced Bit Manipulation", "Advanced String Hashing",
			"Mo Algorithm", "Sparse Table", "Heavy Light Decomposition", "Centroid Decomposition",
			"Suffix Array", "Suffix Tree", "Computational Geometry",
		},
	},
	{
		Title: "Competitive Programming Concepts",
		Lessons: []string{
			"Fast I/O", "STL and Collections", "Advanced Modular Arithmetic", "Coordinate Compression",
			"Meet in the Middle", "Offline Queries", "Advanced Graph + DP",
		},
	},
}

var javaCurriculumData = []SeedTopic{
	{
		Title: "1. Java Fundamentals",
		Lessons: []string{
			"Variables and Data Types", "Arrays", "Operators", "Strings", "Input/Output", "Methods", "Type Casting", "Command Line Arguments",
		},
	},
	{
		Title: "2. Object-Oriented Programming (OOP)",
		Lessons: []string{
			"Classes and Objects", "Polymorphism", "Constructors", "Abstraction", "Encapsulation", "Interfaces", "Inheritance", "Packages",
		},
	},
	{
		Title: "3. Core Java Concepts",
		Lessons: []string{
			"Wrapper Classes", "Static Keyword", "String, StringBuilder, StringBuffer", "Final Keyword", "Enum", "Inner Classes", "Anonymous Classes",
		},
	},
	{
		Title: "4. Exception Handling",
		Lessons: []string{
			"try-catch-finally", "Custom Exceptions", "throw and throws", "Exception Hierarchy",
		},
	},
	{
		Title: "5. Collections Framework",
		Lessons: []string{
			"List (ArrayList, LinkedList, Vector)", "Set (HashSet, LinkedHashSet, TreeSet)", "Map (HashMap, LinkedHashMap, TreeMap, Hashtable)", "Queue (Priority Queue, Deque)",
		},
	},
	{
		Title: "6. Generics",
		Lessons: []string{
			"Generic Classes", "Generic Methods", "Wildcards",
		},
	},
	{
		Title: "7. Functional Programming (Java 8+)",
		Lessons: []string{
			"Lambda Expressions", "Stream API", "Functional Interfaces", "Optional Class", "Method References",
		},
	},
	{
		Title: "8. Multithreading",
		Lessons: []string{
			"Thread Class", "Executor Framework", "Runnable Interface", "Callable & Future", "Synchronization", "CompletableFuture", "Locks",
		},
	},
	{
		Title: "9. File Handling",
		Lessons: []string{
			"File Class", "Serialization", "BufferedReader", "NIO Package", "BufferedWriter",
		},
	},
	{
		Title: "10. JDBC",
		Lessons: []string{
			"Connection", "ResultSet", "Statement", "Transactions", "PreparedStatement",
		},
	},
	{
		Title: "11. Advanced Java",
		Lessons: []string{
			"Reflection API", "Date & Time API", "Annotations", "Networking (Socket Programming)", "Regex",
		},
	},
	{
		Title: "12. Design Patterns",
		Lessons: []string{
			"Singleton", "Observer", "Factory", "Strategy", "Builder", "MVC Pattern", "Adapter",
		},
	},
	{
		Title: "13. Build Tools",
		Lessons: []string{
			"Maven", "Gradle",
		},
	},
	{
		Title: "14. Testing",
		Lessons: []string{
			"JUnit", "Mockito", "Logging (SLF4J, Log4j)",
		},
	},
	{
		Title: "15. Frameworks",
		Lessons: []string{
			"Spring Core", "Spring Boot", "Spring MVC", "Spring Data JPA", "Spring Security", "Hibernate ORM Concepts", "JPQL", "Relationships",
		},
	},
	{
		Title: "16. Microservices",
		Lessons: []string{
			"REST APIs", "Redis", "Docker", "API Gateway", "Kafka", "Service Discovery",
		},
	},
	{
		Title: "17. Deployment",
		Lessons: []string{
			"Linux Basics", "Jenkins", "AWS Basics", "Kubernetes", "CI/CD",
		},
	},
}

var cppCurriculumData = []SeedTopic{
	{
		Title: "1. C++ Basics",
		Lessons: []string{
			"Variables and Data Types", "Input/Output", "Operators", "Arrays", "Strings", "Functions",
		},
	},
	{
		Title: "2. OOP Concepts",
		Lessons: []string{
			"Classes and Objects", "Constructors & Destructors", "Encapsulation", "Inheritance", "Polymorphism", "Virtual Functions", "Abstract Classes",
		},
	},
	{
		Title: "3. Memory Management",
		Lessons: []string{
			"Pointers", "References", "Dynamic Memory Allocation", "Smart Pointers", "RAII",
		},
	},
	{
		Title: "4. Templates",
		Lessons: []string{
			"Function Templates", "Class Templates", "STL Containers",
		},
	},
	{
		Title: "5. Standard Template Library (STL)",
		Lessons: []string{
			"Containers (Vector, List, Stack, Queue, Set, Map)", "Iterators", "Algorithms (sort, lower_bound, binary_search)",
		},
	},
	{
		Title: "6. Exception Handling",
		Lessons: []string{
			"try-catch", "Custom Exceptions",
		},
	},
	{
		Title: "7. Modern C++ (C++11/14/17/20)",
		Lessons: []string{
			"auto", "nullptr", "Lambda Expressions", "Move Semantics", "Rvalue References", "constexpr",
		},
	},
	{
		Title: "8. File Handling",
		Lessons: []string{
			"ifstream", "ofstream", "fstream",
		},
	},
	{
		Title: "9. Multithreading",
		Lessons: []string{
			"std::thread", "Mutex", "Condition Variable", "Atomic Variables", "Future and Async",
		},
	},
	{
		Title: "10. Design Patterns",
		Lessons: []string{
			"Singleton", "Factory", "Observer", "Strategy", "Adapter",
		},
	},
	{
		Title: "11. Data Structures & Algorithms",
		Lessons: []string{
			"Arrays", "Linked List", "Stack", "Queue", "Trees", "Graphs", "Dynamic Programming",
		},
	},
	{
		Title: "12. Competitive Programming",
		Lessons: []string{
			"Fast I/O", "Bit Manipulation", "Segment Tree", "Fenwick Tree", "Sparse Table",
		},
	},
	{
		Title: "13. System Programming",
		Lessons: []string{
			"Socket Programming", "Processes and Threads", "Advanced Memory Management",
		},
	},
	{
		Title: "14. Build Tools",
		Lessons: []string{
			"CMake", "Makefile",
		},
	},
	{
		Title: "15. Testing",
		Lessons: []string{
			"Google Test",
		},
	},
	{
		Title: "16. Frameworks",
		Lessons: []string{
			"Qt (GUI)", "OpenCV", "Boost",
		},
	},
}

var pythonCurriculumData = []SeedTopic{
	{
		Title: "1. Python Basics",
		Lessons: []string{
			"Variables", "Data Types", "Operators", "Input/Output", "Strings", "Lists", "Tuples", "Sets", "Dictionaries",
		},
	},
	{
		Title: "2. Control Flow",
		Lessons: []string{
			"If-else", "Loops", "List Comprehension", "Functions", "Lambda Functions",
		},
	},
	{
		Title: "3. Object-Oriented Programming",
		Lessons: []string{
			"Classes and Objects", "Inheritance", "Polymorphism", "Encapsulation", "Magic Methods",
		},
	},
	{
		Title: "4. Exception Handling",
		Lessons: []string{
			"try-except", "Custom Exceptions",
		},
	},
	{
		Title: "5. Modules and Packages",
		Lessons: []string{
			"Built-in Modules", "pip", "Virtual Environment",
		},
	},
	{
		Title: "6. File Handling",
		Lessons: []string{
			"Read/Write Files", "CSV", "JSON", "Pickle",
		},
	},
	{
		Title: "7. Advanced Python",
		Lessons: []string{
			"Decorators", "Iterators", "Generators", "Context Managers", "Dataclasses",
		},
	},
	{
		Title: "8. Collections and Libraries",
		Lessons: []string{
			"collections", "itertools", "functools",
		},
	},
	{
		Title: "9. Multithreading & Multiprocessing",
		Lessons: []string{
			"threading", "multiprocessing", "asyncio",
		},
	},
	{
		Title: "10. Database",
		Lessons: []string{
			"SQLite", "MySQL", "SQLAlchemy",
		},
	},
	{
		Title: "11. Testing",
		Lessons: []string{
			"unittest", "pytest",
		},
	},
	{
		Title: "12. Web Development",
		Lessons: []string{
			"Flask", "Django", "FastAPI", "REST APIs", "JWT Authentication",
		},
	},
	{
		Title: "13. Data Science & Machine Learning",
		Lessons: []string{
			"NumPy", "Pandas", "Matplotlib", "Seaborn", "Scikit-Learn", "TensorFlow", "PyTorch",
		},
	},
	{
		Title: "14. Automation",
		Lessons: []string{
			"Selenium", "BeautifulSoup", "Requests",
		},
	},
	{
		Title: "15. DevOps & Deployment",
		Lessons: []string{
			"Docker", "Linux", "Git/GitHub", "CI/CD", "AWS",
		},
	},
	{
		Title: "16. Advanced Topics",
		Lessons: []string{
			"Async Programming", "Type Hints", "Design Patterns", "Cython",
		},
	},
	{
		Title: "17. Specialized Domains",
		Lessons: []string{
			"Data Science", "AI/LLMs", "Web Development", "Automation", "Cyber Security", "Game Development (Pygame)",
		},
	},
}

var htmlCurriculumData = []SeedTopic{
	{Title: "1. Introduction to HTML", Lessons: []string{"What is HTML?", "HTML History", "HTML Editors", "HTML Basic Template", "HTML Elements"}},
	{Title: "2. HTML Basics", Lessons: []string{"Headings", "Paragraphs", "Text Formatting", "Links", "Images", "Comments"}},
	{Title: "3. HTML Lists", Lessons: []string{"Unordered List", "Ordered List", "Description List"}},
	{Title: "4. HTML Tables", Lessons: []string{"Table", "Table Rows", "Table Headings", "Table Data", "Table Layout"}},
	{Title: "5. HTML Forms", Lessons: []string{"Form Elements", "Input Types", "Text Fields", "Radio Buttons", "Checkboxes", "Select Box", "Text Area", "File Upload", "Form Attributes"}},
	{Title: "6. HTML Links & Navigation", Lessons: []string{"Anchor Tag", "Navigation Menus", "Internal Links", "External Links", "Email Links"}},
	{Title: "7. HTML Media", Lessons: []string{"Images", "Audio", "Video", "Iframe", "Embed"}},
	{Title: "8. HTML Semantic Elements", Lessons: []string{"header", "nav", "section", "article", "aside", "footer", "main"}},
	{Title: "9. HTML5 New Features", Lessons: []string{"New Input Types", "HTML5 Elements", "Canvas", "SVG", "Geolocation", "Local Storage", "Drag and Drop"}},
	{Title: "10. Best Practices", Lessons: []string{"Write Clean HTML", "HTML Validation", "SEO Basics", "Accessibility Basics"}},
}

var cssCurriculumData = []SeedTopic{
	{Title: "1. CSS Introduction", Lessons: []string{"What is CSS?", "CSS Syntax", "CSS Selectors", "Ways to Add CSS (Inline, Internal, External)"}},
	{Title: "2. CSS Selectors", Lessons: []string{"Element Selector", "ID Selector", "Class Selector", "Universal Selector", "Group Selector", "Attribute Selector", "Pseudo-class", "Pseudo-element"}},
	{Title: "3. CSS Colors & Backgrounds", Lessons: []string{"Color Values", "Background Color", "Background Image", "Background Repeat", "Background Position", "Background Size", "Gradient Backgrounds"}},
	{Title: "4. CSS Typography", Lessons: []string{"Font Family", "Font Size", "Font Weight", "Font Style", "Text Transform", "Text Alignment", "Text Decoration", "Line Height", "Letter Spacing"}},
	{Title: "5. CSS Box Model", Lessons: []string{"Margin", "Border", "Padding", "Content", "Box Sizing"}},
	{Title: "6. CSS Layout", Lessons: []string{"Display Property", "Position (Static, Relative, Absolute, Fixed, Sticky)", "Float", "Clear", "Overflow", "Z-index"}},
	{Title: "7. CSS Flexbox", Lessons: []string{"Flex Container", "Flex Items", "Flex Direction", "Justify Content", "Align Items", "Flex Wrap", "Align Content", "Order", "Flex Grow / Shrink"}},
	{Title: "8. CSS Grid", Lessons: []string{"Grid Container", "Grid Items", "Grid Template Columns", "Grid Template Rows", "Grid Gap", "Grid Area", "Align Items", "Justify Items"}},
	{Title: "9. Responsive Design", Lessons: []string{"Media Queries", "Responsive Units (%, em / rem, vw / vh)", "Mobile First Approach", "Breakpoints"}},
	{Title: "10. CSS Transitions & Animations", Lessons: []string{"Transitions", "Transform", "Animations", "Keyframes", "Timing Functions"}},
	{Title: "11. CSS Preprocessors", Lessons: []string{"Sass / SCSS", "Less", "Advantages"}},
	{Title: "12. Best Practices", Lessons: []string{"Organize CSS", "Naming Conventions", "Minify CSS", "Performance Tips"}},
}

var jsCurriculumData = []SeedTopic{
	{Title: "1. JS Introduction", Lessons: []string{"What is JavaScript?", "History of JavaScript", "How JS Works?", "JS in Browser"}},
	{Title: "2. JS Basics", Lessons: []string{"Variables (var, let, const)", "Data Types", "Operators", "Comments", "Type Coercion"}},
	{Title: "3. Control Flow", Lessons: []string{"if...else", "else if Ladder", "switch case", "Ternary Operator", "Loops", "break / continue"}},
	{Title: "4. Functions", Lessons: []string{"Function Declaration", "Function Expression", "Arrow Functions", "Default Parameters", "Rest Parameters", "Callback Functions"}},
	{Title: "5. Arrays", Lessons: []string{"Create Arrays", "Access Elements", "Array Methods", "Destructuring Arrays"}},
	{Title: "6. Objects", Lessons: []string{"Create Objects", "Access Properties", "Object Methods", "this Keyword", "Object Destructuring", "Nested Objects"}},
	{Title: "7. DOM Manipulation", Lessons: []string{"Select Elements", "Change Content", "Change Styles", "Add / Remove Elements", "Event Handling"}},
	{Title: "8. Events", Lessons: []string{"Mouse Events", "Keyboard Events", "Form Events", "Event Bubbling", "Event Delegation"}},
	{Title: "9. Browser Storage", Lessons: []string{"Local Storage", "Session Storage", "Cookies"}},
	{Title: "10. Asynchronous JS", Lessons: []string{"Callbacks", "Promises", "Async / Await", "Fetch API", "Error Handling"}},
	{Title: "11. JS Advanced Topics", Lessons: []string{"Closures", "Scope & Scope Chain", "Hoisting", "Prototypes & Inheritance", "ES6+ Features"}},
	{Title: "12. Best Practices", Lessons: []string{"Write Clean Code", "Naming Conventions", "Avoid Global Scope", "Performance Optimization", "Debugging Tips"}},
}
