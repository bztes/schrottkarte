<script lang="ts">
  import { createUser, deleteUser, getUsers, updateUserRole } from '#lib/remote/admin.remote.js';
  import { userRoles, type UserRole } from '#lib/types.js';
  import { roles } from '#lib/user-roles.js';
  import { errorMessage } from '#lib/utils.js';
  import Identicon from '#lib/components/Identicon.svelte';
  import Card from '#lib/components/ui/Card.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Select from '#lib/components/ui/Select.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import IconButton from '#lib/components/ui/IconButton.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import Callout from '#lib/components/ui/Callout.svelte';
  import SetPasswordDialog from './SetPasswordDialog.svelte';
  import LucideKeyRound from '~icons/lucide/key-round';
  import LucideTrash2 from '~icons/lucide/trash-2';
  import LucideUserPlus from '~icons/lucide/user-plus';

  let { data } = $props();

  const users = getUsers();
  let passwordUser = $state<{ id: string; email: string }>();

  async function handleRoleChange(id: string, role: UserRole) {
    try {
      await updateUserRole({ id, role });
    } catch (e) {
      alert(errorMessage(e));
      await users.refresh();
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Really delete user ${email}?`)) {
      return;
    }
    try {
      await deleteUser(id);
    } catch (e) {
      alert(errorMessage(e));
    }
  }
</script>

{#if !data.setupMode}
  <Card
    title="Users"
    description={users.current ? `${users.current.length} users` : 'Who has access to the map'}
    flush
  >
    {#if users.error}
      <div class="padded"><Callout tone="error">{errorMessage(users.error)}</Callout></div>
    {:else if users.current}
      <ul class="users">
        {#each users.current as user (user.id)}
          {@const isMe = user.id === data.user?.id}
          <li>
            <span class="avatar"><Identicon seed={user.email} /></span>
            <div class="identity">
              <span class="email">
                {user.email}
                {#if isMe}<Badge tone="primary">You</Badge>{/if}
              </span>
              <span class="name">{user.name}</span>
            </div>
            <div class="role">
              <Select
                value={user.role}
                disabled={isMe}
                aria-label="Role of {user.email}"
                onchange={(e) => handleRoleChange(user.id, e.currentTarget.value as UserRole)}
              >
                {#each userRoles as role (role)}
                  <option value={role}>{roles[role].label}</option>
                {/each}
              </Select>
            </div>
            <div class="actions">
              <IconButton label="Set password" onclick={() => (passwordUser = user)}>
                <LucideKeyRound />
              </IconButton>
              <IconButton
                label="Delete"
                variant="danger"
                disabled={isMe}
                onclick={() => handleDelete(user.id, user.email)}
              >
                <LucideTrash2 />
              </IconButton>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="padded muted">Loading…</p>
    {/if}
  </Card>
{/if}

{#if passwordUser}
  <SetPasswordDialog user={passwordUser} onclose={() => (passwordUser = undefined)} />
{/if}

<div class="columns">
  <Card
    title={data.setupMode ? 'Create the first user' : 'Create user'}
    description={data.setupMode
      ? 'The first user becomes an admin. Sign in with it afterwards.'
      : 'New users sign in with their email address and password.'}
  >
    <form {...createUser}>
      <Field label="Email">
        <Input {...createUser.fields.email.as('email')} required trim />
      </Field>
      <Field label="Name" hint="(optional)">
        <Input {...createUser.fields.name.as('text')} trim />
      </Field>
      <Field label="Password">
        <Input {...createUser.fields._password.as('password')} required minlength={8} />
      </Field>
      {#if data.setupMode}
        <input {...createUser.fields.role.as('hidden', 'admin')} />
      {:else}
        <Field label="Role">
          <Select {...createUser.fields.role.as('select')}>
            {#each userRoles as role (role)}
              <option value={role} selected={role === 'street'}>{roles[role].label}</option>
            {/each}
          </Select>
        </Field>
      {/if}
      {#each createUser.fields.allIssues() ?? [] as issue (issue.message)}
        <Callout tone="error">{issue.message}</Callout>
      {/each}
      <div>
        <Button type="submit" variant="primary" disabled={createUser.pending > 0}>
          <LucideUserPlus /> Create
        </Button>
      </div>
    </form>
  </Card>

  <Card title="Roles" description="What each role is allowed to do">
    <dl>
      {#each userRoles as role (role)}
        <div>
          <dt><Badge tone={roles[role].tone}>{roles[role].label}</Badge></dt>
          <dd>{roles[role].description}</dd>
        </div>
      {/each}
    </dl>
  </Card>
</div>

<style>
  .padded {
    margin: 0;
    padding: 0 1.5rem 1.5rem;
  }

  .muted {
    color: var(--c-muted);
  }

  .users {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--c-border);
  }

  .users li {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 0.9rem;
    padding: 0.6rem 1.5rem;
    border-bottom: 1px solid var(--c-border);
  }

  .users li:last-child {
    border-bottom: none;
  }

  .users li:hover {
    background-color: var(--c-base-200);
  }

  .avatar {
    display: flex;
    font-size: 2rem;
  }

  .identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .email {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name {
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  .actions {
    display: flex;
    gap: 0.15rem;
  }

  .columns {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 1.25rem;
    align-items: start;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  dl {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  dl div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  dd {
    margin: 0;
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  @media (max-width: 720px) {
    .columns {
      grid-template-columns: 1fr;
    }

    .users li {
      grid-template-columns: auto 1fr auto;
      row-gap: 0.4rem;
      padding: 0.6rem 1rem;
    }

    .identity {
      grid-column: 2 / 4;
    }

    .role {
      grid-column: 2;
      justify-self: start;
    }

    .actions {
      grid-column: 3;
    }
  }
</style>
