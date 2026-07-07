import { db } from "@workspace/db";
import {
  usersTable,
  teamsTable,
  teamMembersTable,
  contestsTable,
  problemsTable,
  contestProblemsTable,
  submissionsTable,
  violationsTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  try {
    // 0. Clean up existing data
    console.log("Cleaning up existing data...");
    await db.delete(violationsTable);
    await db.delete(submissionsTable);
    await db.delete(contestProblemsTable);
    await db.delete(contestsTable);
    await db.delete(problemsTable);
    await db.delete(teamMembersTable);
    await db.delete(teamsTable);
    await db.delete(usersTable);

    // Reset all sequences so IDs restart from 1 on every seed
    const sequences = ["users_id_seq", "teams_id_seq", "team_members_id_seq", "problems_id_seq", "contests_id_seq", "contest_problems_id_seq", "submissions_id_seq", "registrations_id_seq", "virtual_participations_id_seq", "violations_id_seq"];
    for (const seq of sequences) {
      try { await db.execute(`ALTER SEQUENCE ${seq} RESTART WITH 1` as any); } catch (_) { /* sequence may not exist */ }
    }

    // 1. Users
    const usersData = Array.from({ length: 20 }).map((_, i) => ({
      username: `coder_${i + 1}`,
      displayName: `Coder ${i + 1}`,
      email: `coder${i + 1}@arena.local`,
      rating: 800 + Math.floor(Math.random() * 2400),
      maxRating: 800 + Math.floor(Math.random() * 2400),
      rank: i + 1,
      tier: "expert" as any,
      contestsParticipated: Math.floor(Math.random() * 50),
      problemsSolved: Math.floor(Math.random() * 500),
      totalSubmissions: Math.floor(Math.random() * 2000),
      acceptanceRate: 0.1 + Math.random() * 0.8,
      country: ["US", "IN", "CN", "RU", "JP"][Math.floor(Math.random() * 5)],
    }));
    const users = await db.insert(usersTable).values(usersData).returning();
    console.log(`Inserted ${users.length} users.`);

    // 2. Teams
    const teamsData = Array.from({ length: 5 }).map((_, i) => ({
      name: `Team Alpha ${i + 1}`,
      description: "A competitive programming team.",
      memberCount: 3,
      maxMembers: 4,
      rating: 1200 + Math.floor(Math.random() * 1000),
    }));
    const teams = await db.insert(teamsTable).values(teamsData).returning();
    console.log(`Inserted ${teams.length} teams.`);

    // 3. Problems
    const problemsData = [
      { 
        title: "Two Sum", 
        difficulty: "easy" as any, 
        description: "<h3>Two Sum</h3><p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p><p>You may assume that each input would have <b>exactly one solution</b>, and you may not use the <em>same</em> element twice.</p><p>You can return the answer in any order.</p><h4>INPUT FORMAT</h4><p>The first line contains an integer <code>n</code> (the length of the array) and the integer <code>target</code>. The second line contains <code>n</code> space-separated integers.</p><h4>OUTPUT FORMAT</h4><p>Print two space-separated integers — the 0-based indices of the two numbers.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>4 9<br/>2 7 11 15</p><p><b>Output:</b><br/>0 1</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> nums[0] + nums[1] = 2 + 7 = 9</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>3 6<br/>3 2 4</p><p><b>Output:</b><br/>1 2</p></div><h4>CONSTRAINTS</h4><ul><li><code>2 &le; nums.length &le; 10^4</code></li><li><code>-10^9 &le; nums[i] &le; 10^9</code></li><li><code>-10^9 &le; target &le; 10^9</code></li><li>Exactly one valid answer exists.</li></ul>", 
        timeLimit: 1000, 
        memoryLimit: 256, 
        tags: ["array", "hash-table"] 
      },
      { 
        title: "Longest Substring Without Repeating Characters", 
        difficulty: "medium" as any, 
        description: "<h3>Longest Substring Without Repeating Characters</h3><p>Given a string <code>s</code>, find the length of the <b>longest substring</b> without repeating characters.</p><h4>INPUT FORMAT</h4><p>A single line containing the string <code>s</code>.</p><h4>OUTPUT FORMAT</h4><p>Print a single integer — the length of the longest valid substring.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>abcabcbb</p><p><b>Output:</b><br/>3</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> The answer is \"abc\", with the length of 3.</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>bbbbb</p><p><b>Output:</b><br/>1</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> The answer is \"b\", with the length of 1.</p></div><h4>CONSTRAINTS</h4><ul><li><code>0 &le; s.length &le; 5 * 10^4</code></li><li><code>s</code> consists of English letters, digits, symbols and spaces.</li></ul>", 
        timeLimit: 1000, 
        memoryLimit: 256, 
        tags: ["string", "sliding-window"] 
      },
      { 
        title: "Median of Two Sorted Arrays", 
        difficulty: "hard" as any, 
        description: "<h3>Median of Two Sorted Arrays</h3><p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays.</p><p>The overall run time complexity should be <code>O(log (m+n))</code>.</p><h4>INPUT FORMAT</h4><p>The first line contains two integers <code>m</code> and <code>n</code>. The second line contains <code>m</code> space-separated integers for <code>nums1</code>. The third line contains <code>n</code> space-separated integers for <code>nums2</code>.</p><h4>OUTPUT FORMAT</h4><p>Print a single floating point number representing the median.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>2 1<br/>1 3<br/>2</p><p><b>Output:</b><br/>2.00000</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> merged array = [1,2,3] and median is 2.</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>2 2<br/>1 2<br/>3 4</p><p><b>Output:</b><br/>2.50000</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.</p></div><h4>CONSTRAINTS</h4><ul><li><code>0 &le; m, n &le; 1000</code></li><li><code>1 &le; m + n &le; 2000</code></li><li><code>-10^6 &le; nums1[i], nums2[i] &le; 10^6</code></li></ul>", 
        timeLimit: 2000, 
        memoryLimit: 256, 
        tags: ["array", "binary-search", "divide-and-conquer"] 
      },
      { 
        title: "Valid Parentheses", 
        difficulty: "easy" as any, 
        description: "<h3>Valid Parentheses</h3><p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p><p>An input string is valid if:</p><ol><li>Open brackets must be closed by the same type of brackets.</li><li>Open brackets must be closed in the correct order.</li><li>Every close bracket has a corresponding open bracket of the same type.</li></ol><h4>INPUT FORMAT</h4><p>A single line containing the string <code>s</code>.</p><h4>OUTPUT FORMAT</h4><p>Print <code>true</code> if the string is valid, otherwise <code>false</code>.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>()[]{}</p><p><b>Output:</b><br/>true</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>(]</p><p><b>Output:</b><br/>false</p></div><h4>CONSTRAINTS</h4><ul><li><code>1 &le; s.length &le; 10^4</code></li><li><code>s</code> consists of parentheses only <code>'()[]{}'</code>.</li></ul>", 
        timeLimit: 1000, 
        memoryLimit: 256, 
        tags: ["string", "stack"] 
      },
      { 
        title: "Merge k Sorted Lists", 
        difficulty: "hard" as any, 
        description: "<h3>Merge k Sorted Lists</h3><p>You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.</p><p><em>Merge all the linked-lists into one sorted linked-list and return it.</em></p><h4>INPUT FORMAT</h4><p>The first line contains an integer <code>k</code>. The next <code>k</code> lines each describe a linked list: the first integer <code>n</code> is the size, followed by <code>n</code> integers representing the elements.</p><h4>OUTPUT FORMAT</h4><p>Print the merged sorted linked-list elements separated by spaces.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>3<br/>3 1 4 5<br/>3 1 3 4<br/>2 2 6</p><p><b>Output:</b><br/>1 1 2 3 4 4 5 6</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>0</p><p><b>Output:</b><br/></p></div><h4>CONSTRAINTS</h4><ul><li><code>0 &le; k &le; 10^4</code></li><li><code>0 &le; lists[i].length &le; 500</code></li><li><code>-10^4 &le; lists[i][j] &le; 10^4</code></li><li><code>lists[i]</code> is sorted in ascending order.</li><li>The sum of <code>lists[i].length</code> will not exceed <code>10^4</code>.</li></ul>", 
        timeLimit: 2000, 
        memoryLimit: 512, 
        tags: ["linked-list", "divide-and-conquer", "heap"] 
      },
      { 
        title: "Maximum Subarray", 
        difficulty: "medium" as any, 
        description: "<h3>Maximum Subarray</h3><p>Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.</p><h4>INPUT FORMAT</h4><p>The first line contains an integer <code>n</code>. The second line contains <code>n</code> space-separated integers.</p><h4>OUTPUT FORMAT</h4><p>Print a single integer — the maximum subarray sum.</p><h4>EXAMPLES</h4><div class='bg-muted/30 p-4 rounded-lg mb-4 border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 1</h5><p><b>Input:</b><br/>9<br/>-2 1 -3 4 -1 2 1 -5 4</p><p><b>Output:</b><br/>6</p><p class='text-muted-foreground mt-2'><b>Explanation:</b> The subarray [4,-1,2,1] has the largest sum 6.</p></div><div class='bg-muted/30 p-4 rounded-lg border border-border/50'><h5 class='text-primary font-bold mb-2'>EXAMPLE 2</h5><p><b>Input:</b><br/>1<br/>1</p><p><b>Output:</b><br/>1</p></div><h4>CONSTRAINTS</h4><ul><li><code>1 &le; nums.length &le; 10^5</code></li><li><code>-10^4 &le; nums[i] &le; 10^4</code></li></ul>", 
        timeLimit: 1000, 
        memoryLimit: 256, 
        tags: ["array", "divide-and-conquer", "dynamic-programming"] 
      },
    ];
    const problems = await db.insert(problemsTable).values(problemsData).returning();
    console.log(`Inserted ${problems.length} problems.`);

    // 4. Contests
    const now = new Date();
    const contestsData = [
      { title: "Codeforces Round #950 (Div. 2)", status: "active" as any, type: "individual" as any, startTime: new Date("2026-06-16T11:36:00"), endTime: new Date("2026-06-16T13:36:00"), duration: 120, difficulty: "intermediate" as any },
      { title: "Educational Codeforces Round 175", status: "active" as any, type: "individual" as any, startTime: new Date("2026-06-16T12:06:00"), endTime: new Date("2026-06-16T14:06:00"), duration: 120, difficulty: "beginner" as any },
      { title: "ICPC World Finals 2025 Practice", status: "upcoming" as any, type: "team" as any, startTime: new Date("2026-06-18T12:36:00"), endTime: new Date("2026-06-18T17:36:00"), duration: 300, difficulty: "expert" as any },
      { title: "Codeforces Round #951 (Div. 1+2)", status: "upcoming" as any, type: "individual" as any, startTime: new Date("2026-06-19T12:36:00"), endTime: new Date("2026-06-19T15:06:00"), duration: 150, difficulty: "advanced" as any },
      { title: "AtCoder Grand Contest 069", status: "ended" as any, type: "individual" as any, startTime: new Date("2026-06-09T12:36:00"), endTime: new Date("2026-06-09T14:36:00"), duration: 120, difficulty: "advanced" as any },
      { title: "LeetCode Weekly Contest 410", status: "ended" as any, type: "individual" as any, startTime: new Date("2026-06-13T12:36:00"), endTime: new Date("2026-06-13T14:06:00"), duration: 90, difficulty: "beginner" as any },
    ];
    const contests = await db.insert(contestsTable).values(contestsData).returning();
    console.log(`Inserted ${contests.length} contests.`);

    // 5. Contest Problems — assign problems to all contests
    if (contests.length > 0 && problems.length >= 6) {
      await db.insert(contestProblemsTable).values([
        // Contest 1 - Codeforces Round #950 (all 6 problems)
        { contestId: contests[0].id, problemId: problems[0].id, contestOrder: 1, points: 100 },
        { contestId: contests[0].id, problemId: problems[1].id, contestOrder: 2, points: 200 },
        { contestId: contests[0].id, problemId: problems[2].id, contestOrder: 3, points: 300 },
        { contestId: contests[0].id, problemId: problems[3].id, contestOrder: 4, points: 500 },
        { contestId: contests[0].id, problemId: problems[4].id, contestOrder: 5, points: 500 },
        { contestId: contests[0].id, problemId: problems[5].id, contestOrder: 6, points: 700 },
        // Contest 2 - Educational Codeforces Round 175 (4 problems)
        { contestId: contests[1].id, problemId: problems[0].id, contestOrder: 1, points: 100 },
        { contestId: contests[1].id, problemId: problems[1].id, contestOrder: 2, points: 200 },
        { contestId: contests[1].id, problemId: problems[2].id, contestOrder: 3, points: 300 },
        { contestId: contests[1].id, problemId: problems[3].id, contestOrder: 4, points: 500 },
        // Contest 3 - ICPC World Finals (5 problems)
        { contestId: contests[2].id, problemId: problems[1].id, contestOrder: 1, points: 200 },
        { contestId: contests[2].id, problemId: problems[2].id, contestOrder: 2, points: 300 },
        { contestId: contests[2].id, problemId: problems[3].id, contestOrder: 3, points: 500 },
        { contestId: contests[2].id, problemId: problems[4].id, contestOrder: 4, points: 500 },
        { contestId: contests[2].id, problemId: problems[5].id, contestOrder: 5, points: 700 },
        // Contest 4 - Codeforces Round #951 (3 problems)
        { contestId: contests[3].id, problemId: problems[2].id, contestOrder: 1, points: 300 },
        { contestId: contests[3].id, problemId: problems[4].id, contestOrder: 2, points: 500 },
        { contestId: contests[3].id, problemId: problems[5].id, contestOrder: 3, points: 700 },
        // Contest 5 - AtCoder Grand Contest 069 (4 problems)
        { contestId: contests[4].id, problemId: problems[0].id, contestOrder: 1, points: 100 },
        { contestId: contests[4].id, problemId: problems[1].id, contestOrder: 2, points: 200 },
        { contestId: contests[4].id, problemId: problems[3].id, contestOrder: 3, points: 500 },
        { contestId: contests[4].id, problemId: problems[5].id, contestOrder: 4, points: 700 },
        // Contest 6 - LeetCode Weekly Contest 410 (3 problems)
        { contestId: contests[5].id, problemId: problems[0].id, contestOrder: 1, points: 100 },
        { contestId: contests[5].id, problemId: problems[1].id, contestOrder: 2, points: 200 },
        { contestId: contests[5].id, problemId: problems[2].id, contestOrder: 3, points: 300 },
      ]);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed().catch(console.error);
