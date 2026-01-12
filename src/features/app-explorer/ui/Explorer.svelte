<script lang="ts">
  import { downloadJSON } from "../../download-app-def/model/download";
  import { onMount } from "svelte";

  let { visible = $bindable(false) } = $props();

  let stack = $state<{ key: string; value: any; scrollPos?: number }[]>([]);
  let searchQuery = $state("");
  let bodyElement = $state<HTMLElement | null>(null);
  let isRestoringScroll = false;

  // Handle visibility internally via event
  onMount(() => {
    const handleToggle = () => (visible = !visible);
    window.addEventListener("SEAS_TOGGLE_EXPLORER", handleToggle);
    loadAppTemplate();
  });

  // Re-try loading if we become visible and have no data
  $effect(() => {
    if (visible && stack.length === 0) {
      loadAppTemplate();
    }
  });

  function loadAppTemplate() {
    try {
      // @ts-ignore
      const app = window.currentApp?.();
      const appTemplate = app?.appTemplate;
      if (appTemplate) {
        stack = [{ key: "Root", value: appTemplate }];
      } else {
        console.warn("SEAS: appTemplate not found in currentApp()");
      }
    } catch (e) {
      console.error("SEAS: Error accessing appTemplate", e);
    }
  }

  const currentNode = $derived(stack[stack.length - 1]);

  const keys = $derived(
    currentNode &&
      typeof currentNode.value === "object" &&
      currentNode.value !== null
      ? Object.keys(currentNode.value)
          .filter((k) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            const keyMatches = k.toLowerCase().includes(q);
            const valMatches = formatValue(currentNode.value[k])
              .toLowerCase()
              .includes(q);
            return keyMatches || valMatches;
          })
          .sort((a, b) => a.localeCompare(b))
      : []
  );

  // Restore scroll position when currentNode changes
  $effect(() => {
    if (visible && currentNode && bodyElement) {
      isRestoringScroll = true;
      bodyElement.scrollTop = currentNode.scrollPos || 0;
      // Use a timeout or tick to ensure scroll is finished before we start tracking again
      setTimeout(() => {
        isRestoringScroll = false;
      }, 50);
    }
  });

  function handleScroll(e: Event) {
    if (isRestoringScroll || !currentNode) return;
    const target = e.target as HTMLElement;
    currentNode.scrollPos = target.scrollTop;
  }

  function navigateTo(key: string, value: any) {
    if (value && typeof value === "object") {
      stack.push({ key, value });
    }
  }

  function goBack() {
    if (stack.length > 1) {
      stack.pop();
    }
  }

  function goToIndex(index: number) {
    stack = stack.slice(0, index + 1);
  }

  function isExpandable(val: any) {
    return val !== null && typeof val === "object";
  }

  function formatValue(val: any) {
    if (val === null) return "null";
    if (typeof val === "string") return `"${val}"`;
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (typeof val === "object") return "Object";
    return String(val);
  }

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    // Escape regex special characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(regex, '<span class="seas-match-highlight">$1</span>');
  }

  function close() {
    visible = false;
  }
</script>

{#if visible}
  <div
    class="seas-explorer-overlay"
    onclick={close}
    onkeydown={(e) => e.key === "Escape" && close()}
    role="presentation"
  >
    <div
      class="seas-explorer-panel"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="seas-explorer-header">
        <div class="seas-header-main">
          <div class="seas-header-title">
            <button
              class="seas-btn-back"
              onclick={goBack}
              disabled={stack.length <= 1}
              title="Back"
            >
              &larr;
            </button>
            <h1 title={currentNode?.key || "Explorer"}>
              {currentNode?.key || "Explorer"}
            </h1>
          </div>
          <div class="seas-header-actions">
            <button
              class="seas-btn-action"
              onclick={loadAppTemplate}
              title="Refresh Data"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                />
              </svg>
            </button>
            <button
              class="seas-btn-action"
              onclick={() => downloadJSON(currentNode.value, currentNode.key)}
              title="Download current node as JSON"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                />
              </svg>
            </button>
            <button class="seas-btn-close" onclick={close}>&times;</button>
          </div>
        </div>

        <div class="seas-breadcrumbs">
          {#each stack as node, i}
            <button class="seas-breadcrumb-btn" onclick={() => goToIndex(i)}>
              {node.key}
            </button>
            {#if i < stack.length - 1}
              <span class="seas-breadcrumb-separator">/</span>
            {/if}
          {/each}
        </div>

        <div class="seas-search-bar">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Filter properties..."
          />
          {#if searchQuery}
            <button
              class="seas-btn-clear"
              onclick={() => (searchQuery = "")}
              title="Clear Search"
            >
              &times;
            </button>
          {/if}
        </div>
      </div>

      <main
        class="seas-explorer-body"
        bind:this={bodyElement}
        onscroll={handleScroll}
      >
        {#if keys.length === 0}
          <div class="seas-no-results">No properties found.</div>
        {:else}
          <table class="seas-node-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {#each keys as key}
                <tr
                  class:expandable={isExpandable(currentNode.value[key])}
                  onclick={() => navigateTo(key, currentNode.value[key])}
                  onkeydown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    navigateTo(key, currentNode.value[key])}
                  role="button"
                  tabindex={isExpandable(currentNode.value[key]) ? 0 : -1}
                  aria-label={isExpandable(currentNode.value[key])
                    ? `Drill into ${key}`
                    : undefined}
                >
                  <td class="seas-key-cell"
                    >{@html highlightMatch(key, searchQuery)}</td
                  >
                  <td class="seas-val-cell">
                    <span class="seas-val-preview"
                      >{@html highlightMatch(
                        formatValue(currentNode.value[key]),
                        searchQuery
                      )}</span
                    >
                    {#if isExpandable(currentNode.value[key])}
                      <span class="seas-expand-icon">›</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </main>
    </div>
  </div>
{/if}
