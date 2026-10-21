<script lang="ts">
  interface Props {
    color: string;
    size?: 'sm' | 'md';
  }

  let { color, size = 'sm' }: Props = $props();
</script>

<span class={['dot', size]} style:background-color={color}></span>

<style>
  .dot {
    display: inline-block;
    flex: none;
    border-radius: 999px;
  }

  .sm {
    width: 0.6rem;
    height: 0.6rem;
  }

  .md {
    width: 0.9rem;
    height: 0.9rem;
    box-shadow:
      0 0 0 2px var(--c-base-100),
      0 0 0 3px var(--c-border);
  }
</style>
