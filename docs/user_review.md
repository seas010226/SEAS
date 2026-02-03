# User Code Review Notes

## Guidelines
-   [ ] **Skill Update**: Add "2-space indentation" rule to `developer/SKILL.md`.

## Actions
-   [ ] **Manifest**: Remove `action` (popup) configuration.
-   [ ] **Cleanup**: Remove unused `popup/` directory and files.
-   [ ] **Cleanup**: Remove `background/service-worker.js` and update manifest.
-   [ ] **Cleanup**: Remove `content/styles.css` (Styles are now in Shadow DOM).
-   [ ] **Refactor**: Remove unused `SeasNode` import in `content.js`.
-   [ ] **Refactor**: Move "Content script loaded" log to end of execution in `content.js`.
-   [ ] **Performance**: Optimize `isExpandable` check in `object-reader.js` (avoid `Reflect.ownKeys` on large objects).
-   [ ] **Performance**: Optimize `VirtualList` scroll handler (use `requestAnimationFrame`).
-   [ ] **Cleanup**: Remove verbose "thought process" and redundant comments in `VirtualList.js`.
-   [ ] **Refactor**: Rename `object-reader.js` to `read-properties.js`.
-   [ ] **Refactor**: Rename `VirtualList.js` to `virtual-list.js`.
-   [ ] **Refactor**: Rename `SeasExplorer.js` to `seas-explorer.js`.
-   [ ] **Refactor**: Rename `SeasNode.js` to `seas-node.js`.
