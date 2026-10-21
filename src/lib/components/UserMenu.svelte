<script lang="ts">
  import { hasRole, type AppUser } from '#lib/types.js';
  import { roles } from '#lib/user-roles.js';
  import { signout } from '#lib/remote/auth.remote.js';
  import Identicon from './Identicon.svelte';
  import Legend from './Legend.svelte';
  import Badge from './ui/Badge.svelte';
  import IconButton from './ui/IconButton.svelte';
  import MenuItem from './ui/MenuItem.svelte';
  import Modal from './ui/Modal.svelte';
  import LucideX from '~icons/lucide/x';
  import LucideInfo from '~icons/lucide/info';
  import LucideLayoutDashboard from '~icons/lucide/layout-dashboard';
  import LucideLogOut from '~icons/lucide/log-out';
  import LucideMap from '~icons/lucide/map';

  interface Props {
    user: AppUser | null;
    /** `map` floats over the map and links the legend, `admin` sits in the admin header */
    context?: 'map' | 'admin';
  }

  let { user, context = 'map' }: Props = $props();
  let open = $state(false);
  let legendOpen = $state(false);
  let root = $state<HTMLElement>();

  function handleWindowClick(e: MouseEvent) {
    if (open && root && !root.contains(e.target as Node)) {
      open = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeyDown} />

{#if user}
  <div class={['user-menu', context]} bind:this={root}>
    <button
      class="trigger"
      aria-label="Open user menu"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <Identicon seed={user.email} />
    </button>

    {#if open}
      <!-- mobile only: dims the map behind the sheet -->
      <div class="backdrop" aria-hidden="true"></div>

      <div class="menu" role="dialog" aria-label="User menu">
        <header>
          <span class="avatar"><Identicon seed={user.email} /></span>
          <div class="identity">
            <span class="email">{user.email}</span>
            <Badge tone="primary">{roles[user.role].label}</Badge>
          </div>
          <IconButton label="Close" onclick={() => (open = false)}><LucideX /></IconButton>
        </header>

        <nav>
          {#if context === 'map'}
            <MenuItem
              label="Legend"
              onclick={() => {
                open = false;
                legendOpen = true;
              }}
            >
              {#snippet icon()}<LucideInfo />{/snippet}
            </MenuItem>
          {/if}
          {#if context === 'admin'}
            <MenuItem href="/" label="Back to map" onclick={() => (open = false)}>
              {#snippet icon()}<LucideMap />{/snippet}
            </MenuItem>
          {:else if hasRole(user, 'editor')}
            <MenuItem href="/admin" label="Admin" onclick={() => (open = false)}>
              {#snippet icon()}<LucideLayoutDashboard />{/snippet}
            </MenuItem>
          {/if}
          <form {...signout}>
            <MenuItem type="submit" label="Sign out" tone="danger">
              {#snippet icon()}<LucideLogOut />{/snippet}
            </MenuItem>
          </form>
        </nav>
      </div>
    {/if}
  </div>

  {#if legendOpen}
    <Modal title="Legend" onclose={() => (legendOpen = false)}>
      <Legend />
    </Modal>
  {/if}
{/if}

<style>
  .user-menu {
    z-index: 100;
  }

  .user-menu.map {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
  }

  .user-menu.admin {
    position: relative;
  }

  .admin .trigger {
    padding: 0.2rem;
    font-size: 1.5rem;
    box-shadow: none;
  }

  .trigger {
    display: grid;
    place-items: center;
    padding: 0.35rem;
    border: 1px solid var(--c-border);
    border-radius: 999px;
    background-color: var(--c-base-100);
    box-shadow: var(--shadow-md);
    font-size: 2.3rem;
    cursor: pointer;
  }

  .trigger:hover,
  .trigger:active {
    background-color: var(--c-base-200);
  }

  .trigger[aria-expanded='true'] {
    box-shadow:
      var(--shadow-md),
      0 0 0 3px var(--c-primary-soft);
  }

  .backdrop {
    display: none;
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 19rem;
    max-height: calc(100svh - 5rem);
    overflow: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: var(--c-base-100);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem;
    border-bottom: 1px solid var(--c-border);
  }

  .avatar {
    display: flex;
    font-size: 2.2rem;
  }

  .identity {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .email {
    max-width: 100%;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  nav {
    padding: 0.4rem;
  }

  nav form {
    display: contents;
  }

  /* mobile: bottom sheet over a dimmed map */
  @media (max-width: 720px) {
    .backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background-color: rgb(16 24 40 / 0.35);
    }

    .menu {
      position: fixed;
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      max-height: 85svh;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
</style>
