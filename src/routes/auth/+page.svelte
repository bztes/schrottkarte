<script lang="ts">
  import '../../global.css';
  import { signin } from '#lib/remote/auth.remote.js';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import Callout from '#lib/components/ui/Callout.svelte';

  const { data: pageData } = $props();
</script>

<div class="center">
  <form {...signin} class="panel">
    <img src="/logo.svg" alt="Schrottkarte Logo" />
    <div class="intro">
      <h1>Welcome back</h1>
      <p>Sign in to open the map.</p>
    </div>
    <Field label="Email">
      <Input
        {...signin.fields.email.as('email')}
        placeholder="name@example.com"
        autocomplete="email"
        required
        trim
      />
    </Field>
    <Field label="Password">
      <Input {...signin.fields._password.as('password')} autocomplete="current-password" required />
    </Field>
    {#if signin.fields.allIssues()?.length}
      <Callout tone="error">Wrong email address or password.</Callout>
    {/if}
    <input {...signin.fields.redirect.as('hidden', pageData.redirect ?? '')} />
    <Button type="submit" variant="primary" size="lg" block disabled={signin.pending > 0}>
      {signin.pending > 0 ? 'Signing in…' : 'Sign in'}
    </Button>
  </form>
</div>

<style>
  .center {
    min-height: 100svh;
    box-sizing: border-box;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 20% 0%, var(--c-primary-soft), transparent 50%), var(--c-base-300);
  }

  .panel {
    width: min(21rem, 100%);
    box-sizing: border-box;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: var(--c-base-100);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  img {
    width: 8rem;
    align-self: center;
  }

  .intro {
    text-align: center;
  }

  h1 {
    font-size: var(--fs-lg);
    font-weight: 600;
  }

  p {
    margin: 0.25rem 0 0;
    color: var(--c-muted);
  }
</style>
