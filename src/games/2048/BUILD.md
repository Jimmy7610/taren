# 2048 — Build #4

Win + Game Over + Best score + Restart flow.

- Win detection: reaching 2048 triggers a subtle overlay (can Continue)
- Continue keeps the current board and score (no reset)
- Game Over detection: no empty cells + no adjacent merges -> overlay
- Best score persisted (localStorage, scoped key)
- Restart button added; restart returns to Idle (Two-step start), no auto-start loop
MD

# global: Build #35
