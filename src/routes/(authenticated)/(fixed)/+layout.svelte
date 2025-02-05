<script lang="ts">
  let { children } = $props();
</script>

<div class="content">
  {@render children()}
</div>

<style>
  .content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100svw;
    height: 100svh;
  }
</style>
