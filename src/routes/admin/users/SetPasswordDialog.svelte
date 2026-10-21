<script lang="ts">
  import { setUserPassword } from '#lib/remote/users.remote.js';
  import { errorMessage } from '#lib/utils.js';
  import Modal from '#lib/components/ui/Modal.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import Callout from '#lib/components/ui/Callout.svelte';
  import LucideSave from '~icons/lucide/save';

  interface Props {
    user: { id: string; email: string };
    onclose: () => void;
  }

  let { user, onclose }: Props = $props();

  let password = $state('');
  let confirmation = $state('');
  let saving = $state(false);
  let error = $state<string>();

  async function save() {
    if (password !== confirmation) {
      error = 'The passwords do not match';
      return;
    }
    saving = true;
    error = undefined;
    try {
      await setUserPassword({ id: user.id, password });
      onclose();
    } catch (e) {
      error = errorMessage(e);
    } finally {
      saving = false;
    }
  }
</script>

<Modal
  title="Set password"
  description="New password for {user.email}. The user is signed out on all devices."
  {onclose}
>
  <form
    id="password-form"
    onsubmit={(e) => {
      e.preventDefault();
      void save();
    }}
  >
    <Field label="New password" hint="(at least 8 characters)">
      <Input
        type="password"
        bind:value={password}
        autocomplete="new-password"
        required
        minlength={8}
      />
    </Field>
    <Field label="Repeat password">
      <Input
        type="password"
        bind:value={confirmation}
        autocomplete="new-password"
        required
        minlength={8}
      />
    </Field>
    {#if error}
      <Callout tone="error">{error}</Callout>
    {/if}
  </form>

  {#snippet footer()}
    <Button variant="ghost" onclick={onclose}>Cancel</Button>
    <Button type="submit" form="password-form" variant="primary" disabled={saving}>
      <LucideSave />
      {saving ? 'Saving…' : 'Save'}
    </Button>
  {/snippet}
</Modal>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
</style>
