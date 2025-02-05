<script lang="ts">
  import '../../global.css';
  import { enhance } from '$app/forms';
  import { trim } from '$lib/actions/trim';

  const { form, data: pageData } = $props();
</script>

<div class="center">
  <form method="POST" action="?/signin" use:enhance>
    <img src={'/logo.svg'} alt="Schrottkarte Logo" />
    <label>
      E-Mail
      <input type="email" name="email" placeholder="user@something.de" required use:trim />
    </label>
    <label>
      Password
      <input type="password" name="password" placeholder="mysecretpassword!" required />
    </label>
    {#if form && !form.success}
      <span class="errorMessage">Invalid username or password</span>
    {/if}
    <input type="hidden" name="redirect" value={pageData.redirect} />
    <button class="button-primary">Anmelden</button>
  </form>
</div>

<style>
  .center {
    height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 200px;
  }

  img {
    width: 80%;
    align-self: center;
  }

  .errorMessage {
    color: red;
  }
</style>
