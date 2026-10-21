<script lang="ts">
  import LucideMapPin from '~icons/lucide/map-pin';

  interface Props {
    /** pixels of the map covered by panels, keeps the pin on the map center */
    left?: number;
    bottom?: number;
  }

  let { left = 0, bottom = 0 }: Props = $props();
</script>

<div class="center-pin" style:left="{left}px" style:bottom="{bottom}px" aria-hidden="true">
  <span class="shadow"></span>
  <span class="pin"><LucideMapPin /></span>
</div>

<style>
  .center-pin {
    pointer-events: none;
    position: absolute;
    z-index: 10;
    top: 0;
    right: 0;
    display: grid;
    place-items: center;
  }

  .center-pin > * {
    grid-area: 1 / 1;
  }

  .shadow {
    width: 0.6rem;
    height: 0.3rem;
    border-radius: 50%;
    background-color: rgb(0 0 0 / 0.35);
  }

  /* the tip of the pin sits on the map center */
  .pin {
    display: flex;
    transform: translateY(-46%);
    color: var(--c-secondary);
    font-size: 2.6rem;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.3));
  }

  .pin :global(svg) {
    fill: var(--c-base-100);
  }
</style>
