<script lang="ts">
  import AppServices from '#lib/components/AppServices.svelte';

  let { children } = $props();
</script>

<AppServices>
  {@render children()}
</AppServices>
