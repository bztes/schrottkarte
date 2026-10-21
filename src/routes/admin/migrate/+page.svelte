<script lang="ts">
  import { importSupabase } from '#lib/remote/supabase.remote.js';
  import Card from '#lib/components/ui/Card.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Checkbox from '#lib/components/ui/Checkbox.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import Callout from '#lib/components/ui/Callout.svelte';
  import StatTile from '#lib/components/ui/StatTile.svelte';
  import Steps from '#lib/components/ui/Steps.svelte';
  import Code from '#lib/components/ui/Code.svelte';
  import LucideCloudUpload from '~icons/lucide/cloud-upload';

  const result = $derived(importSupabase.result);
</script>

<Card
  title="Import a Supabase project"
  description="Copies users (including passwords and roles), markers, drawings and tags. Editors become admins. The import can safely run multiple times: existing users are skipped, markers and drawings with the same id are overwritten."
>
  <Steps>
    <li>In the Supabase dashboard, click <strong>Connect</strong> at the top.</li>
    <li>
      Copy the connection string of the <strong>Session pooler</strong> (the direct connection only works
      over IPv6).
    </li>
    <li>Replace <Code>[YOUR-PASSWORD]</Code> with the database password.</li>
  </Steps>

  <form {...importSupabase}>
    <Field label="Connection string">
      <Input
        {...importSupabase.fields._connectionString.as('password')}
        placeholder="postgresql://postgres.abcdefgh:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
        autocomplete="off"
        required
      />
    </Field>
    <Checkbox {...importSupabase.fields.replace.as('checkbox')}>
      Delete existing markers, drawings and tags first
    </Checkbox>
    {#each importSupabase.fields.allIssues() ?? [] as issue (issue.message)}
      <Callout tone="error">{issue.message}</Callout>
    {/each}
    <div>
      <Button type="submit" variant="primary" disabled={importSupabase.pending > 0}>
        <LucideCloudUpload />
        {importSupabase.pending > 0 ? 'Importing…' : 'Import'}
      </Button>
    </div>
  </form>
</Card>

{#if result}
  <Card title="Import complete">
    <div class="stats">
      <StatTile label="Users"><span class="number">{result.users}</span></StatTile>
      <StatTile label="Markers"><span class="number">{result.markers}</span></StatTile>
      <StatTile label="Drawings"><span class="number">{result.drawings}</span></StatTile>
      <StatTile label="New tags"><span class="number">{result.tags}</span></StatTile>
    </div>
    {#if result.skippedUsers.length > 0}
      <p class="muted">Skipped, already present: {result.skippedUsers.join(', ')}</p>
    {/if}
  </Card>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    gap: 0.6rem;
  }

  .number {
    font-size: var(--fs-xl);
    font-weight: 600;
  }

  .muted {
    margin: 0;
    color: var(--c-muted);
  }
</style>
