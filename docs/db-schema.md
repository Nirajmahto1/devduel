# DevDuel — Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ MATCHES : "plays as player1"
    USERS ||--o{ MATCHES : "plays as player2"
    USERS ||--o{ SUBMISSIONS : submits
    USERS ||--o{ PROBLEMS : creates
    PROBLEMS ||--|{ TEST_CASES : has
    PROBLEMS ||--o{ MATCHES : "used in"
    PROBLEMS ||--o{ SUBMISSIONS : "solved in"
    MATCHES ||--o{ SUBMISSIONS : contains

    USERS {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        string avatar_url
        enum oauth_provider
        string oauth_id
        enum role
        int rating
        int wins
        int losses
        int draws
        timestamp created_at
        timestamp updated_at
    }

    PROBLEMS {
        uuid id PK
        string title
        text description
        enum difficulty
        text_array tags
        text input_format
        text output_format
        text constraints
        text sample_input
        text sample_output
        int time_limit_ms
        int memory_limit_kb
        uuid created_by FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TEST_CASES {
        uuid id PK
        uuid problem_id FK
        text input
        text expected_output
        boolean is_sample
        int order
    }

    MATCHES {
        uuid id PK
        uuid player1_id FK
        uuid player2_id FK
        uuid problem_id FK
        uuid winner_id FK
        enum status
        enum match_type
        string invite_code UK
        int player1_rating_before
        int player2_rating_before
        int player1_rating_change
        int player2_rating_change
        int duration_seconds
        timestamp started_at
        timestamp ended_at
    }

    SUBMISSIONS {
        uuid id PK
        uuid user_id FK
        uuid match_id FK
        uuid problem_id FK
        text code
        string language
        enum verdict
        int tests_passed
        int tests_total
        int execution_time_ms
        int memory_used_kb
        jsonb test_results
        timestamp created_at
    }
```

## Notes
- Default user rating: **1200** (standard Elo starting point)
- Match duration default: **1800 seconds** (30 minutes)
- Verdicts: AC (Accepted), WA (Wrong Answer), TLE (Time Limit Exceeded), RE (Runtime Error), CE (Compilation Error), MLE (Memory Limit Exceeded)
- Problems use Markdown for descriptions
- Tags stored as Postgres `TEXT[]` array for efficient filtering
