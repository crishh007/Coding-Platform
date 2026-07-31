package main

import (
	"context"
	"log"
	"fmt"
	"strings"
	"math/rand"

	"codemastery-learning-system/config"
	"codemastery-learning-system/database"
	"codemastery-learning-system/handlers"
	"codemastery-learning-system/models"
)

// statsForDifficulty returns deterministic submission / accepted counts for a given difficulty.
func statsForDifficulty(diff string) (submissions, accepted int) {
    switch diff {
    case "Easy":
        submissions = 8000
        accepted = int(0.72 * float64(submissions)) // ≈ 5760
    case "Medium":
        submissions = 5000
        accepted = int(0.49 * float64(submissions)) // ≈ 2450
    case "Hard":
        submissions = 2000
        accepted = int(0.28 * float64(submissions)) // ≈ 560
    default:
        submissions, accepted = 0, 0
    }
    return
}

func generatePracticeTestCases(title, description string) []models.PracticeTestCase {
    // Create a deterministic random source from the problem title.
    var seed int64
    for _, r := range title {
        seed = seed*31 + int64(r)
    }
    rnd := rand.New(rand.NewSource(seed))

    lower := strings.ToLower(title)
    var cases []models.PracticeTestCase

    switch {
    case strings.Contains(lower, "sum"):
        // Visible examples (sum of two numbers)
        cases = []models.PracticeTestCase{{Input: "3 5", Output: "8"}, {Input: "-2 10", Output: "8"}, {Input: "0 0", Output: "0"}}
        // Hidden edge cases
        for i := 0; i < 10; i++ {
            a := rnd.Intn(2000) - 1000 // range [-1000,1000]
            b := rnd.Intn(2000) - 1000
            cases = append(cases, models.PracticeTestCase{Input: fmt.Sprintf("%d %d", a, b), Output: fmt.Sprintf("%d", a+b)})
        }
    case strings.Contains(lower, "average"):
        cases = []models.PracticeTestCase{{Input: "3 4 5", Output: "4"}, {Input: "10 20 30", Output: "20"}, {Input: "0 0 0", Output: "0"}}
        for i := 0; i < 10; i++ {
            a := rnd.Intn(2000) - 1000
            b := rnd.Intn(2000) - 1000
            c := rnd.Intn(2000) - 1000
            sum := a + b + c
            avg := sum / 3
            cases = append(cases, models.PracticeTestCase{Input: fmt.Sprintf("%d %d %d", a, b, c), Output: fmt.Sprintf("%d", avg)})
        }
    case strings.Contains(lower, "array"):
        cases = []models.PracticeTestCase{{Input: "5 1 2 3 4 5", Output: "15"}, {Input: "3 -1 -2 -3", Output: "-6"}, {Input: "1 0", Output: "0"}}
        for i := 0; i < 10; i++ {
            n := rnd.Intn(10) + 1 // size 1‑10
            arr := make([]int, n)
            sum := 0
            for j := 0; j < n; j++ {
                v := rnd.Intn(2000) - 1000
                arr[j] = v
                sum += v
            }
            // Build input string: first token is length, then elements
            parts := []string{fmt.Sprintf("%d", n)}
            for _, v := range arr {
                parts = append(parts, fmt.Sprintf("%d", v))
            }
            cases = append(cases, models.PracticeTestCase{Input: strings.Join(parts, " "), Output: fmt.Sprintf("%d", sum)})
        }
    case strings.Contains(lower, "palindrome"):
        cases = []models.PracticeTestCase{{Input: "racecar", Output: "true"}, {Input: "hello", Output: "false"}, {Input: "A", Output: "true"}}
        for i := 0; i < 10; i++ {
            // generate random strings of length 1‑15
            l := rnd.Intn(15) + 1
            sb := strings.Builder{}
            for j := 0; j < l; j++ {
                ch := rune(rnd.Intn(26) + 97) // a‑z
                sb.WriteRune(ch)
            }
            s := sb.String()
            // check palindrome
            rev := reverseString(s)
            isPal := "false"
            if s == rev {
                isPal = "true"
            }
            cases = append(cases, models.PracticeTestCase{Input: s, Output: isPal})
        }
    default:
        // Generic numeric pair fallback – first three are simple examples
        cases = []models.PracticeTestCase{{Input: "1 2", Output: "3"}, {Input: "-5 5", Output: "0"}, {Input: "0 0", Output: "0"}}
        for i := 0; i < 10; i++ {
            a := rnd.Intn(2000) - 1000
            b := rnd.Intn(2000) - 1000
            cases = append(cases, models.PracticeTestCase{Input: fmt.Sprintf("%d %d", a, b), Output: fmt.Sprintf("%d", a+b)})
        }
    }
    // Ensure exactly 13 cases (first three visible, rest hidden)
    if len(cases) > 13 {
        cases = cases[:13]
    }
    return cases
}

// reverseString returns the reversed version of s.
func reverseString(s string) string {
    r := []rune(s)
    for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]
    }
    return string(r)
}

