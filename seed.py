import urllib.request
import json
from pymongo import MongoClient

# First, connect to MongoDB and clear the existing practice problems to avoid duplicates or old copyrighted content
client = MongoClient("mongodb://localhost:27017")
db = client["codemastery"]
db.practice_problems.delete_many({})
print("Cleared existing problems to avoid copyright issues.")

# Custom formulated questions that teach the same concepts but use original wording
problems = [
    {
        "title": "Pair Target Match",
        "difficulty": "Easy",
        "acceptance": "55.0%",
        "topics": ["Array", "Hash Table"],
        "likes": 120,
        "dislikes": 5,
        "description": "You are provided with a list of whole numbers `arr` and a specific goal number `targetValue`.\n\nYour task is to find two distinct numbers in the list that add up to exactly the `targetValue`, and return their positions (indexes).\n\nYou can assume there is always exactly one valid pair that works, and you cannot use the number at the same position twice.",
        "examples": [
            "Input: arr = [2,7,11,15], targetValue = 9\nOutput: [0,1]\nExplanation: The number at index 0 (2) and index 1 (7) sum to 9.",
            "Input: arr = [3,2,4], targetValue = 6\nOutput: [1,2]"
        ],
        "testCases": [
            {
                "input": "[2,7,11,15]\n9",
                "expected_output": "[0,1]",
                "is_hidden": False
            },
            {
                "input": "[3,2,4]\n6",
                "expected_output": "[1,2]",
                "is_hidden": False
            },
            {
                "input": "[3,3]\n6",
                "expected_output": "[0,1]",
                "is_hidden": True
            }
        ]
    },
    {
        "title": "Symmetric Number Validation",
        "difficulty": "Easy",
        "acceptance": "57.2%",
        "topics": ["Math"],
        "likes": 85,
        "dislikes": 12,
        "description": "Write a program to determine if a given integer `n` is symmetrical (reads identically forwards and backwards).\n\nIf it is symmetrical, return `true`; otherwise, return `false`.",
        "examples": [
            "Input: n = 121\nOutput: true\nExplanation: 121 is the same when read in reverse.",
            "Input: n = -121\nOutput: false\nExplanation: The negative sign '-' makes it non-symmetrical when reversed (-121 vs 121-)."
        ],
        "testCases": [
            {
                "input": "121",
                "expected_output": "true",
                "is_hidden": False
            },
            {
                "input": "-121",
                "expected_output": "false",
                "is_hidden": False
            },
            {
                "input": "10",
                "expected_output": "false",
                "is_hidden": True
            }
        ]
    }
]

url = "http://localhost:8081/api/v1/problems"
headers = {'Content-Type': 'application/json'}

for p in problems:
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        response = urllib.request.urlopen(req)
        print(f"Added custom original problem: {p['title']}")
    except Exception as e:
        print(f"Failed to add {p['title']}: {e}")
