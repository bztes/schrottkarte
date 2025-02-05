<script lang="ts">
  const defaultColors = [
    undefined,
    '#000000',
    '#008939',
    '#8abd24',
    '#FF0000',
    '#FF8800',
    '#9A24A5',
    '#EA75DE',
    '#334EFF',
    '#4D8DD1',
  ];

  interface Props {
    color: string | undefined;
    colors?: (string | undefined)[];
  }

  let { color = $bindable(), colors = defaultColors }: Props = $props();

  let colorPickerPos = $state<{ top: number; left: number }>();
  function handleButtonClick(e: MouseEvent) {
    e.preventDefault();
    colorPickerPos = { top: e.clientY, left: e.clientX };
  }

  function setColor(c?: string) {
    color = c;
    colorPickerPos = undefined;
  }
</script>

<input
  type="color"
  onclick={handleButtonClick}
  value={color}
  aria-label="Color Picker Button"
  onblur={() => (colorPickerPos = undefined)}
/>

{#if colorPickerPos}
  <ul style:top={`${colorPickerPos.top}px`} style:left={`${colorPickerPos.left}px`}>
    {#each colors as c}
      <li style:--color={c}>
        <button onpointerdown={() => setColor(c)} aria-label={c} class:selected={c === color}>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  input[type='color'] {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    height: 2rem;
    width: auto;
  }

  input[type='color']::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input[type='color']::-webkit-color-swatch {
    border: 0;
    border-radius: 0.25rem;
  }

  input[type='color']::-moz-color-swatch,
  input[type='color']::-moz-focus-inner {
    border: 0;
    border-radius: 0.25rem;
  }

  ul {
    position: fixed;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 100;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background-color: var(--c-base-100);
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--c-base-300);
    gap: 0.25rem;
  }

  button {
    background: var(--color, repeating-linear-gradient(-45deg, #fff 0 20px, #f4f4f4 0 40px));
    width: 2rem;
    height: 2rem;
    border-radius: 0.25rem;
  }

  button:hover {
    transform: scale(1.1);
  }

  button.selected {
    border-radius: 999px;
    pointer-events: none;
  }
</style>
