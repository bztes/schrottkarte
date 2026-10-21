<script lang="ts">
  const defaultColors = [
    undefined,
    '#000000',
    '#008939',
    '#8abd24',
    '#ff0000',
    '#ff8800',
    '#9a24a5',
    '#ea75de',
    '#334eff',
    '#4d8dd1',
  ];

  interface Props {
    color: string | undefined;
    colors?: (string | undefined)[];
    label?: string;
  }

  let { color = $bindable(), colors = defaultColors, label = 'Color' }: Props = $props();
</script>

<div class="swatches" role="radiogroup" aria-label={label}>
  {#each colors as c (c ?? 'none')}
    <button
      type="button"
      role="radio"
      aria-checked={c?.toLowerCase() === color?.toLowerCase()}
      aria-label={c ?? 'Default color'}
      title={c ?? 'Default color'}
      class:none={!c}
      style:--swatch={c}
      onclick={() => (color = c)}
    ></button>
  {/each}
</div>

<style>
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  button {
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border: 1px solid rgb(0 0 0 / 0.1);
    border-radius: 999px;
    background: var(--swatch);
    cursor: pointer;
    transition: transform 0.1s;
  }

  button.none {
    background: repeating-linear-gradient(-45deg, #fff 0 4px, var(--c-base-400) 4px 8px);
  }

  button:hover {
    transform: scale(1.12);
  }

  button[aria-checked='true'] {
    box-shadow:
      0 0 0 2px var(--c-base-100),
      0 0 0 4px var(--c-primary);
  }
</style>