func main() {
	cfg := config.LoadConfig()
	db := database.InitDB(cfg)
	ctx := context.Background()

	log.Println("Wiping old collections...")
	db.Collection("courses").Drop(ctx)
	db.Collection("topics").Drop(ctx)
	db.Collection("lessons").Drop(ctx)
	db.Collection("career_paths").Drop(ctx)

	log.Println("Seeding Curriculum Database...")

	coursesData := []struct {
		Title string
		Data  []SeedTopic
	}{
		{"Data Structures & Algorithms", dsaCurriculumData},
		{"Complete Java Course", javaCurriculumData},
		{"Complete C++ Course", cppCurriculumData},
		{"Complete Python Course", pythonCurriculumData},
		{"Complete HTML Course", htmlCurriculumData},
		{"Complete CSS Course", cssCurriculumData},
		{"Complete JavaScript Course", jsCurriculumData},
	}

	courseIDMap := make(map[string]string)

	for _, c := range coursesData {
		log.Printf("Seeding Course: %s...\n", c.Title)
		var courseTopics []models.CourseTopic

		for i, seedTopic := range c.Data {
		var topicLessons []models.TopicLesson

		for j, lessonTitle := range seedTopic.Lessons {
			var lesson models.Lesson

			slug := generateSlug(lessonTitle)

			if lessonTitle == "Binary Search" {
				// FULLY IMPLEMENTED BINARY SEARCH LESSON
				lesson = models.Lesson{
					Title:         "Binary Search",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 15,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Binary search is a fast search algorithm with run time complexity of O(log n). This search algorithen works on the principle of divide and conquer. For this algorithm to work properly, the data collection should be in a sorted form.",
						RealWorldAnalogy: "Imagine searching for a word in a dictionary. You don't read every page from the beginning, Instead, you open the book to the midde. I the ward you're locking for comes before the page you're on, you ignore the second half of the book and lock only in the first half, You repeat this process untl you find the word.",
						KeySteps: []string{
							"Initialize low and high",
							"Find mid",
							"Compare target",
							"Move pointers",
						},
						ProTip: "Avoid overflow using low + (high-low)/2",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "binary-search",
						Config: map[string]interface{}{
							"array":  []int{1, 2, 3, 4, 5, 6, 7, 8, 9},
							"target": 7,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "low = 0, high = len(A) - 1"},
							{Line: 2, Text: "while low <= high do"},
							{Line: 3, Text: "    mid = low + (high - low) / 2"},
							{Line: 4, Text: "    if A[mid] == target then"},
							{Line: 5, Text: "        return mid"},
							{Line: 6, Text: "    else if A[mid] < target then"},
							{Line: 7, Text: "        low = mid + 1"},
							{Line: 8, Text: "    else"},
							{Line: 9, Text: "        high = mid - 1"},
							{Line: 10, Text: "return -1"},
						},
					},
					Sandbox: models.LessonSandbox{
						Languages: map[string]string{
							"python":     "def binary_search(arr, target, left, right):\n    # Write your recursive binary search here\n    pass",
							"javascript": "function binarySearch(arr, target, left, right) {\n    // Write your recursive binary search here\n}",
							"cpp":        "#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& arr, int target, int left, int right) {\n    // Write your recursive binary search here\n}",
							"c":          "int binarySearch(int arr[], int target, int left, int right) {\n    // Write your recursive binary search here\n}",
							"java":       "public int binarySearch(int[] arr, int target, int left, int right) {\n    // Write your recursive binary search here\n}",
						},
						TestCases: []models.SandboxTestCase{
							{Input: "[1,2,3,4,5], 3", Output: "2"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Worst case complexity?",
								Options:  []string{"O(1)", "O(log n)", "O(n)", "O(n²)"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{
								ID: "pq_1",
								ProblemTitle: "1. Implement Binary Search",
								Description:  "Implement the recursive version of binary search.",
								StarterCode: map[string]interface{}{
									"python": "def binary_search(arr, target):\n    pass",
									"javascript": "function binarySearch(arr, target) {\n    // Write your code here\n}",
									"cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
									"java": "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
									"c": "int search(int* nums, int numsSize, int target) {\n    \n}",
								},
							},
							{
								ID: "pq_2",
								ProblemTitle: "2. First Bad Version",
								Description:  "You are a product manager and currently leading a team to develop a new product. Find the first bad version using binary search.",
								StarterCode: map[string]interface{}{
									"python": "def first_bad_version(n):\n    pass",
									"javascript": "var solution = function(isBadVersion) {\n    return function(n) {\n        \n    };\n};",
									"cpp": "class Solution {\npublic:\n    int firstBadVersion(int n) {\n        \n    }\n};",
									"java": "public class Solution extends VersionControl {\n    public int firstBadVersion(int n) {\n        \n    }\n}",
									"c": "int firstBadVersion(int n) {\n    \n}",
								},
							},
							{
								ID: "pq_3",
								ProblemTitle: "3. Search Insert Position",
								Description:  "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
								StarterCode: map[string]interface{}{
									"python": "def search_insert(nums, target):\n    pass",
									"javascript": "var searchInsert = function(nums, target) {\n    \n};",
									"cpp": "class Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        \n    }\n};",
									"java": "class Solution {\n    public int searchInsert(int[] nums, int target) {\n        \n    }\n}",
									"c": "int searchInsert(int* nums, int numsSize, int target) {\n    \n}",
								},
							},
							{
								ID: "pq_4",
								ProblemTitle: "4. Find Peak Element",
								Description:  "A peak element is an element that is strictly greater than its neighbors. Given an integer array nums, find a peak element, and return its index.",
								StarterCode: map[string]interface{}{
									"python": "def find_peak_element(nums):\n    pass",
									"javascript": "var findPeakElement = function(nums) {\n    \n};",
									"cpp": "class Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        \n    }\n};",
									"java": "class Solution {\n    public int findPeakElement(int[] nums) {\n        \n    }\n}",
									"c": "int findPeakElement(int* nums, int numsSize) {\n    \n}",
								},
							},
							{
								ID: "pq_5",
								ProblemTitle: "5. Search in Rotated Sorted Array",
								Description:  "There is an integer array nums sorted in ascending order (with distinct values). It is rotated at an unknown pivot index. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
								StarterCode: map[string]interface{}{
									"python": "def search_rotated(nums, target):\n    pass",
									"javascript": "var search = function(nums, target) {\n    \n};",
									"cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
									"java": "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
									"c": "int search(int* nums, int numsSize, int target) {\n    \n}",
								},
							},
						},
					},
				}
			} else if lessonTitle == "Variables and Data Types" || lessonTitle == "Variables" {
				lesson = models.Lesson{
					Title:         "Variables and Data Types",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 20,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Variables are named memory locations used to store values. Java supports primitive and reference data types.",
						RealWorldAnalogy: "Think of variables as labeled containers that hold different kinds of information like age, salary, or names.",
						KeySteps: []string{
							"Choose a data type",
							"Declare the variable",
							"Assign a value",
							"Access and modify the value",
						},
						ProTip: "Use the smallest appropriate data type to optimize memory usage.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "variables",
						Config: map[string]interface{}{
							"variableName": "age",
							"dataType":     "int",
							"value":        25,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Declare int age"},
							{Line: 2, Text: "Assign age = 25"},
							{Line: 3, Text: "Print age"},
						},
					},
					Sandbox: models.LessonSandbox{
						Languages: map[string]string{
							"java":       "int age = 25;\nSystem.out.println(age);",
							"cpp":        "int age = 25;\ncout << age;",
							"python":     "age = 25\nprint(age)",
							"javascript": "let age = 25;\nconsole.log(age);",
							"c":          "int age = 25;\nprintf(\"%d\", age);",
						},
						TestCases: []models.SandboxTestCase{
							{Input: "age = 25", Output: "25"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which is a primitive data type in Java?",
								Options:  []string{"String", "Object", "int", "Array"},
								Answer:   2,
							},
							{
								Question: "Which keyword creates a constant variable?",
								Options:  []string{"const", "final", "static", "constant"},
								Answer:   1,
							},
							{
								Question: "Which data type stores decimal values?",
								Options:  []string{"boolean", "char", "double", "int"},
								Answer:   2,
							},
							{
								Question: "Which one is a reference type?",
								Options:  []string{"float", "char", "String", "boolean"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{
								ID:           "pq_1",
								ProblemTitle: "Declare Variables",
								Description:  "Declare age, salary and grade variables.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_2",
								ProblemTitle: "Swap Two Numbers",
								Description:  "Swap two integer variables.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_3",
								ProblemTitle: "Area of Circle",
								Description:  "Calculate area using radius.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_4",
								ProblemTitle: "Temperature Conversion",
								Description:  "Convert Celsius to Fahrenheit.",
								StarterCode:  map[string]interface{}{},
							},
						},
					},
				}
			} else if lessonTitle == "Operators" {
				lesson = models.Lesson{
					Title:         "Operators",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 20,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Operators perform arithmetic, comparison, logical and bitwise operations.",
						RealWorldAnalogy: "Operators are tools that manipulate values and produce results.",
						KeySteps: []string{
							"Initialize operands",
							"Apply operator",
							"Evaluate expression",
							"Store result",
						},
						ProTip: "Remember operator precedence to avoid unexpected results.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "operators",
						Config: map[string]interface{}{
							"a": 10,
							"b": 5,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Initialize a = 10 and b = 5"},
							{Line: 2, Text: "sum = a + b"},
							{Line: 3, Text: "Print sum"},
						},
					},
					Sandbox: models.LessonSandbox{
						Languages: map[string]string{
							"java":       "int a=10,b=5;\nSystem.out.println(a+b);",
							"cpp":        "int a=10,b=5;\ncout<<a+b;",
							"python":     "a=10\nb=5\nprint(a+b)",
							"javascript": "let a=10,b=5;\nconsole.log(a+b);",
							"c":          "int a=10,b=5;\nprintf(\"%d\",a+b);",
						},
						TestCases: []models.SandboxTestCase{
							{Input: "10 5", Output: "15"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Result of 10 % 3 ?",
								Options:  []string{"1", "3", "0", "10"},
								Answer:   0,
							},
							{
								Question: "Which operator is used for logical AND?",
								Options:  []string{"&", "&&", "||", "!"},
								Answer:   1,
							},
							{
								Question: "Which operator compares equality?",
								Options:  []string{"=", "==", "!=", "+="},
								Answer:   1,
							},
							{
								Question: "Which operator increments a variable?",
								Options:  []string{"++", "--", "+=", "*"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{
								ID:           "pq_1",
								ProblemTitle: "Simple Calculator",
								Description:  "Perform arithmetic operations.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_2",
								ProblemTitle: "Even or Odd",
								Description:  "Check whether a number is even or odd.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_3",
								ProblemTitle: "Maximum of Two Numbers",
								Description:  "Find the larger number.",
								StarterCode:  map[string]interface{}{},
							},
							{
								ID:           "pq_4",
								ProblemTitle: "Swap Without Temporary Variable",
								Description:  "Swap two numbers using operators.",
								StarterCode:  map[string]interface{}{},
							},
						},
					},
				}
			} else if lessonTitle == "Input Output" || lessonTitle == "Input/Output" {
				lesson = models.Lesson{
					Title:         "Input Output",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 20,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Input and output operations enable interaction between the user and the program.",
						RealWorldAnalogy: "Keyboard provides input while the screen displays output.",
						KeySteps: []string{
							"Create Scanner object",
							"Read input",
							"Store values",
							"Display output",
						},
						ProTip: "Close Scanner objects after use to prevent resource leaks.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "input-output",
						Config: map[string]interface{}{
							"input": 7,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create Scanner object"},
							{Line: 2, Text: "Read integer n"},
							{Line: 3, Text: "Print n"},
						},
					},
					Sandbox: models.LessonSandbox{
						Languages: map[string]string{
							"java":       "Scanner sc = new Scanner(System.in);\nint n=sc.nextInt();\nSystem.out.println(n);",
							"cpp":        "int n;\ncin>>n;\ncout<<n;",
							"python":     "n=int(input())\nprint(n)",
							"javascript": "let n=prompt();\nconsole.log(n);",
							"c":          "int n;\nscanf(\"%d\",&n);\nprintf(\"%d\",n);",
						},
						TestCases: []models.SandboxTestCase{
							{Input: "7", Output: "7"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which class is commonly used for input in Java?",
								Options:  []string{"Math", "Scanner", "String", "System"},
								Answer:   1,
							},
							{
								Question: "Which statement prints output?",
								Options:  []string{"System.input()", "System.println()", "System.out.println()", "Scanner.print()"},
								Answer:   2,
							},
							{
								Question: "Which method reads an integer using Scanner?",
								Options:  []string{"readInt()", "getInt()", "nextInt()", "inputInt()"},
								Answer:   2,
							},
							{
								Question: "Which package contains Scanner?",
								Options:  []string{"java.io", "java.util", "java.lang", "java.math"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Sum of Two Numbers", Description: "Read two integers and print their sum.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Average of Three Numbers", Description: "Read three numbers and find average.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Simple Interest", Description: "Calculate simple interest from user input.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Grade Calculator", Description: "Read marks and display grade.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Type Casting" {
				lesson = models.Lesson{
					Title:         "Type Casting",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 20,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Type casting converts one data type into another. Java supports implicit (widening) and explicit (narrowing) conversions.",
						RealWorldAnalogy: "Think of pouring water from a small glass into a large bucket (widening) or squeezing water from a bucket into a glass (narrowing).",
						KeySteps: []string{
							"Identify source type",
							"Choose target type",
							"Perform implicit or explicit conversion",
							"Use converted value",
						},
						ProTip: "Explicit casting may result in loss of precision.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "type-casting",
						Config: map[string]interface{}{
							"source": "double",
							"value":  10.75,
							"target": "int",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Initialize double x = 10.75"},
							{Line: 2, Text: "Cast x to int"},
							{Line: 3, Text: "Store result in y"},
							{Line: 4, Text: "Print y"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which casting happens automatically?",
								Options:  []string{"Explicit", "Narrowing", "Widening", "Manual"},
								Answer:   2,
							},
							{
								Question: "What is (int)9.8?",
								Options:  []string{"10", "9", "9.8", "8"},
								Answer:   1,
							},
							{
								Question: "Which conversion may lose data?",
								Options:  []string{"Widening", "Implicit", "Narrowing", "Automatic"},
								Answer:   2,
							},
							{
								Question: "Which type is larger than int?",
								Options:  []string{"byte", "short", "char", "long"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Double to Integer", Description: "Convert a double into an integer.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Integer to Double", Description: "Convert an integer into a double.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "ASCII Value", Description: "Convert a character into its ASCII value.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Temperature Conversion", Description: "Convert integer temperature into double precision.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Arrays" {
				lesson = models.Lesson{
					Title:         "Arrays",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 30,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Arrays store multiple elements of the same type in contiguous memory locations.",
						RealWorldAnalogy: "Think of an apartment building where each apartment number represents an array index.",
						KeySteps: []string{
							"Declare array",
							"Initialize array",
							"Access elements using index",
							"Traverse array",
						},
						ProTip: "Array indexing starts from 0.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "array",
						Config: map[string]interface{}{
							"array": []int{10, 20, 30, 40},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create array arr = [10,20,30,40]"},
							{Line: 2, Text: "Access arr[2]"},
							{Line: 3, Text: "Return 30"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Array indexing starts from?",
								Options:  []string{"1", "-1", "0", "2"},
								Answer:   2,
							},
							{
								Question: "How to access the third element?",
								Options:  []string{"arr[3]", "arr(3)", "arr[2]", "arr[1]"},
								Answer:   2,
							},
							{
								Question: "Can arrays store different data types?",
								Options:  []string{"Always", "No", "Sometimes", "Only String"},
								Answer:   1,
							},
							{
								Question: "Which property gives array length in Java?",
								Options:  []string{"size()", "count()", "length", "length()"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Find Sum of Array", Description: "Calculate the sum of all array elements.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Find Maximum Element", Description: "Find the largest element in an array.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Reverse Array", Description: "Reverse an array.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Count Even Numbers", Description: "Count even elements in an array.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Strings" {
				lesson = models.Lesson{
					Title:         "Strings",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 30,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Strings are sequences of characters used to represent text.",
						RealWorldAnalogy: "A string is like a word made up of individual letters arranged in order.",
						KeySteps: []string{
							"Create string",
							"Access characters",
							"Perform operations",
							"Manipulate text",
						},
						ProTip: "Strings are immutable in Java.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "string",
						Config: map[string]interface{}{
							"string": "HELLO",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create string HELLO"},
							{Line: 2, Text: "Access character at index 1"},
							{Line: 3, Text: "Return E"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Strings in Java are?",
								Options:  []string{"Mutable", "Immutable", "Dynamic", "Numeric"},
								Answer:   1,
							},
							{
								Question: "Which method returns string length?",
								Options:  []string{"size()", "length()", "count()", "len()"},
								Answer:   1,
							},
							{
								Question: "Index of first character is?",
								Options:  []string{"1", "0", "-1", "2"},
								Answer:   1,
							},
							{
								Question: "Which method compares strings?",
								Options:  []string{"==", "compare()", "equals()", "same()"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Reverse String", Description: "Reverse a given string.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Palindrome String", Description: "Check whether a string is palindrome.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Count Vowels", Description: "Count vowels in a string.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Character Frequency", Description: "Count occurrences of each character.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Conditional Statements" {
				lesson = models.Lesson{
					Title:         "Conditional Statements",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 30,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Conditional statements control the flow of execution based on conditions.",
						RealWorldAnalogy: "Like traffic lights deciding whether cars should stop or go.",
						KeySteps: []string{
							"Evaluate condition",
							"Execute if block",
							"Execute else block if needed",
							"Continue execution",
						},
						ProTip: "Use switch statements when dealing with multiple fixed choices.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "if-else",
						Config: map[string]interface{}{
							"age": 20,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Read age"},
							{Line: 2, Text: "If age >= 18"},
							{Line: 3, Text: "Print Adult"},
							{Line: 4, Text: "Else print Minor"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword is used for alternate execution?",
								Options:  []string{"switch", "for", "else", "break"},
								Answer:   2,
							},
							{
								Question: "Which statement handles multiple choices?",
								Options:  []string{"if", "switch", "while", "do"},
								Answer:   1,
							},
							{
								Question: "Which operator is commonly used in conditions?",
								Options:  []string{"+", "%", "==", "*"},
								Answer:   2,
							},
							{
								Question: "Nested if means?",
								Options:  []string{"if inside another if", "loop inside if", "switch inside loop", "multiple loops"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Even or Odd", Description: "Determine whether a number is even or odd.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Largest of Three Numbers", Description: "Find the largest among three numbers.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Leap Year Checker", Description: "Determine whether a year is a leap year.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Grade Calculator", Description: "Print grades based on marks.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Loops" {
				lesson = models.Lesson{
					Title:         "Loops",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 35,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Loops repeatedly execute a block of code until a condition becomes false.",
						RealWorldAnalogy: "Like climbing stairs one step at a time until you reach the top.",
						KeySteps: []string{
							"Initialize variable",
							"Check condition",
							"Execute body",
							"Update variable",
						},
						ProTip: "Avoid infinite loops by ensuring loop variables are updated.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "for-loop",
						Config: map[string]interface{}{
							"start": 1,
							"end":   5,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Initialize i = 1"},
							{Line: 2, Text: "Check i <= 5"},
							{Line: 3, Text: "Print i"},
							{Line: 4, Text: "Increment i"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which loop executes at least once?",
								Options:  []string{"for", "while", "do-while", "foreach"},
								Answer:   2,
							},
							{
								Question: "Which keyword exits a loop?",
								Options:  []string{"skip", "break", "stop", "return"},
								Answer:   1,
							},
							{
								Question: "Which keyword skips the current iteration?",
								Options:  []string{"continue", "break", "pass", "skip"},
								Answer:   0,
							},
							{
								Question: "How many times does for(i=0;i<3;i++) execute?",
								Options:  []string{"2", "3", "4", "5"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Print Numbers 1 to N", Description: "Print numbers from 1 to N.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Factorial of a Number", Description: "Find factorial using loops.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Sum of Digits", Description: "Calculate sum of digits of a number.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Fibonacci Series", Description: "Print first N Fibonacci numbers.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Pattern Printing" {
				lesson = models.Lesson{
					Title:         "Pattern Printing",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Pattern printing develops nested loop understanding and logical thinking.",
						RealWorldAnalogy: "Like arranging bricks row by row to form shapes.",
						KeySteps: []string{
							"Identify rows",
							"Identify columns",
							"Apply nested loops",
							"Print pattern",
						},
						ProTip: "Always think in terms of rows and columns before coding patterns.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "star-pattern",
						Config: map[string]interface{}{
							"rows": 4,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "For i from 1 to rows"},
							{Line: 2, Text: "For j from 1 to i"},
							{Line: 3, Text: "Print *"},
							{Line: 4, Text: "Move to next line"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Pattern printing mainly uses?",
								Options:  []string{"Arrays", "Functions", "Nested loops", "Recursion"},
								Answer:   2,
							},
							{
								Question: "A triangle pattern with 5 rows prints how many stars in row 5?",
								Options:  []string{"4", "5", "6", "10"},
								Answer:   1,
							},
							{
								Question: "Which loop is usually inside another loop?",
								Options:  []string{"Nested loop", "while loop", "do-while", "switch"},
								Answer:   0,
							},
							{
								Question: "Patterns improve understanding of?",
								Options:  []string{"Inheritance", "Loops", "Files", "Threads"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Right Triangle Star Pattern", Description: "Print a right-angled star pattern.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Pyramid Pattern", Description: "Print a pyramid using stars.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Number Triangle Pattern", Description: "Print number triangle pattern.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Diamond Pattern", Description: "Print a diamond pattern.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Methods" || lessonTitle == "Methods (Functions)" || lessonTitle == "Functions" {
				lesson = models.Lesson{
					Title:         "Methods (Functions)",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 35,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Methods are reusable blocks of code that perform specific tasks and improve modularity.",
						RealWorldAnalogy: "Think of methods as appliances in a kitchen. You use the blender whenever you need to blend something instead of building it every time.",
						KeySteps: []string{
							"Define method",
							"Pass parameters",
							"Execute statements",
							"Return result",
						},
						ProTip: "Keep methods small and focused on one task.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "function-call",
						Config: map[string]interface{}{
							"functionName": "add",
							"arguments":    []int{5, 3},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Define add(a,b)"},
							{Line: 2, Text: "Return a+b"},
							{Line: 3, Text: "Call add(5,3)"},
							{Line: 4, Text: "Print result 8"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword is used to return a value?",
								Options:  []string{"break", "continue", "return", "exit"},
								Answer:   2,
							},
							{
								Question: "Methods help in?",
								Options:  []string{"Code duplication", "Code reusability", "Memory leakage", "Compilation"},
								Answer:   1,
							},
							{
								Question: "Parameters are?",
								Options:  []string{"Variables passed to methods", "Loops", "Objects", "Packages"},
								Answer:   0,
							},
							{
								Question: "A method with no return value uses?",
								Options:  []string{"int", "String", "void", "null"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Sum of Two Numbers", Description: "Create a method to add two integers.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Factorial Function", Description: "Create a function to calculate factorial.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Prime Checker", Description: "Write a method that checks if a number is prime.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Maximum of Three Numbers", Description: "Return the maximum among three numbers.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Recursion" {
				lesson = models.Lesson{
					Title:         "Recursion",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Recursion is a technique where a method calls itself to solve smaller subproblems.",
						RealWorldAnalogy: "Think of Russian dolls where each doll contains another smaller doll.",
						KeySteps: []string{
							"Identify base case",
							"Reduce problem size",
							"Call method recursively",
							"Combine results",
						},
						ProTip: "Every recursive function must have a base case to avoid infinite recursion.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "recursion",
						Config: map[string]interface{}{
							"n": 4,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "factorial(4)"},
							{Line: 2, Text: "4 × factorial(3)"},
							{Line: 3, Text: "3 × factorial(2)"},
							{Line: 4, Text: "Base case factorial(1)=1"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "What is necessary in recursion?",
								Options:  []string{"Loop", "Base case", "Array", "Switch"},
								Answer:   1,
							},
							{
								Question: "Recursion uses?",
								Options:  []string{"Queue", "Heap", "Stack", "HashMap"},
								Answer:   2,
							},
							{
								Question: "factorial(0) equals?",
								Options:  []string{"0", "1", "Undefined", "-1"},
								Answer:   1,
							},
							{
								Question: "Infinite recursion causes?",
								Options:  []string{"Syntax error", "Stack Overflow", "Compile error", "Loop exit"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Factorial Using Recursion", Description: "Calculate factorial recursively.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Fibonacci Number", Description: "Find nth Fibonacci number recursively.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Sum of Natural Numbers", Description: "Find sum from 1 to n using recursion.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Power Function", Description: "Calculate x^n recursively.", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Time Complexity" || lessonTitle == "Time Complexity and Big-O Analysis" {
				lesson = models.Lesson{
					Title:         "Time Complexity and Big-O Analysis",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Time complexity measures how algorithm performance changes with input size.",
						RealWorldAnalogy: "Finding a word in a dictionary is faster than reading every page one by one.",
						KeySteps: []string{
							"Count operations",
							"Ignore constants",
							"Keep dominant term",
							"Express using Big-O notation",
						},
						ProTip: "Focus on growth rate rather than exact execution time.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "big-o",
						Config: map[string]interface{}{
							"inputSize": 100,
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Single loop → O(n)"},
							{Line: 2, Text: "Nested loops → O(n²)"},
							{Line: 3, Text: "Binary search → O(log n)"},
							{Line: 4, Text: "Constant access → O(1)"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Complexity of binary search is?",
								Options:  []string{"O(n²)", "O(log n)", "O(n)", "O(1)"},
								Answer:   1,
							},
							{
								Question: "Two nested loops generally give?",
								Options:  []string{"O(1)", "O(log n)", "O(n)", "O(n²)"},
								Answer:   3,
							},
							{
								Question: "Array indexing complexity is?",
								Options:  []string{"O(1)", "O(n)", "O(log n)", "O(n²)"},
								Answer:   0,
							},
							{
								Question: "Linear search complexity is?",
								Options:  []string{"O(log n)", "O(n²)", "O(n)", "O(1)"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Analyze Single Loop", Description: "Determine the complexity of a single loop.", StarterCode: map[string]interface{}{}},
							{ID: "pq_2", ProblemTitle: "Nested Loop Complexity", Description: "Find complexity of nested loops.", StarterCode: map[string]interface{}{}},
							{ID: "pq_3", ProblemTitle: "Binary Search Complexity", Description: "Analyze binary search algorithm.", StarterCode: map[string]interface{}{}},
							{ID: "pq_4", ProblemTitle: "Compare Algorithms", Description: "Compare O(n), O(log n), and O(n²).", StarterCode: map[string]interface{}{}},
						},
					},
				}
			} else if lessonTitle == "Classes and Objects" {
				lesson = models.Lesson{
					Title:         "Classes and Objects",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Classes are blueprints for creating objects. Objects are instances of classes containing data and behavior.",
						RealWorldAnalogy: "A class is like a blueprint of a house, while an object is the actual house built from that blueprint.",
						KeySteps: []string{
							"Define a class",
							"Declare fields",
							"Define methods",
							"Create objects using new keyword",
						},
						ProTip: "Keep classes focused on a single responsibility.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "class-object",
						Config: map[string]interface{}{
							"class":  "Student",
							"object": "s1",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Define Student class"},
							{Line: 2, Text: "Add name and age fields"},
							{Line: 3, Text: "Create object s1"},
							{Line: 4, Text: "Access object properties"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "An object is an instance of?",
								Options:  []string{"Method", "Class", "Package", "Constructor"},
								Answer:   1,
							},
							{
								Question: "Which keyword creates an object?",
								Options:  []string{"class", "this", "new", "super"},
								Answer:   2,
							},
							{
								Question: "A class is a?",
								Options:  []string{"Blueprint", "Variable", "Loop", "Operator"},
								Answer:   0,
							},
							{
								Question: "Objects contain?",
								Options:  []string{"Fields and Methods", "Packages", "Interfaces", "Libraries"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Student Class", Description: "Create a Student class with name and age.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Car Class", Description: "Create a Car class and instantiate objects.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Rectangle Area", Description: "Create a Rectangle class and calculate area.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Bank Account", Description: "Create a BankAccount class with deposit functionality.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Constructors" {
				lesson = models.Lesson{
					Title:         "Constructors",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 35,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Constructors initialize objects when they are created.",
						RealWorldAnalogy: "Like filling in details on a registration form when a new account is created.",
						KeySteps: []string{
							"Declare constructor",
							"Initialize fields",
							"Create object",
							"Automatically invoke constructor",
						},
						ProTip: "Use constructors to ensure objects are initialized correctly.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "constructor",
						Config: map[string]interface{}{
							"class":       "Employee",
							"constructor": "Employee()",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Define Employee class"},
							{Line: 2, Text: "Create constructor"},
							{Line: 3, Text: "Initialize fields"},
							{Line: 4, Text: "Create object using new"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "When is a constructor called?",
								Options:  []string{"During compilation", "When object is created", "When method ends", "Never automatically"},
								Answer:   1,
							},
							{
								Question: "Can constructors have parameters?",
								Options:  []string{"No", "Yes", "Only int", "Only String"},
								Answer:   1,
							},
							{
								Question: "Constructor name should match?",
								Options:  []string{"Package name", "Method name", "Class name", "Variable name"},
								Answer:   2,
							},
							{
								Question: "Which constructor has no parameters?",
								Options:  []string{"Parameterized", "Static", "Default", "Final"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Default Constructor", Description: "Create a class with a default constructor.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Parameterized Constructor", Description: "Initialize object values through constructor parameters.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Book Class", Description: "Create Book objects using constructors.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Employee Class", Description: "Use multiple constructors for Employee class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Encapsulation" {
				lesson = models.Lesson{
					Title:         "Encapsulation",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Encapsulation hides internal data and provides controlled access using getters and setters.",
						RealWorldAnalogy: "Like an ATM machine where users interact through buttons without knowing internal operations.",
						KeySteps: []string{
							"Declare fields private",
							"Create getter methods",
							"Create setter methods",
							"Control data access",
						},
						ProTip: "Encapsulation improves security and maintainability.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "encapsulation",
						Config: map[string]interface{}{
							"field":  "balance",
							"access": "private",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Declare private balance"},
							{Line: 2, Text: "Create getBalance()"},
							{Line: 3, Text: "Create setBalance()"},
							{Line: 4, Text: "Access data through methods"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which access modifier is commonly used for encapsulation?",
								Options:  []string{"public", "private", "protected", "default"},
								Answer:   1,
							},
							{
								Question: "Getters are used to?",
								Options:  []string{"Modify data", "Read data", "Delete data", "Create objects"},
								Answer:   1,
							},
							{
								Question: "Setters are used to?",
								Options:  []string{"Read values", "Initialize loops", "Update values", "Destroy objects"},
								Answer:   2,
							},
							{
								Question: "Encapsulation mainly provides?",
								Options:  []string{"Inheritance", "Security", "Polymorphism", "Abstraction"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Student Encapsulation", Description: "Create private fields with getters and setters.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Bank Account", Description: "Protect account balance using encapsulation.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Employee Class", Description: "Restrict direct access to salary.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Person Class", Description: "Implement encapsulation with validation.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Inheritance" {
				lesson = models.Lesson{
					Title:         "Inheritance",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Inheritance allows one class to acquire properties and behaviors of another class, promoting code reuse.",
						RealWorldAnalogy: "A child inherits traits from parents, such as eye color or height.",
						KeySteps: []string{
							"Create parent class",
							"Create child class using extends keyword",
							"Inherit fields and methods",
							"Add specialized behavior",
						},
						ProTip: "Favor inheritance only when there is a true 'is-a' relationship.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "inheritance",
						Config: map[string]interface{}{
							"parentClass": "Animal",
							"childClass":  "Dog",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Define Animal class"},
							{Line: 2, Text: "Define Dog extends Animal"},
							{Line: 3, Text: "Dog inherits Animal methods"},
							{Line: 4, Text: "Dog adds its own behavior"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword is used for inheritance in Java?",
								Options:  []string{"implements", "inherits", "extends", "super"},
								Answer:   2,
							},
							{
								Question: "Inheritance promotes?",
								Options:  []string{"Code duplication", "Code reuse", "Compilation", "Encapsulation"},
								Answer:   1,
							},
							{
								Question: "Java supports how many classes in multiple inheritance?",
								Options:  []string{"0", "1", "2", "Unlimited"},
								Answer:   1,
							},
							{
								Question: "Which keyword refers to parent class members?",
								Options:  []string{"this", "base", "parent", "super"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Animal and Dog", Description: "Create Dog class inheriting Animal class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Vehicle Hierarchy", Description: "Implement Car class extending Vehicle.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Employee and Manager", Description: "Create Manager class inheriting Employee.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Shape Hierarchy", Description: "Implement Circle and Rectangle derived from Shape.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Polymorphism" {
				lesson = models.Lesson{
					Title:         "Polymorphism",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Polymorphism allows one interface to represent many forms. It is achieved through method overloading and method overriding.",
						RealWorldAnalogy: "A person can be a teacher, parent, or friend depending on the situation.",
						KeySteps: []string{
							"Create common interface",
							"Define multiple implementations",
							"Invoke methods through common reference",
							"Execute appropriate behavior",
						},
						ProTip: "Method overriding enables runtime polymorphism.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "polymorphism",
						Config: map[string]interface{}{
							"baseClass":      "Shape",
							"derivedClasses": []string{"Circle", "Rectangle"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create Shape reference"},
							{Line: 2, Text: "Assign Circle object"},
							{Line: 3, Text: "Call draw()"},
							{Line: 4, Text: "Circle draw() executes"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Method overriding provides?",
								Options:  []string{"Compile-time polymorphism", "Runtime polymorphism", "Inheritance", "Abstraction"},
								Answer:   1,
							},
							{
								Question: "Method overloading is decided at?",
								Options:  []string{"Runtime", "Compile time", "Execution time", "Loading time"},
								Answer:   1,
							},
							{
								Question: "Polymorphism means?",
								Options:  []string{"Many forms", "One form", "Inheritance only", "Data hiding"},
								Answer:   0,
							},
							{
								Question: "Which feature enables runtime polymorphism?",
								Options:  []string{"Overloading", "Overriding", "Constructors", "Interfaces"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Method Overloading", Description: "Create multiple add() methods.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Shape Area", Description: "Override area() method in Circle and Rectangle.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Animal Sounds", Description: "Implement sound() method for different animals.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Employee Salary", Description: "Calculate salaries using polymorphism.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Abstraction" {
				lesson = models.Lesson{
					Title:         "Abstraction",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Abstraction hides implementation details and exposes only essential features to the user.",
						RealWorldAnalogy: "When driving a car, you use the steering wheel and pedals without knowing the internal engine mechanics.",
						KeySteps: []string{
							"Identify essential behavior",
							"Create abstract class or interface",
							"Implement abstract methods",
							"Use objects through abstraction",
						},
						ProTip: "Prefer interfaces when defining capabilities shared across unrelated classes.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "abstraction",
						Config: map[string]interface{}{
							"abstractClass": "Shape",
							"concreteClass": "Circle",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create abstract Shape class"},
							{Line: 2, Text: "Declare abstract area()"},
							{Line: 3, Text: "Implement area() in Circle"},
							{Line: 4, Text: "Call area() using Shape reference"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword creates an abstract class?",
								Options:  []string{"interface", "abstract", "extends", "super"},
								Answer:   1,
							},
							{
								Question: "Can abstract classes have concrete methods?",
								Options:  []string{"No", "Yes", "Only static", "Only final"},
								Answer:   1,
							},
							{
								Question: "Which feature hides implementation details?",
								Options:  []string{"Inheritance", "Polymorphism", "Abstraction", "Encapsulation"},
								Answer:   2,
							},
							{
								Question: "Interfaces mainly provide?",
								Options:  []string{"Implementation", "Blueprint of behavior", "Variables only", "Constructors"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Shape Abstract Class", Description: "Implement Circle and Rectangle using abstract Shape.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Payment System", Description: "Create abstract Payment class with multiple payment methods.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Animal Interface", Description: "Implement different animals using interfaces.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Vehicle Interface", Description: "Create Vehicle interface and implement Car and Bike.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Interfaces" {
				lesson = models.Lesson{
					Title:         "Interfaces",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Interfaces define a contract that classes must implement. They support abstraction and multiple inheritance of behavior.",
						RealWorldAnalogy: "A remote control defines buttons and functions, while different TV brands implement those functions differently.",
						KeySteps: []string{
							"Declare interface",
							"Define abstract methods",
							"Implement interface in classes",
							"Override methods",
						},
						ProTip: "Use interfaces to achieve loose coupling and flexibility.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "interface",
						Config: map[string]interface{}{
							"interface":       "Animal",
							"implementations": []string{"Dog", "Cat"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create Animal interface"},
							{Line: 2, Text: "Declare sound()"},
							{Line: 3, Text: "Dog implements Animal"},
							{Line: 4, Text: "Override sound()"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword is used to inherit an interface?",
								Options:  []string{"extends", "inherits", "implements", "super"},
								Answer:   2,
							},
							{
								Question: "Can a class implement multiple interfaces?",
								Options:  []string{"No", "Yes", "Only two", "Only one"},
								Answer:   1,
							},
							{
								Question: "Interfaces mainly provide?",
								Options:  []string{"Implementation", "Behavior contract", "Constructors", "Variables"},
								Answer:   1,
							},
							{
								Question: "Methods in interfaces are public and?",
								Options:  []string{"private", "static", "abstract", "protected"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Animal Interface", Description: "Implement Dog and Cat classes using Animal interface.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Vehicle Interface", Description: "Create Car and Bike classes implementing Vehicle.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Payment Interface", Description: "Implement CreditCard and UPI payment systems.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Shape Interface", Description: "Implement Circle and Rectangle area calculations.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Packages" {
				lesson = models.Lesson{
					Title:         "Packages",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 30,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Packages organize related classes and interfaces into namespaces.",
						RealWorldAnalogy: "Like folders on your computer that group related files together.",
						KeySteps: []string{
							"Create package",
							"Place classes inside package",
							"Import package",
							"Use classes",
						},
						ProTip: "Packages help avoid naming conflicts and improve maintainability.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "packages",
						Config: map[string]interface{}{
							"package": "com.example.utils",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create package com.example.utils"},
							{Line: 2, Text: "Add Utility class"},
							{Line: 3, Text: "Import package"},
							{Line: 4, Text: "Use Utility methods"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which keyword creates a package?",
								Options:  []string{"import", "package", "namespace", "folder"},
								Answer:   1,
							},
							{
								Question: "Which keyword includes a package?",
								Options:  []string{"package", "using", "include", "import"},
								Answer:   3,
							},
							{
								Question: "Packages mainly help in?",
								Options:  []string{"Loops", "Organization", "Inheritance", "Polymorphism"},
								Answer:   1,
							},
							{
								Question: "java.util package contains?",
								Options:  []string{"Scanner", "Thread", "File", "Math"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Create Package", Description: "Create a custom package and class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Calculator Package", Description: "Organize arithmetic methods inside a package.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Employee Package", Description: "Group employee-related classes together.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Student Management Package", Description: "Create multiple classes under one package.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Exception Handling" || lessonTitle == "try-catch-finally" || lessonTitle == "Custom Exceptions" {
				lesson = models.Lesson{
					Title:         "Exception Handling",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Exception handling allows programs to deal with runtime errors gracefully.",
						RealWorldAnalogy: "Like wearing a seatbelt—it prepares you for unexpected situations.",
						KeySteps: []string{
							"Place risky code in try block",
							"Catch exceptions",
							"Handle errors",
							"Execute cleanup code using finally",
						},
						ProTip: "Catch only exceptions that you can actually handle.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "exception",
						Config: map[string]interface{}{
							"operation": "division",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Enter try block"},
							{Line: 2, Text: "Perform division"},
							{Line: 3, Text: "Catch ArithmeticException"},
							{Line: 4, Text: "Execute finally block"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which block contains risky code?",
								Options:  []string{"catch", "finally", "try", "throw"},
								Answer:   2,
							},
							{
								Question: "Which block always executes?",
								Options:  []string{"try", "catch", "throw", "finally"},
								Answer:   3,
							},
							{
								Question: "Which keyword manually throws exceptions?",
								Options:  []string{"throws", "throw", "catch", "finally"},
								Answer:   1,
							},
							{
								Question: "Division by zero throws?",
								Options:  []string{"IOException", "ArithmeticException", "NullPointerException", "SQLException"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Division by Zero", Description: "Handle ArithmeticException.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Array Index Exception", Description: "Catch ArrayIndexOutOfBoundsException.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Custom Exception", Description: "Create and throw a custom exception.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Multiple Catch Blocks", Description: "Handle different exceptions in one program.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "ArrayList" || lessonTitle == "List (ArrayList, LinkedList, Vector)" {
				lesson = models.Lesson{
					Title:         "ArrayList",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 40,
					Explanation: models.LessonExplanation{
						BriefOverview:    "ArrayList is a resizable array implementation provided by the Java Collections Framework.",
						RealWorldAnalogy: "Think of ArrayList as a shopping cart that automatically expands when you add more items.",
						KeySteps: []string{
							"Create ArrayList",
							"Add elements",
							"Access elements",
							"Remove or modify elements",
						},
						ProTip: "Use ArrayList when frequent random access is needed.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "arraylist",
						Config: map[string]interface{}{
							"elements": []int{10, 20, 30},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create ArrayList list"},
							{Line: 2, Text: "Add 10,20,30"},
							{Line: 3, Text: "Access list.get(1)"},
							{Line: 4, Text: "Return 20"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "ArrayList belongs to which package?",
								Options:  []string{"java.io", "java.lang", "java.util", "java.sql"},
								Answer:   2,
							},
							{
								Question: "ArrayList size changes?",
								Options:  []string{"No", "Only once", "Dynamically", "Manually"},
								Answer:   2,
							},
							{
								Question: "Which method adds an element?",
								Options:  []string{"put()", "append()", "add()", "insert()"},
								Answer:   2,
							},
							{
								Question: "Accessing an element uses?",
								Options:  []string{"fetch()", "get()", "access()", "retrieve()"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Create an ArrayList", Description: "Store five integers in an ArrayList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Find Maximum", Description: "Find the maximum element in an ArrayList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Remove Duplicates", Description: "Remove duplicate elements from an ArrayList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Reverse ArrayList", Description: "Reverse all elements in an ArrayList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "LinkedList" {
				lesson = models.Lesson{
					Title:         "LinkedList",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "LinkedList is a doubly linked list implementation that allows efficient insertion and deletion.",
						RealWorldAnalogy: "Imagine a train where each coach is connected to the previous and next coaches.",
						KeySteps: []string{
							"Create LinkedList",
							"Insert nodes",
							"Traverse list",
							"Delete nodes",
						},
						ProTip: "LinkedList is better than ArrayList when insertions and deletions are frequent.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "linkedlist",
						Config: map[string]interface{}{
							"nodes": []int{5, 10, 15},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create LinkedList"},
							{Line: 2, Text: "Insert 5 → 10 → 15"},
							{Line: 3, Text: "Traverse nodes"},
							{Line: 4, Text: "Print values"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "LinkedList stores data as?",
								Options:  []string{"Array", "Nodes", "Matrix", "Stack"},
								Answer:   1,
							},
							{
								Question: "Insertion in LinkedList is generally?",
								Options:  []string{"Efficient", "Impossible", "Slow", "Constantly fixed"},
								Answer:   0,
							},
							{
								Question: "Java LinkedList is?",
								Options:  []string{"Singly linked", "Circular", "Doubly linked", "Static"},
								Answer:   2,
							},
							{
								Question: "LinkedList belongs to?",
								Options:  []string{"java.util", "java.lang", "java.io", "java.math"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Insert Nodes", Description: "Insert values into a LinkedList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Delete Node", Description: "Remove a node from LinkedList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Search Element", Description: "Search an element in LinkedList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Reverse LinkedList", Description: "Reverse the LinkedList.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Stack and Queue" || lessonTitle == "Stack" || lessonTitle == "Queue" || lessonTitle == "Queue (Priority Queue, Deque)" {
				lesson = models.Lesson{
					Title:         "Stack and Queue",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Stack follows LIFO while Queue follows FIFO principles for data storage and retrieval.",
						RealWorldAnalogy: "Stack is like a pile of plates, Queue is like people waiting in line.",
						KeySteps: []string{
							"Insert element",
							"Remove element",
							"Access front/top",
							"Repeat operations",
						},
						ProTip: "Use Stack for recursion and Queue for scheduling tasks.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "stack-queue",
						Config: map[string]interface{}{
							"stack": []int{1, 2, 3},
							"queue": []int{10, 20, 30},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Push 1,2,3 into stack"},
							{Line: 2, Text: "Pop removes 3"},
							{Line: 3, Text: "Enqueue 10,20,30"},
							{Line: 4, Text: "Dequeue removes 10"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Stack follows?",
								Options:  []string{"FIFO", "LIFO", "Random", "Circular"},
								Answer:   1,
							},
							{
								Question: "Queue follows?",
								Options:  []string{"LIFO", "FIFO", "Priority", "Stack order"},
								Answer:   1,
							},
							{
								Question: "Which operation removes top element from stack?",
								Options:  []string{"push", "peek", "pop", "poll"},
								Answer:   2,
							},
							{
								Question: "Which operation inserts into queue?",
								Options:  []string{"enqueue", "pop", "peek", "removeTop"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Implement Stack", Description: "Implement stack using arrays.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Implement Queue", Description: "Implement queue using arrays.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Balanced Parentheses", Description: "Use stack to check balanced parentheses.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Circular Queue", Description: "Implement circular queue.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "HashMap" || lessonTitle == "Map (HashMap, LinkedHashMap, TreeMap, Hashtable)" {
				lesson = models.Lesson{
					Title:         "HashMap",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "HashMap stores key-value pairs and provides fast insertion, deletion, and lookup operations.",
						RealWorldAnalogy: "Think of a dictionary where each word (key) maps to its meaning (value).",
						KeySteps: []string{
							"Create HashMap",
							"Insert key-value pairs",
							"Retrieve values using keys",
							"Remove or update entries",
						},
						ProTip: "HashMap does not maintain insertion order.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "hashmap",
						Config: map[string]interface{}{
							"entries": map[string]interface{}{
								"Alice": 95,
								"Bob":   88,
							},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create HashMap"},
							{Line: 2, Text: "Insert Alice → 95"},
							{Line: 3, Text: "Insert Bob → 88"},
							{Line: 4, Text: "Retrieve value using key Alice"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "HashMap stores data in?",
								Options:  []string{"Arrays", "Key-value pairs", "Stacks", "Queues"},
								Answer:   1,
							},
							{
								Question: "Which method inserts elements?",
								Options:  []string{"add()", "put()", "insert()", "push()"},
								Answer:   1,
							},
							{
								Question: "Can HashMap contain null keys?",
								Options:  []string{"No", "Yes, one null key", "Unlimited null keys", "Only integer keys"},
								Answer:   1,
							},
							{
								Question: "Average lookup complexity in HashMap is?",
								Options:  []string{"O(n)", "O(log n)", "O(1)", "O(n²)"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Student Marks", Description: "Store student names and marks using HashMap.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Character Frequency", Description: "Count occurrences of characters in a string using HashMap.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Word Frequency Counter", Description: "Count word occurrences in a sentence.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Two Sum", Description: "Find two numbers adding up to target using HashMap.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "HashSet and TreeSet" || lessonTitle == "Set (HashSet, LinkedHashSet, TreeSet)" {
				lesson = models.Lesson{
					Title:         "HashSet and TreeSet",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "HashSet stores unique elements without order, while TreeSet stores unique elements in sorted order.",
						RealWorldAnalogy: "HashSet is like a basket of unique balls, TreeSet is like arranging those balls in ascending order.",
						KeySteps: []string{
							"Create set",
							"Insert elements",
							"Avoid duplicates",
							"Traverse elements",
						},
						ProTip: "Use TreeSet when sorted order is required.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "set",
						Config: map[string]interface{}{
							"input":   []int{5, 2, 8, 2},
							"hashset": []int{5, 2, 8},
							"treeset": []int{2, 5, 8},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Insert 5,2,8,2"},
							{Line: 2, Text: "HashSet removes duplicates"},
							{Line: 3, Text: "TreeSet sorts elements"},
							{Line: 4, Text: "Display unique values"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which collection maintains sorted order?",
								Options:  []string{"HashSet", "ArrayList", "TreeSet", "HashMap"},
								Answer:   2,
							},
							{
								Question: "Can HashSet contain duplicates?",
								Options:  []string{"Yes", "No", "Sometimes", "Only integers"},
								Answer:   1,
							},
							{
								Question: "TreeSet internally uses?",
								Options:  []string{"Linked List", "Binary Search Tree", "Stack", "Queue"},
								Answer:   1,
							},
							{
								Question: "Insertion complexity of TreeSet is?",
								Options:  []string{"O(1)", "O(log n)", "O(n)", "O(n²)"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Remove Duplicates", Description: "Use HashSet to remove duplicate elements.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Sort Unique Numbers", Description: "Use TreeSet to maintain sorted unique values.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Union of Sets", Description: "Find union of two sets.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Common Elements", Description: "Find intersection of two sets.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Generics" || lessonTitle == "Generic Classes" || lessonTitle == "Generic Methods" || lessonTitle == "Wildcards" {
				lesson = models.Lesson{
					Title:         "Generics",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Generics provide type safety and code reusability by allowing classes and methods to work with different data types.",
						RealWorldAnalogy: "Think of a universal container that can safely hold different types of objects without mixing them.",
						KeySteps: []string{
							"Declare generic type parameter",
							"Create generic class or method",
							"Specify actual type",
							"Use objects safely",
						},
						ProTip: "Generics eliminate many runtime type errors.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "generics",
						Config: map[string]interface{}{
							"typeParameter": "T",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Define Box<T>"},
							{Line: 2, Text: "Store value inside Box"},
							{Line: 3, Text: "Specify Box<Integer>"},
							{Line: 4, Text: "Retrieve value safely"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Generics improve?",
								Options:  []string{"Threading", "Type Safety", "Inheritance", "Sorting"},
								Answer:   1,
							},
							{
								Question: "Which symbol is commonly used for generic type?",
								Options:  []string{"X", "K", "T", "P"},
								Answer:   2,
							},
							{
								Question: "Generics reduce?",
								Options:  []string{"Compilation", "Runtime type errors", "Memory", "Sorting"},
								Answer:   1,
							},
							{
								Question: "ArrayList<Integer> stores?",
								Options:  []string{"Strings", "Objects", "Integers", "Characters"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Generic Box Class", Description: "Implement a generic Box<T> class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Generic Method", Description: "Create a method that prints any type of array.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Pair Class", Description: "Implement a generic Pair<K,V> class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Generic Stack", Description: "Implement a stack using generics.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Lambda Expressions" {
				lesson = models.Lesson{
					Title:         "Lambda Expressions",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Lambda expressions provide a concise way to represent anonymous functions and implement functional interfaces.",
						RealWorldAnalogy: "Instead of hiring a permanent employee (class), you hire a freelancer for a single task (lambda).",
						KeySteps: []string{
							"Identify functional interface",
							"Define lambda parameters",
							"Implement logic",
							"Execute lambda expression",
						},
						ProTip: "Use lambdas to reduce boilerplate code when implementing functional interfaces.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "lambda",
						Config: map[string]interface{}{
							"expression": "(a, b) -> a + b",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create functional interface"},
							{Line: 2, Text: "Define lambda (a,b) -> a+b"},
							{Line: 3, Text: "Pass values 5 and 3"},
							{Line: 4, Text: "Return 8"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Lambda expressions were introduced in?",
								Options:  []string{"Java 6", "Java 7", "Java 8", "Java 11"},
								Answer:   2,
							},
							{
								Question: "A lambda expression implements?",
								Options:  []string{"Class", "Package", "Functional Interface", "Exception"},
								Answer:   2,
							},
							{
								Question: "How many abstract methods can a functional interface have?",
								Options:  []string{"0", "1", "2", "Unlimited"},
								Answer:   1,
							},
							{
								Question: "Which symbol is used in lambda expressions?",
								Options:  []string{"::", "=>", "->", "==>"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Addition Lambda", Description: "Create a lambda expression that adds two numbers.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "String Length Lambda", Description: "Return length of a string using lambda.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Sort List Using Lambda", Description: "Sort integers using lambda comparator.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Even Number Filter", Description: "Filter even numbers using lambda expressions.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Stream API" || lessonTitle == "Streams API" {
				lesson = models.Lesson{
					Title:         "Streams API",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 60,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Streams API provides a functional approach for processing collections efficiently.",
						RealWorldAnalogy: "Like a water pipeline where water flows through filters and transformations before reaching the destination.",
						KeySteps: []string{
							"Create stream",
							"Apply intermediate operations",
							"Apply terminal operation",
							"Collect result",
						},
						ProTip: "Streams do not modify the original collection.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "stream",
						Config: map[string]interface{}{
							"input":  []int{1, 2, 3, 4, 5},
							"filter": "even",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create stream from list"},
							{Line: 2, Text: "Filter even numbers"},
							{Line: 3, Text: "Collect results"},
							{Line: 4, Text: "Return [2,4]"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Streams API was introduced in?",
								Options:  []string{"Java 5", "Java 7", "Java 8", "Java 10"},
								Answer:   2,
							},
							{
								Question: "Which method filters elements?",
								Options:  []string{"collect()", "filter()", "map()", "reduce()"},
								Answer:   1,
							},
							{
								Question: "Which operation transforms elements?",
								Options:  []string{"map()", "collect()", "count()", "forEach()"},
								Answer:   0,
							},
							{
								Question: "Which is a terminal operation?",
								Options:  []string{"map()", "filter()", "sorted()", "collect()"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Filter Even Numbers", Description: "Use Streams API to filter even numbers.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Square Numbers", Description: "Transform list elements into squares using map().", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Find Maximum", Description: "Find the largest number using streams.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Count Words", Description: "Count words using Streams API.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "File Handling" || lessonTitle == "File Class" {
				lesson = models.Lesson{
					Title:         "File Handling",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 60,
					Explanation: models.LessonExplanation{
						BriefOverview:    "File handling allows Java applications to create, read, write, and manage files stored on disk.",
						RealWorldAnalogy: "Like reading from and writing to a notebook stored in a cabinet.",
						KeySteps: []string{
							"Open file",
							"Read or write data",
							"Handle exceptions",
							"Close file",
						},
						ProTip: "Always close file resources or use try-with-resources.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "file-handling",
						Config: map[string]interface{}{
							"fileName": "data.txt",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Open data.txt"},
							{Line: 2, Text: "Read file contents"},
							{Line: 3, Text: "Process data"},
							{Line: 4, Text: "Close file"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which class is commonly used to read files?",
								Options:  []string{"Scanner", "FileReader", "Math", "Thread"},
								Answer:   1,
							},
							{
								Question: "Which class is commonly used to write files?",
								Options:  []string{"FileWriter", "Scanner", "PrintStream", "Object"},
								Answer:   0,
							},
							{
								Question: "Which statement automatically closes resources?",
								Options:  []string{"finally", "closeAll", "try-with-resources", "dispose"},
								Answer:   2,
							},
							{
								Question: "File handling belongs mainly to which package?",
								Options:  []string{"java.util", "java.io", "java.math", "java.net"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Read Text File", Description: "Read and display contents of a text file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Write Text File", Description: "Write user input into a file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Copy File", Description: "Copy contents from one file to another.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Word Counter", Description: "Count words present in a text file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Multithreading" || lessonTitle == "Threads" {
				lesson = models.Lesson{
					Title:         "Multithreading",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 60,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Multithreading allows multiple parts of a program to execute concurrently, improving performance and responsiveness.",
						RealWorldAnalogy: "Think of a restaurant where multiple chefs prepare different dishes simultaneously.",
						KeySteps: []string{
							"Create thread",
							"Start thread",
							"Execute concurrently",
							"Wait for completion",
						},
						ProTip: "Prefer implementing Runnable over extending Thread for better flexibility.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "multithreading",
						Config: map[string]interface{}{
							"threads": []string{"Thread-1", "Thread-2"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create Thread-1"},
							{Line: 2, Text: "Create Thread-2"},
							{Line: 3, Text: "Start both threads"},
							{Line: 4, Text: "Execute tasks concurrently"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which method starts a thread?",
								Options:  []string{"run()", "execute()", "start()", "begin()"},
								Answer:   2,
							},
							{
								Question: "Which interface is commonly implemented for threads?",
								Options:  []string{"Serializable", "Runnable", "Comparable", "Cloneable"},
								Answer:   1,
							},
							{
								Question: "Thread.sleep() puts a thread into?",
								Options:  []string{"Running", "Sleeping", "Dead", "Blocked forever"},
								Answer:   1,
							},
							{
								Question: "Which class represents a thread?",
								Options:  []string{"Process", "Executor", "Thread", "Task"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Create a Thread", Description: "Create and start a thread using Thread class.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Runnable Interface", Description: "Implement Runnable and execute it.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Thread Sleep", Description: "Pause a thread using sleep().", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Multiple Threads", Description: "Run two threads simultaneously.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Synchronization and Concurrency" || lessonTitle == "Concurrency" || lessonTitle == "Synchronization" {
				lesson = models.Lesson{
					Title:         "Synchronization and Concurrency",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 75,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Synchronization ensures that multiple threads safely access shared resources without causing inconsistent results.",
						RealWorldAnalogy: "Like multiple people sharing a bathroom where only one person can enter at a time.",
						KeySteps: []string{
							"Identify shared resource",
							"Synchronize critical section",
							"Prevent race conditions",
							"Ensure thread safety",
						},
						ProTip: "Synchronize only critical code sections to avoid performance issues.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "synchronization",
						Config: map[string]interface{}{
							"sharedResource": "counter",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Thread A accesses counter"},
							{Line: 2, Text: "Lock counter"},
							{Line: 3, Text: "Update counter"},
							{Line: 4, Text: "Release lock"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Synchronization prevents?",
								Options:  []string{"Compilation errors", "Race conditions", "Inheritance", "Polymorphism"},
								Answer:   1,
							},
							{
								Question: "Which keyword is used for synchronization?",
								Options:  []string{"thread", "lock", "synchronized", "sync"},
								Answer:   2,
							},
							{
								Question: "Deadlock occurs when?",
								Options:  []string{"Threads wait indefinitely", "Program exits", "Memory leaks", "Compilation fails"},
								Answer:   0,
							},
							{
								Question: "ExecutorService belongs to?",
								Options:  []string{"java.io", "java.util.concurrent", "java.lang", "java.sql"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Synchronized Counter", Description: "Protect a shared counter using synchronization.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Producer Consumer Problem", Description: "Implement producer-consumer using wait and notify.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Thread Pool", Description: "Execute tasks using ExecutorService.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Deadlock Example", Description: "Demonstrate and understand deadlock.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "JDBC" || lessonTitle == "JDBC Basics" {
				lesson = models.Lesson{
					Title:         "JDBC",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 60,
					Explanation: models.LessonExplanation{
						BriefOverview:    "JDBC (Java Database Connectivity) enables Java applications to interact with relational databases.",
						RealWorldAnalogy: "Think of JDBC as a translator between Java programs and databases.",
						KeySteps: []string{
							"Load driver",
							"Establish connection",
							"Execute SQL queries",
							"Process results",
						},
						ProTip: "Always close Connection, Statement, and ResultSet resources.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "jdbc",
						Config: map[string]interface{}{
							"database": "MySQL",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Load JDBC driver"},
							{Line: 2, Text: "Connect to database"},
							{Line: 3, Text: "Execute SQL query"},
							{Line: 4, Text: "Retrieve results"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "JDBC stands for?",
								Options:  []string{"Java Database Connectivity", "Java Data Connection", "Java Driver Connection", "Java Dynamic Binding"},
								Answer:   0,
							},
							{
								Question: "Which interface establishes connection?",
								Options:  []string{"DriverManager", "Statement", "ResultSet", "PreparedStatement"},
								Answer:   0,
							},
							{
								Question: "Which object stores query results?",
								Options:  []string{"Connection", "Statement", "ResultSet", "Driver"},
								Answer:   2,
							},
							{
								Question: "PreparedStatement helps prevent?",
								Options:  []string{"Deadlocks", "Inheritance", "SQL Injection", "Memory Leak"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Database Connection", Description: "Connect Java application to MySQL database.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Insert Records", Description: "Insert rows into a database table.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Fetch Data", Description: "Retrieve records using SELECT query.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "PreparedStatement", Description: "Use PreparedStatement for parameterized queries.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Annotations" {
				lesson = models.Lesson{
					Title:         "Annotations",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 45,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Annotations provide metadata about code that can be used by the compiler and frameworks.",
						RealWorldAnalogy: "Annotations are like sticky notes attached to files that provide extra information without changing the file contents.",
						KeySteps: []string{
							"Declare annotation",
							"Apply annotation",
							"Compiler processes metadata",
							"Frameworks utilize annotations",
						},
						ProTip: "Use @Override to catch method overriding mistakes at compile time.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "annotations",
						Config: map[string]interface{}{
							"annotation": "@Override",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create parent method"},
							{Line: 2, Text: "Override child method"},
							{Line: 3, Text: "Apply @Override"},
							{Line: 4, Text: "Compiler validates method"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which annotation checks method overriding?",
								Options:  []string{"@Deprecated", "@Override", "@SuppressWarnings", "@FunctionalInterface"},
								Answer:   1,
							},
							{
								Question: "Annotations mainly provide?",
								Options:  []string{"Inheritance", "Metadata", "Polymorphism", "Variables"},
								Answer:   1,
							},
							{
								Question: "Which annotation suppresses warnings?",
								Options:  []string{"@Override", "@Deprecated", "@SuppressWarnings", "@Retention"},
								Answer:   2,
							},
							{
								Question: "Which annotation marks deprecated methods?",
								Options:  []string{"@Deprecated", "@FunctionalInterface", "@Override", "@Inherited"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Override Annotation", Description: "Use @Override in inherited methods.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Deprecated Method", Description: "Mark a method using @Deprecated.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Custom Annotation", Description: "Create your own annotation.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Functional Interface", Description: "Create an interface using @FunctionalInterface.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Serialization" || lessonTitle == "Object Serialization" {
				lesson = models.Lesson{
					Title:         "Serialization",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Serialization converts objects into byte streams so they can be stored or transmitted.",
						RealWorldAnalogy: "Packing your belongings into boxes before moving them to another location.",
						KeySteps: []string{
							"Implement Serializable interface",
							"Convert object into stream",
							"Store or transmit stream",
							"Deserialize object back",
						},
						ProTip: "Use transient keyword to exclude fields from serialization.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "serialization",
						Config: map[string]interface{}{
							"object": "Student",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create Student object"},
							{Line: 2, Text: "Serialize object"},
							{Line: 3, Text: "Store byte stream"},
							{Line: 4, Text: "Deserialize object"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Serialization converts objects into?",
								Options:  []string{"Strings", "Byte Streams", "Arrays", "Collections"},
								Answer:   1,
							},
							{
								Question: "Which interface enables serialization?",
								Options:  []string{"Cloneable", "Runnable", "Serializable", "Comparable"},
								Answer:   2,
							},
							{
								Question: "Which keyword excludes fields from serialization?",
								Options:  []string{"volatile", "static", "final", "transient"},
								Answer:   3,
							},
							{
								Question: "Restoring objects is called?",
								Options:  []string{"Compilation", "Deserialization", "Inheritance", "Synchronization"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Serialize Student Object", Description: "Store a Student object into a file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Deserialize Object", Description: "Read serialized object from file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Transient Fields", Description: "Exclude password field from serialization.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Employee Serialization", Description: "Serialize and deserialize Employee objects.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Networking (Sockets and URL Connections)" || lessonTitle == "Networking" {
				lesson = models.Lesson{
					Title:         "Networking (Sockets and URL Connections)",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 70,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Java networking enables communication between systems over networks using sockets and URL connections.",
						RealWorldAnalogy: "Like telephones allowing people to communicate over long distances.",
						KeySteps: []string{
							"Establish connection",
							"Send request",
							"Receive response",
							"Close connection",
						},
						ProTip: "Always close sockets and streams to avoid resource leaks.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "networking",
						Config: map[string]interface{}{
							"client": "Client",
							"server": "Server",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create ServerSocket"},
							{Line: 2, Text: "Client connects"},
							{Line: 3, Text: "Exchange messages"},
							{Line: 4, Text: "Close connection"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which class creates a server socket?",
								Options:  []string{"Socket", "ServerSocket", "URLConnection", "URL"},
								Answer:   1,
							},
							{
								Question: "Which class represents client connection?",
								Options:  []string{"Socket", "Thread", "ServerSocket", "Packet"},
								Answer:   0,
							},
							{
								Question: "HTTP URLs are handled using?",
								Options:  []string{"Socket", "Thread", "URLConnection", "File"},
								Answer:   2,
							},
							{
								Question: "Which protocol powers the web?",
								Options:  []string{"FTP", "SMTP", "HTTP", "UDP"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "TCP Client", Description: "Create a simple TCP client.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "TCP Server", Description: "Create a server using ServerSocket.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "URL Reader", Description: "Read contents from a web page.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Chat Application", Description: "Build a basic client-server chat application.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "JVM Architecture" || lessonTitle == "JVM Internals" {
				lesson = models.Lesson{
					Title:         "JVM Architecture",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 75,
					Explanation: models.LessonExplanation{
						BriefOverview:    "JVM (Java Virtual Machine) is responsible for executing Java bytecode and managing memory, class loading, and runtime operations.",
						RealWorldAnalogy: "Think of JVM as an interpreter that translates instructions into machine language understood by the computer.",
						KeySteps: []string{
							"Load classes",
							"Verify bytecode",
							"Allocate memory",
							"Execute instructions",
						},
						ProTip: "Understanding JVM internals is important for performance tuning and interviews.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "jvm-architecture",
						Config: map[string]interface{}{
							"components": []string{"ClassLoader", "Runtime Data Area", "Execution Engine"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Load class files"},
							{Line: 2, Text: "Verify bytecode"},
							{Line: 3, Text: "Store data in memory areas"},
							{Line: 4, Text: "Execute bytecode"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "JVM executes?",
								Options:  []string{"Java Source Code", "Bytecode", "Assembly Code", "HTML"},
								Answer:   1,
							},
							{
								Question: "Which component loads classes?",
								Options:  []string{"Execution Engine", "Heap", "ClassLoader", "Stack"},
								Answer:   2,
							},
							{
								Question: "JIT stands for?",
								Options:  []string{"Java Integration Tool", "Just In Time Compiler", "Java Internal Thread", "Joint Instruction Tool"},
								Answer:   1,
							},
							{
								Question: "JVM is part of?",
								Options:  []string{"JDK", "JRE", "Compiler", "IDE"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Class Loading Flow", Description: "Explain the class loading mechanism.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "JIT Compilation", Description: "Understand how JIT optimizes execution.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Bytecode Execution", Description: "Trace how bytecode is executed.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "JVM Components", Description: "Identify major JVM components.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Garbage Collection" {
				lesson = models.Lesson{
					Title:         "Garbage Collection",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 70,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Garbage Collection automatically frees memory occupied by unreachable objects.",
						RealWorldAnalogy: "Like a cleaning robot removing unused items from a room.",
						KeySteps: []string{
							"Create objects",
							"Detect unreachable objects",
							"Mark objects",
							"Reclaim memory",
						},
						ProTip: "Avoid creating unnecessary objects to reduce GC overhead.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "garbage-collection",
						Config: map[string]interface{}{
							"heap": []string{"Object A", "Object B", "Unused Object C"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Allocate objects"},
							{Line: 2, Text: "Mark unreachable objects"},
							{Line: 3, Text: "Remove unused objects"},
							{Line: 4, Text: "Free memory"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Garbage collection manages?",
								Options:  []string{"CPU", "Memory", "Threads", "Files"},
								Answer:   1,
							},
							{
								Question: "Garbage collector removes?",
								Options:  []string{"All objects", "Unused objects", "Arrays", "Methods"},
								Answer:   1,
							},
							{
								Question: "Which method requests GC?",
								Options:  []string{"gc()", "System.gc()", "clean()", "free()"},
								Answer:   1,
							},
							{
								Question: "Minor GC mainly works on?",
								Options:  []string{"Stack", "Young Generation", "Old Generation", "Metaspace"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Object Lifecycle", Description: "Understand object allocation and deallocation.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "GC Types", Description: "Compare Minor GC and Major GC.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Memory Leak Detection", Description: "Identify common causes of memory leaks.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "GC Logs", Description: "Analyze garbage collection logs.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Java Memory Model" || lessonTitle == "Memory Management" {
				lesson = models.Lesson{
					Title:         "Java Memory Model",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 80,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Java Memory Model defines how memory is allocated and shared among threads. Major areas include Heap, Stack, and Metaspace.",
						RealWorldAnalogy: "Think of Heap as a warehouse, Stack as individual desks, and Metaspace as a blueprint archive.",
						KeySteps: []string{
							"Allocate local variables to stack",
							"Allocate objects to heap",
							"Store class metadata in metaspace",
							"Manage memory efficiently",
						},
						ProTip: "Stack memory is thread-specific while heap memory is shared.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "memory-model",
						Config: map[string]interface{}{
							"areas": []string{"Stack", "Heap", "Metaspace"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create local variable"},
							{Line: 2, Text: "Allocate object in heap"},
							{Line: 3, Text: "Store class metadata"},
							{Line: 4, Text: "Access object reference"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Objects are stored in?",
								Options:  []string{"Stack", "Heap", "Registers", "Cache"},
								Answer:   1,
							},
							{
								Question: "Local variables are stored in?",
								Options:  []string{"Heap", "Metaspace", "Stack", "Pool"},
								Answer:   2,
							},
							{
								Question: "Class metadata is stored in?",
								Options:  []string{"Heap", "Stack", "Metaspace", "Cache"},
								Answer:   2,
							},
							{
								Question: "Heap memory is?",
								Options:  []string{"Thread-specific", "Shared", "Immutable", "Static"},
								Answer:   1,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Stack vs Heap", Description: "Differentiate stack and heap memory.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Memory Allocation", Description: "Trace object creation and memory allocation.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Reference Variables", Description: "Understand object references and memory layout.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Metaspace Analysis", Description: "Study class metadata storage.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Design Patterns" {
				lesson = models.Lesson{
					Title:         "Design Patterns",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 90,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Design patterns are reusable solutions to commonly occurring software design problems.",
						RealWorldAnalogy: "Like architectural blueprints used repeatedly to construct different buildings.",
						KeySteps: []string{
							"Identify problem",
							"Choose suitable pattern",
							"Implement pattern",
							"Reuse and maintain code",
						},
						ProTip: "Don't force design patterns. Use them only when they simplify code and improve maintainability.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "singleton-pattern",
						Config: map[string]interface{}{
							"class": "DatabaseConnection",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create private constructor"},
							{Line: 2, Text: "Create static instance"},
							{Line: 3, Text: "Provide getInstance() method"},
							{Line: 4, Text: "Return same object every time"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Singleton pattern ensures?",
								Options:  []string{"Multiple objects", "Single object instance", "Inheritance", "Polymorphism"},
								Answer:   1,
							},
							{
								Question: "Factory pattern mainly creates?",
								Options:  []string{"Threads", "Objects", "Packages", "Exceptions"},
								Answer:   1,
							},
							{
								Question: "MVC stands for?",
								Options:  []string{"Model View Controller", "Main View Controller", "Model Virtual Control", "Memory View Class"},
								Answer:   0,
							},
							{
								Question: "Observer pattern is used for?",
								Options:  []string{"Notifications", "Sorting", "File Handling", "Memory Allocation"},
								Answer:   0,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Singleton Logger", Description: "Implement Logger using Singleton pattern.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Factory Pattern", Description: "Create Shape objects using Factory pattern.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Observer Pattern", Description: "Implement subscriber notification system.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Builder Pattern", Description: "Build complex objects using Builder pattern.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Logging Frameworks" || lessonTitle == "Logging" {
				lesson = models.Lesson{
					Title:         "Logging Frameworks",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 50,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Logging frameworks help record application events for debugging and monitoring.",
						RealWorldAnalogy: "Like a security camera recording everything happening inside a building.",
						KeySteps: []string{
							"Configure logger",
							"Generate log messages",
							"Store logs",
							"Analyze logs",
						},
						ProTip: "Use appropriate log levels to avoid unnecessary output.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "logging",
						Config: map[string]interface{}{
							"levels": []string{"INFO", "DEBUG", "WARN", "ERROR"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Initialize logger"},
							{Line: 2, Text: "Log INFO message"},
							{Line: 3, Text: "Log ERROR message"},
							{Line: 4, Text: "Write logs to file"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Which framework is commonly used in Java?",
								Options:  []string{"Log4j", "JUnit", "JDBC", "JVM"},
								Answer:   0,
							},
							{
								Question: "Which level indicates serious failure?",
								Options:  []string{"INFO", "DEBUG", "ERROR", "TRACE"},
								Answer:   2,
							},
							{
								Question: "Which level is mainly used for debugging?",
								Options:  []string{"DEBUG", "WARN", "ERROR", "FATAL"},
								Answer:   0,
							},
							{
								Question: "Logs help with?",
								Options:  []string{"Monitoring", "Debugging", "Troubleshooting", "All of the above"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Simple Logger", Description: "Log messages using Java Logger API.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Log4j Configuration", Description: "Configure Log4j for an application.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "File Logging", Description: "Write logs into a file.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Exception Logging", Description: "Log exceptions with stack traces.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Unit Testing (JUnit and Mockito)" || lessonTitle == "Unit Testing" {
				lesson = models.Lesson{
					Title:         "Unit Testing (JUnit and Mockito)",
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 80,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Unit testing verifies individual components of software. JUnit provides testing tools, while Mockito helps create mock objects.",
						RealWorldAnalogy: "Like testing each part of a car separately before assembling the entire vehicle.",
						KeySteps: []string{
							"Write test case",
							"Execute test",
							"Verify expected output",
							"Mock dependencies if required",
						},
						ProTip: "Good unit tests should be independent, repeatable, and fast.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "unit-testing",
						Config: map[string]interface{}{
							"method": "add()",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create add() method"},
							{Line: 2, Text: "Write JUnit test"},
							{Line: 3, Text: "Assert expected result"},
							{Line: 4, Text: "Pass test successfully"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "JUnit is used for?",
								Options:  []string{"Database access", "Testing", "Networking", "Logging"},
								Answer:   1,
							},
							{
								Question: "Mockito is mainly used for?",
								Options:  []string{"Inheritance", "Mock objects", "Sorting", "File handling"},
								Answer:   1,
							},
							{
								Question: "Which method checks expected values?",
								Options:  []string{"assertEquals()", "print()", "verify()", "start()"},
								Answer:   0,
							},
							{
								Question: "Unit tests should be?",
								Options:  []string{"Dependent", "Slow", "Independent", "Manual"},
								Answer:   2,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Calculator Tests", Description: "Write JUnit tests for arithmetic operations.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "String Utility Tests", Description: "Test string manipulation methods.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Mockito Service Test", Description: "Mock repository objects using Mockito.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Exception Testing", Description: "Verify exceptions using JUnit assertions.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Reflection API" || lessonTitle == "Reflection" {
				lesson = models.Lesson{
					Title:         "Reflection API",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 80,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Reflection allows Java programs to inspect and manipulate classes, methods, constructors, and fields at runtime.",
						RealWorldAnalogy: "Like opening a machine and examining or modifying its components while it is running.",
						KeySteps: []string{
							"Load class metadata",
							"Inspect fields and methods",
							"Access constructors",
							"Invoke methods dynamically",
						},
						ProTip: "Reflection is powerful but should be used carefully because it can affect performance and security.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "reflection",
						Config: map[string]interface{}{
							"class": "Student",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Load Student.class"},
							{Line: 2, Text: "Retrieve methods"},
							{Line: 3, Text: "Create object dynamically"},
							{Line: 4, Text: "Invoke method at runtime"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Reflection operates at?",
								Options:  []string{"Compile time", "Runtime", "Link time", "Build time"},
								Answer:   1,
							},
							{
								Question: "Which class provides reflection capabilities?",
								Options:  []string{"Class", "Thread", "Object", "Scanner"},
								Answer:   0,
							},
							{
								Question: "Reflection can access?",
								Options:  []string{"Fields", "Methods", "Constructors", "All of the above"},
								Answer:   3,
							},
							{
								Question: "Reflection is commonly used in?",
								Options:  []string{"Spring", "Hibernate", "JUnit", "All of the above"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Inspect Class", Description: "Print all methods of a class using reflection.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Access Fields", Description: "Read class fields dynamically.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Invoke Method", Description: "Call a method using Reflection API.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Constructor Reflection", Description: "Instantiate objects dynamically.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Java Modules (JPMS)" || lessonTitle == "Java Modules" {
				lesson = models.Lesson{
					Title:         "Java Modules (JPMS)",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 70,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Java Platform Module System (JPMS) organizes code into modules with explicit dependencies.",
						RealWorldAnalogy: "Like dividing a large office into departments where each department exposes only necessary resources.",
						KeySteps: []string{
							"Create module",
							"Declare exports",
							"Specify dependencies",
							"Compile and run modules",
						},
						ProTip: "Modules improve maintainability and reduce dependency conflicts.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "modules",
						Config: map[string]interface{}{
							"module": "com.example.app",
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Create module-info.java"},
							{Line: 2, Text: "Export packages"},
							{Line: 3, Text: "Require dependencies"},
							{Line: 4, Text: "Compile and execute module"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "JPMS was introduced in?",
								Options:  []string{"Java 7", "Java 8", "Java 9", "Java 11"},
								Answer:   2,
							},
							{
								Question: "Which file defines module information?",
								Options:  []string{"module.java", "package-info.java", "module-info.java", "manifest.java"},
								Answer:   2,
							},
							{
								Question: "Which keyword exposes packages?",
								Options:  []string{"exports", "import", "requires", "opens"},
								Answer:   0,
							},
							{
								Question: "Modules improve?",
								Options:  []string{"Encapsulation", "Dependency management", "Maintainability", "All of the above"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "Create Module", Description: "Build a simple Java module.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Export Packages", Description: "Expose package APIs using exports.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Module Dependencies", Description: "Use requires keyword for dependencies.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Multi-Module Project", Description: "Create and connect multiple modules.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Performance Tuning and Profiling" || lessonTitle == "Performance Tuning" {
				lesson = models.Lesson{
					Title:         "Performance Tuning and Profiling",
					Slug:          slug,
					Difficulty:    "Hard",
					EstimatedTime: 90,
					Explanation: models.LessonExplanation{
						BriefOverview:    "Performance tuning and profiling help identify bottlenecks and optimize application speed and resource usage.",
						RealWorldAnalogy: "Like diagnosing traffic congestion and improving road efficiency.",
						KeySteps: []string{
							"Measure performance",
							"Identify bottlenecks",
							"Optimize code",
							"Monitor improvements",
						},
						ProTip: "Always profile before optimizing; premature optimization can lead to unnecessary complexity.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "profiling",
						Config: map[string]interface{}{
							"tools": []string{"JProfiler", "VisualVM", "Java Mission Control"},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "Run profiler"},
							{Line: 2, Text: "Analyze CPU usage"},
							{Line: 3, Text: "Analyze memory usage"},
							{Line: 4, Text: "Optimize bottlenecks"},
						},
					},
					Quiz: models.LessonQuiz{
						Questions: []models.LessonQuizQuestion{
							{
								Question: "Profiling helps identify?",
								Options:  []string{"Syntax errors", "Performance bottlenecks", "Inheritance", "Packages"},
								Answer:   1,
							},
							{
								Question: "Which tool is used for Java profiling?",
								Options:  []string{"VisualVM", "Excel", "Git", "Docker"},
								Answer:   0,
							},
							{
								Question: "Premature optimization is?",
								Options:  []string{"Recommended", "Harmless", "Often undesirable", "Required"},
								Answer:   2,
							},
							{
								Question: "Which metric is commonly analyzed?",
								Options:  []string{"CPU usage", "Memory usage", "Thread activity", "All of the above"},
								Answer:   3,
							},
						},
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{ID: "pq_1", ProblemTitle: "CPU Profiling", Description: "Analyze CPU-intensive methods.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_2", ProblemTitle: "Memory Leak Detection", Description: "Identify memory leaks using VisualVM.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_3", ProblemTitle: "Thread Analysis", Description: "Analyze thread dumps and deadlocks.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
							{ID: "pq_4", ProblemTitle: "Optimize Application", Description: "Improve execution speed based on profiling results.", StarterCode: map[string]interface{}{}, TestCases: []models.PracticeTestCase{}},
						},
					},
				}
			} else if lessonTitle == "Bubble Sort" {
				lesson = models.Lesson{
					Title:         "Bubble Sort",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 15,
					Explanation: models.LessonExplanation{
						BriefOverview: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
						RealWorldAnalogy: "Imagine people in a line ordered by height. You compare two adjacent people and swap them if the taller one is in front. You repeat this from the start to the end until everyone is sorted.",
						KeySteps: []string{
							"Start from the first element",
							"Compare adjacent elements",
							"Swap if they are in wrong order",
							"Repeat until no swaps are needed",
						},
						ProTip: "Bubble sort is rarely used in practice due to its O(n^2) complexity, but it is easy to understand and implement.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "bubble-sort",
						Config: map[string]interface{}{
							"array": []int{5, 3, 8, 4, 2},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "for i = 0 to n-1"},
							{Line: 2, Text: "  for j = 0 to n-i-2"},
							{Line: 3, Text: "    if A[j] > A[j+1]"},
							{Line: 4, Text: "      swap(A[j], A[j+1])"},
						},
					},
				}
			} else if lessonTitle == "Selection Sort" {
				lesson = models.Lesson{
					Title:         "Selection Sort",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 15,
					Explanation: models.LessonExplanation{
						BriefOverview: "Selection sort is an in-place comparison sorting algorithm that divides the input list into two parts: a sorted sublist of items which is built up from left to right at the front of the list and a sublist of the remaining unsorted items.",
						RealWorldAnalogy: "Imagine organizing a hand of cards. You scan all your cards to find the smallest one, then place it at the leftmost position. Then you find the second smallest and place it next to the first, and so on.",
						KeySteps: []string{
							"Assume the first unsorted element is the minimum",
							"Find the actual minimum in the unsorted portion",
							"Swap the minimum with the first unsorted element",
							"Move the boundary of the sorted portion one element to the right",
						},
						ProTip: "Selection sort always makes O(n^2) comparisons regardless of the initial order of the array, but it minimizes the number of swaps.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "selection-sort",
						Config: map[string]interface{}{
							"array": []int{5, 3, 8, 4, 2},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "for i = 0 to n-1"},
							{Line: 2, Text: "  min_idx = i"},
							{Line: 3, Text: "  for j = i+1 to n"},
							{Line: 4, Text: "    if A[j] < A[min_idx]"},
							{Line: 5, Text: "      min_idx = j"},
							{Line: 6, Text: "  swap(A[i], A[min_idx])"},
						},
					},
				}
			} else if lessonTitle == "Insertion Sort" {
				lesson = models.Lesson{
					Title:         "Insertion Sort",
					Slug:          slug,
					Difficulty:    "Easy",
					EstimatedTime: 15,
					Explanation: models.LessonExplanation{
						BriefOverview: "Insertion sort is a simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
						RealWorldAnalogy: "Imagine sorting a hand of playing cards. You start with one card, then take the next card and insert it into its correct position relative to the first card. You repeat this for all cards, building a sorted hand one card at a time.",
						KeySteps: []string{
							"Start with the second element as the key",
							"Compare the key with elements before it",
							"Shift greater elements one position to the right",
							"Insert the key in its correct position",
						},
						ProTip: "Insertion sort is very efficient for small datasets or nearly sorted arrays, and is often used as a base case in advanced algorithms like Timsort.",
					},
					VisualSimulation: models.LessonVisualSimulation{
						Type: "insertion-sort",
						Config: map[string]interface{}{
							"array": []int{5, 3, 8, 4, 2},
						},
						Pseudocode: []models.PseudocodeLine{
							{Line: 1, Text: "for i = 1 to n-1"},
							{Line: 2, Text: "  key = A[i]"},
							{Line: 3, Text: "  j = i - 1"},
							{Line: 4, Text: "  while j >= 0 and A[j] > key"},
							{Line: 5, Text: "    A[j+1] = A[j]"},
							{Line: 6, Text: "    j = j - 1"},
							{Line: 7, Text: "  A[j+1] = key"},
						},
					},
				}
			} else {
				// PLACEHOLDER LESSON
				lesson = models.Lesson{
					Title:         lessonTitle,
					Slug:          slug,
					Difficulty:    "Medium",
					EstimatedTime: 10,
					Explanation: models.LessonExplanation{
						BriefOverview: "Content for " + lessonTitle + " is coming soon!",
					},
					Practice: models.LessonPractice{
						Questions: []models.PracticeQuestion{
							{
								ID: "pq_placeholder",
								ProblemTitle: "Implement " + lessonTitle,
								Description:  "Coming soon.",
								StarterCode: map[string]interface{}{
									"python": "def solution():\n    pass",
								},
							},
						},
					},
				}
			}

			lesson.InitID()
			// Set deterministic stats and three example test cases based on difficulty
			subCnt, accCnt := statsForDifficulty(lesson.Difficulty)
			for i := range lesson.Practice.Questions {
				lesson.Practice.Questions[i].SubmissionCount = subCnt
				lesson.Practice.Questions[i].AcceptedCount = accCnt
				lesson.Practice.Questions[i].TestCases = generatePracticeTestCases(lesson.Practice.Questions[i].ProblemTitle, lesson.Practice.Questions[i].Description)
			}
			_, err := db.Collection("lessons").InsertOne(ctx, lesson)
			if err != nil {
				log.Fatalf("Failed to insert lesson %s: %v", lessonTitle, err)
			}

			topicLessons = append(topicLessons, models.TopicLesson{
				LessonID: lesson.ID,
				Title:    lesson.Title,
				Order:    j + 1,
			})
		}

		topic := models.Topic{
			Title:   seedTopic.Title,
			Lessons: topicLessons,
		}
		topic.InitID()
		_, err := db.Collection("topics").InsertOne(ctx, topic)
		if err != nil {
			log.Fatalf("Failed to insert topic %s: %v", seedTopic.Title, err)
		}

		courseTopics = append(courseTopics, models.CourseTopic{
			TopicID: topic.ID,
			Order:   i + 1,
		})
	}

		// 3. Create Course
		course := models.Course{
			Title:  c.Title,
			Topics: courseTopics,
		}
		course.InitID()
		courseIDMap[c.Title] = course.ID
		_, err := db.Collection("courses").InsertOne(ctx, course)
		if err != nil {
			log.Fatalf("Failed to insert course: %v", err)
		}
	}

	log.Println("Seeding Career Paths...")
	frontendCareer := models.CareerPath{
		Title:       "Frontend Web Developer",
		Description: "Master the building blocks of the web and build beautiful, interactive user interfaces from scratch.",
		Courses: []models.CareerPathCourse{
			{CourseID: courseIDMap["Complete HTML Course"], Order: 1},
			{CourseID: courseIDMap["Complete CSS Course"], Order: 2},
			{CourseID: courseIDMap["Complete JavaScript Course"], Order: 3},
		},
	}
	frontendCareer.InitID()
	_, err := db.Collection("career_paths").InsertOne(ctx, frontendCareer)
	if err != nil {
		log.Fatalf("Failed to insert career path: %v", err)
	}

	log.Println("Seeding Practice Problems...")
	if err := handlers.SeedGlobalProblemsDB(ctx, db); err != nil {
		log.Fatalf("Failed to seed practice problems: %v", err)
	}

	log.Println("Database seeded successfully with all Curriculums, Career Paths, and Practice Problems!")
}

// Simple slug generator helper
func generateSlug(title string) string {
	var slug []rune
	for _, r := range title {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			slug = append(slug, r)
		} else if r >= 'A' && r <= 'Z' {
			slug = append(slug, r+32)
		} else if r == ' ' || r == '-' {
			if len(slug) > 0 && slug[len(slug)-1] != '-' {
				slug = append(slug, '-')
			}
		}
	}
	if len(slug) > 0 && slug[len(slug)-1] == '-' {
		slug = slug[:len(slug)-1]
	}
	return string(slug)
}
