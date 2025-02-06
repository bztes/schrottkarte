<script lang="ts">
  import type { User } from '@supabase/supabase-js';
  import { enhance } from '$app/forms';
  import Identicon from './Identicon.svelte';
  import Legend from './Legend.svelte';
  import IcRoundClose from '~icons/ic/round-close';

  interface Props {
    user: User | null;
  }

  let { user }: Props = $props();
  let visible = $state(false);

  function close() {
    visible = false;
  }

  function open() {
    visible = true;
  }
</script>

{#if user}
  <button class="userButton button-overlay button-icon" onclick={open}>
    <Identicon seed={user.email ?? ''} />
  </button>

  <div class="userPopup" class:visible>
    <div class="header">
      <span class="user-avatar">
        <Identicon seed={user.email ?? ''} />
      </span>
      <h2>{user.email}</h2>
      <button class="button-round" onclick={close}>
        <IcRoundClose />
      </button>
    </div>
    <div class="main">
      <Legend></Legend>
    </div>
    <div>
      <a href="/export/markers">Export Markers to CSV</a>
    </div>
    <div class="footer">
      <form method="POST" use:enhance>
        <button class="button-secondary" formaction="/?/signout">Abmelden</button>
      </form>
    </div>
  </div>
{/if}

<style>
  .userButton {
    position: fixed;
    z-index: 100;
    right: 1rem;
    top: 1rem;
    background-color: var(--c-base-200);
    font-size: 2.5rem;
  }

  .userPopup {
    position: fixed;
    box-sizing: border-box;
    width: 100svw;
    height: 100svh;
    z-index: 200;
    background-color: var(--c-base-100);
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 1rem;
    gap: 2rem;
  }

  .userPopup:not(.visible) {
    display: none;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
  }

  .user-avatar {
    font-size: 3rem;
    display: flex;
  }

  h2 {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .main {
    overflow: auto;
  }

  .footer {
    display: flex;
    flex-direction: column;
  }

  form {
    display: contents;
  }
</style>
