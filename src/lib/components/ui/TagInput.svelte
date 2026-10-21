<script lang="ts">
  import LucideX from '~icons/lucide/x';

  interface Props {
    tags: string[];
    /** suggestions for the current input */
    options?: (input: string) => string[];
    placeholder?: string;
    label?: string;
  }

  let { tags = $bindable(), options, placeholder = 'Add tag…', label = 'Tags' }: Props = $props();

  let input = $state('');
  let open = $state(false);
  let highlighted = $state(0);
  const suggestions = $derived(options?.(input.trim()) ?? []);

  function add(value: string) {
    for (const tag of value.match(/[^\s,;]+/g) ?? []) {
      const normalized = tag.toLowerCase().trim();
      if (normalized && !tags.includes(normalized)) {
        tags.push(normalized);
      }
    }
    input = '';
    highlighted = 0;
  }

  function remove(tag: string) {
    const index = tags.indexOf(tag);
    if (index > -1) {
      tags.splice(index, 1);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      highlighted = (highlighted + 1) % suggestions.length;
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      highlighted = (highlighted - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === 'Enter' || (e.key === 'Tab' && input)) {
      const value = open && suggestions[highlighted] ? suggestions[highlighted] : input;
      if (value) {
        e.preventDefault();
        add(value);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      tags.pop();
    } else if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

<div class="tag-input">
  {#each tags as tag (tag)}
    <span class="tag">
      {tag}
      <button type="button" aria-label="Remove {tag}" onclick={() => remove(tag)}>
        <LucideX />
      </button>
    </span>
  {/each}
  <input
    class="bare"
    type="text"
    aria-label={label}
    placeholder={tags.length === 0 ? placeholder : ''}
    bind:value={input}
    onkeydown={handleKeyDown}
    onfocus={() => (open = true)}
    onblur={() => (open = false)}
    oninput={() => ((open = true), (highlighted = 0))}
  />
  {#if open && suggestions.length > 0}
    <ul class="suggestions" role="listbox">
      {#each suggestions as suggestion, i (suggestion)}
        <li role="option" aria-selected={i === highlighted}>
          <!-- pointerdown keeps the focus in the input -->
          <button
            type="button"
            tabindex="-1"
            onpointerdown={(e) => (e.preventDefault(), add(suggestion))}
          >
            {suggestion}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tag-input {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.45rem;
    box-sizing: border-box;
    padding: 0.3rem 0.4rem;
    border: 1px solid var(--c-border);
    border-radius: 0.6rem;
    background-color: var(--c-base-100);
    font-weight: normal;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .tag-input:focus-within {
    border-color: var(--c-primary);
    box-shadow: var(--focus-ring);
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    padding: 0.1rem 0.2rem 0.1rem 0.55rem;
    border-radius: 999px;
    background-color: var(--c-primary-soft);
    color: var(--c-primary-active);
    font-size: var(--fs-sm);
    font-weight: 500;
  }

  .tag button {
    display: grid;
    place-items: center;
    padding: 0.1rem;
    border: none;
    border-radius: 999px;
    background: none;
    color: inherit;
    cursor: pointer;
  }

  .tag button:hover {
    background-color: rgb(0 0 0 / 0.08);
  }

  input.bare {
    flex: 1;
    min-width: 5rem;
    padding: 0.2rem 0.3rem;
    border: none;
    box-shadow: none;
    background: none;
    font: inherit;
    color: inherit;
    outline: none;
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    z-index: 20;
    margin: 0;
    padding: 0.25rem;
    list-style: none;
    max-height: 12rem;
    overflow: auto;
    border: 1px solid var(--c-border);
    border-radius: 0.6rem;
    background-color: var(--c-base-100);
    box-shadow: var(--shadow-md);
  }

  .suggestions button {
    width: 100%;
    justify-content: flex-start;
    padding: 0.35rem 0.5rem;
    border: none;
    border-radius: 0.4rem;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: normal;
    text-align: left;
    cursor: pointer;
  }

  [aria-selected='true'] button,
  .suggestions button:hover {
    background-color: var(--c-base-300);
  }
</style>
