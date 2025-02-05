<script lang="ts">
  import IcRoundClose from '~icons/ic/round-close';

  interface Props {
    tags: string[];
    options?: (input: string) => string[];
  }

  let { tags = $bindable(), options }: Props = $props();
  let inputElem = $state<HTMLElement>();

  function handleKeyDown(e: KeyboardEvent) {
    let value = '';
    if (e.key === 'Enter') {
      value = currentInput;
    }
    if (e.key === 'Tab') {
      value = filteredOptions.at(0) || currentInput;
    }

    if (!value) {
      return;
    }

    const matches = value.match(/[^\s,;]+/g) || [];
    matches.forEach((tag) => {
      addTag(tag);
    });

    currentInput = '';
  }

  function removeTag(tag: string) {
    const index = tags.indexOf(tag);
    if (index > -1) {
      tags.splice(index, 1);
    }
  }

  let currentInput = $state('');
  let filteredOptions: string[] = $derived(options?.(currentInput.trim()) ?? []);

  function handleOptionClick(event: MouseEvent, tag: string) {
    addTag(tag);
    currentInput = '';
    if (event.target instanceof HTMLElement) {
      event.target.blur();
    }
  }

  function addTag(tag: string) {
    const normalizedTag = tag.toLowerCase().trim();
    if (!tags.includes(normalizedTag)) {
      tags.push(normalizedTag);
    }
  }
</script>

<div class="tagInput">
  {#each tags as tag (tag)}
    <span class="tag">
      {tag}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span class="button" onclick={() => removeTag(tag)}>
        <IcRoundClose />
      </span>
    </span>
  {/each}
  <input bind:this={inputElem} type="text" onkeydown={handleKeyDown} bind:value={currentInput} />
  {#if filteredOptions.length > 0}
    <ul class="options">
      {#each filteredOptions as option (option)}
        <li>
          <button onclick={(e) => handleOptionClick(e, option)} tabindex="-1">
            {option}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tagInput {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--c-base-200);
    border-radius: 0.5rem;
    font: inherit;
    position: relative;
  }

  span.button {
    padding: 0 0.25em;
    cursor: pointer;
    display: contents;
  }

  input {
    border: none;
    outline: none;
    padding: 0;
    flex: 1;
  }

  ul.options {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
    list-style: none;
    background-color: var(--c-base-200);
    margin: 0;
    padding: 0;
    width: 100%;
    visibility: collapse;
    max-height: 200px;
    overflow: hidden auto;
    border-radius: 0.5rem;
    background-color: var(--c-base-300);
    box-shadow: 0 0 5px #55555555;
  }

  ul.options button {
    padding: 0.25rem 0.5rem;
    width: 100%;
    justify-content: start;
    border-radius: 0;
  }

  ul.options button:hover {
    background-color: var(--c-base-400);
  }

  .tagInput:focus-within ul.options {
    visibility: visible;
  }

  .tagInput:focus-within:has(ul.options) {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
