import { CardType } from "../hooks/useCard";

export const cards: CardType[] = [
  {
    id: "card-1",
    front:
      "Backend: Create a schema for scoring and ranking an autocomplete term over Help articles and Listings",
    back: `Reverse index: \n\`\`\`ts
{
  term: string;
  postings: Array [{
    score: number; // relevance, tf-idf, boosted by user behavior, etc.
    type: 'help' | 'listing' | 'location';
    id: string; // document ID (or opaque lookup key)
    fields: { 
      /* minimal renderable subset */ 
      title: string; url: string; asset?: string; 
    }
    data: { /* optional type-specific data */ }
  }]
}
\`\`\``,
  },
  {
    id: "card-2",
    front:
      "Backend: A relational database is being overwhelmed by writes, what steps would you take to resolve the issue?",
    back: `### **1. Optimize First (Low-hanging fruit)**
- **Batch writes**: Combine multiple inserts into single transactions
- **Remove unnecessary indexes**: Each index slows writes
- **Optimize queries**: Remove N+1 queries, use prepared statements
- **Connection pooling**: Reduce connection overhead

### **2. Scale Vertically (Quick wins)**
- **Faster storage**: SSD → NVMe, increase IOPS
- **More memory**: Reduce disk writes through larger buffers
- **Better CPU**: Handle more concurrent writes

### **3. Read/Write Separation**
- **Read replicas**: Offload read queries to replicas
- **Write to primary only**: Reduces contention on main DB
- **Application routing**: Smart load balancing between read/write

### **4. Horizontal Scaling (Long-term)**
- **Sharding**: Partition data across multiple databases
- **Different storage per use case**: 
  - Hot data → In-memory (Redis)
  - Write-heavy → NoSQL (Cassandra, DynamoDB)
  - Analytics → Data warehouse (BigQuery)

### **5. Architectural Changes**
- **Async processing**: Queue writes, process in batches
- **Event sourcing**: Store events instead of current state
- **CQRS**: Separate read/write models entirely

### **Key Decision Framework**: Start with #1-2, move to #3-4 only when necessary. Don't skip to complex solutions without trying simple optimizations first.`,
  },
  {
    id: "card-3",
    front: "Why can't you just always use WebSockets?",
    back: `WebSockets require:

Load balancers or proxies that support connection upgrade
Explicit connection management (retries, heartbeats, backoff)
More backend infra (stateful handlers, horizontal scaling)

Principle: WebSockets are power tools — not default tools.`,
  },
  {
    // for /answer-code testing
    id: "card-4",
    front:
      "Given two strings, return the minimum edit distance (insertions, deletions, substitutions) needed to transform one into the other.",
    back: `Intuition: the solution to the problem can be built from solutions to smaller sub problems. "Can the minimal edits to get from s1[:i] to s2[:j] help me compute the edits for s1[:i+1] to s2[:j+1]

\`\`\`python
def min_edit_distance(s1: str, s2: str) -> int:
  m, n = len(s1) len(s2)
  dp = [[0] * (n+1) for _ in range(m+1)]

  # Initialize base cases
  for i in range(m+1):
    dp[i][0] = i # delete all characters from s1
  for j in range(n+1):
    dp[0][j] = j # insert all characters into s1
  # fill the dp table
  for i in range(1, m+1):
    for j in range(1, n+1):
      if (s1[i-1] == s2[j-1]:
        dp[i][j] = dp[i-1][j-1] # characters match, no moves
      else:
        dp[i][j] = 1 + min(
          dp[i-1][j], # deletion
          dp[i][j-1], # insertion
          dp[i-1][j-1] # substitution
        )
  return dp[m][n]
\`\`\``,
  },
  {
    id: "card-5",
    front:
      "Backend: How do you systematically identify database entities from business requirements without missing key concepts?",
    back: `**The "Noun + Verb" Method:**
1. **Extract nouns** from requirements → potential entities
2. **Extract verbs** → potential relationships/attributes
3. **Ask "what changes independently?"** → separate entities

**Example - Flight Search:**
- **Nouns:** Airlines, flights, fare classes, prices, availability
- **What changes independently?**
  - Airline info (rarely changes) → \`airlines\` table
  - Flight schedules (weekly changes) → \`flights\` table  
  - Daily pricing/availability (hourly changes) → \`flight_instances\` + \`fare_classes\` tables

**Pro tip:** Ask "If this changes, what else needs to update?" If the answer is "many things," you probably need separate entities.

**Example:** "Airlines offer flights with different fare classes that have varying prices and availability"`,
  },
];
