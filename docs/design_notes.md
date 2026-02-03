# Project Design Notes

## Context & Team
- **User**: Steve (experienced AppSheet creator/community member since 2016, background in systems/network engineering 1990-2016).
- **Goal**: Enhance AppSheet app editor for experienced creators.
- **Philosophy**: Open source, Vanilla JS/CSS, performance-critical, "no sacred cows".

## Feature: App Definition Explorer
- **Objective**: Explore `window.currentApp().appTemplate` (and eventually other global objects).
- **UI Paradigm**: **Pyramid UI Navigation** (iOS-style Drill-down).
    -   Lists lead to detailed views.
    -   "Back" navigation stack.
    -   Animation/Transition between levels (sliding).
    -   **Lateral Navigation**: Ability to navigate between siblings (Next/Prev) at the current level without going back up.
- **Architecture**: **Web Components (Custom Elements)**.
    -   Extend `HTMLElement` (e.g., `<seas-explorer>`, `<seas-node>`).
    -   Use Shadow DOM (Open) for style isolation (optional, but good for "Vanilla" constraints to avoid bleeding).
    -   Lifecycle hooks (`connectedCallback`, `disconnectedCallback`) for memory management.
- **Constraints**:
    -   **Memory**: Critical. Do not copy/clone large trees. Render on-demand.
    -   **Execution Environment**: Must run in **Main World**.
    -   **Data Isolation**: Keep data in Main World. No large message passing.
- **Data Handling**:
    -   **Robustness**: Must handle **Circular References**, **Functions**, and **Symbols**.
    -   **Strategy**: "Lazy Reading" - only access properties when the node is expanded/viewed. Do not assume serializability.
