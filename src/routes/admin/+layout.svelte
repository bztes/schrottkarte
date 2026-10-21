<script lang="ts">
  import '../../global.css';
  import { page } from '$app/state';
  import { adminRoutes, hasRole } from '#lib/types.js';
  import UserMenu from '#lib/components/UserMenu.svelte';
  import NavTab from '#lib/components/ui/NavTab.svelte';
  import LucidePenTool from '~icons/lucide/pen-tool';
  import LucideDownload from '~icons/lucide/download';
  import LucideUsers from '~icons/lucide/users';
  import LucideCloudUpload from '~icons/lucide/cloud-upload';
  import LucideLayers from '~icons/lucide/layers';

  let { children, data } = $props();

  const tabInfo = {
    '/admin': { label: 'Editor', icon: LucidePenTool },
    '/admin/export': { label: 'Export', icon: LucideDownload },
    '/admin/layers': { label: 'Map layers', icon: LucideLayers },
    '/admin/users': { label: 'Users', icon: LucideUsers },
    '/admin/migrate': { label: 'Supabase import', icon: LucideCloudUpload },
  } satisfies Record<(typeof adminRoutes)[number]['href'], unknown>;

  const tabs = $derived(
    adminRoutes
      .filter((route) => hasRole(data.user, route.role))
      .map((route) => ({ href: route.href, ...tabInfo[route.href] })),
  );

  // the editor is a full-size map, all other pages are regular content
  const fill = $derived(page.url.pathname === '/admin');
</script>

<div class="shell" class:fill>
  <header class="topbar">
    <a class="brand" href="/">
      <img src="/logo.svg" alt="Schrottkarte" />
    </a>

    <nav class="tabs">
      {#each tabs as tab (tab.href)}
        <NavTab href={tab.href} label={tab.label} active={page.url.pathname === tab.href}>
          {#snippet icon()}<tab.icon />{/snippet}
        </NavTab>
      {/each}
    </nav>

    <UserMenu user={data.user} context="admin" />
  </header>

  <main>
    {#if fill}
      {@render children()}
    {:else}
      <div class="content">
        {@render children()}
      </div>
    {/if}
  </main>
</div>

<style>
  .shell {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    background-color: var(--c-base-300);
  }

  .shell.fill {
    height: 100svh;
    overflow: hidden;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.4rem 0.75rem;
    background-color: var(--c-base-100);
    border-bottom: 1px solid var(--c-border);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brand {
    display: flex;
  }

  .brand img {
    height: 1.9rem;
  }

  .tabs {
    display: flex;
    gap: 0.2rem;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
  }

  main {
    flex: 1;
    min-height: 0;
  }

  /* lets the editor stretch over the remaining height */
  .fill main {
    display: grid;
  }

  .content {
    width: min(60rem, calc(100% - 2rem));
    margin: 1.25rem auto 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* mobile: one compact row with icon-only tabs */
  @media (max-width: 720px) {
    .topbar {
      gap: 0.25rem;
      padding: 0.3rem 0.5rem;
    }

    .brand img {
      height: 1.6rem;
    }

    .content {
      width: calc(100% - 1.5rem);
      margin-top: 0.75rem;
    }
  }
</style>
