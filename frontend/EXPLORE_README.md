# Explore Screen: Emotion-Driven Discovery

Documentation for the redesigned Explore screen in the MOODS app.

## 1. Hierarchy & Order
The Explore screen follows a strict four-section hierarchy designed to guide the user from individual stories to broad community trends.

1.  **Emotion Stories** (Horizontal)
    *   **Goal**: Personal connection.
    *   Displays recent stories with mood-colored rings.
2.  **Community Aura** (Pulse Visualization)
    *   **Goal**: Community overview.
    *   Visualizes the most active moods in the last 24 hours.
    *   **Interaction**: Tapping an aura bubble filters the *Trending Now* section below.
3.  **Trending Now** (Vertical)
    *   **Goal**: High-resonance content discovery.
    *   Includes explainable ranking logic (e.g., "Rising in Joy").
4.  **Suggested Users** (Horizontal)
    *   **Goal**: Meaningful social growth.
    *   Aura-matched recommendations limited to 10 users.

---

## 2. Trending Logic (Backend)
The trending algorithm in `posts.service.ts` calculates a `trendingScore` for posts from the last 7 days.

### Scoring Formula
```
Score = (Likes * 1.5) + (Comments * 2.0) + (Reposts * 3.0) + (Intensity * 2.0) + RecencyBoost
```

### Explainable Reasons
Every trending post is assigned a `trendingReason` to provide context:
*   **"Trending right now"**: High velocity (+10 points) in the first hour.
*   **"Highly shared vibe"**: High number of reposts.
*   **"Intense aura"**: Post has an intensity > 80%.
*   **"Inspiring conversation"**: High interaction via comments.

---

## 3. User Suggestion Algorithm (Backend)
Recommendations in `users.service.ts` prioritize emotional similarity over generic popularity.

1.  **Shared Mood Match** (+3.0 pts): Both users share a dominant mood.
2.  **Intensity Similarity** (+2.0 pts): Users tend to express emotions at similar levels.
3.  **Recent Activity** (+1.5 pts): Prioritizes users who have posted in the last 24-48 hours.
4.  **Mutual Interactions** (+2.5 pts): Boosts users who have interacted with your content.

---

## 4. Design & UX Principles

### Mental-Health-Safe UX
*   **Vocabulary**: Replaced "Viral" with "Resonating" or "Vibe".
*   **Visual cues**: Uses mood-colored glows instead of competitive metrics (like view counts).
*   **Skeleton Loaders**: Custom skeletons for every section to ensure perceived speed.

### Interaction Model
*   **The Filter Toggle**: The `CommunityAura` bubbles act as the primary filter for the `TrendingSection`. Tapping a mood bubble toggle-filters the content, allowing users to "tune in" to specific community frequencies.

---

## 5. Technical Implementation
*   **frontend/app/(tabs)/explore.tsx**: Main layout controller.
*   **backend/src/services/posts.service.ts**: Ranking engine.
*   **frontend/services/trendingService.ts**: Client-side caching (5min TTL).
