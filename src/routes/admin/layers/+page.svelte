<script lang="ts">
  import {
    deleteMapLayer,
    getAllMapLayers,
    importMapLayers,
    moveMapLayer,
    saveMapLayer,
    setMapLayerEnabled,
  } from '#lib/remote/layers.remote.js';
  import { firstIssue, mapLayerInput, mapLayersFile, type MapLayersFile } from '#lib/map-layers.js';
  import type { MapLayer } from '#lib/types.js';
  import { downloadFile, errorMessage } from '#lib/utils.js';
  import Card from '#lib/components/ui/Card.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Select from '#lib/components/ui/Select.svelte';
  import Textarea from '#lib/components/ui/Textarea.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import IconButton from '#lib/components/ui/IconButton.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import Callout from '#lib/components/ui/Callout.svelte';
  import Modal from '#lib/components/ui/Modal.svelte';
  import LucideEye from '~icons/lucide/eye';
  import LucideEyeOff from '~icons/lucide/eye-off';
  import LucideArrowUp from '~icons/lucide/arrow-up';
  import LucideArrowDown from '~icons/lucide/arrow-down';
  import LucidePencil from '~icons/lucide/pencil';
  import LucideTrash2 from '~icons/lucide/trash-2';
  import LucidePlus from '~icons/lucide/plus';
  import LucideSave from '~icons/lucide/save';
  import LucideDownload from '~icons/lucide/download';
  import LucideUpload from '~icons/lucide/upload';

  interface Draft {
    id?: string;
    name: string;
    enabled: boolean;
    source: string;
    layers: string;
  }

  const templates = {
    raster: {
      label: 'Raster tiles',
      source: {
        type: 'raster',
        tiles: ['https://tile.example.com/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; Example',
      },
      layers: [{ id: 'tiles', type: 'raster' }],
    },
    vector: {
      label: 'Vector tiles',
      source: {
        type: 'vector',
        url: 'https://tiles.example.com/data/example.json',
        attribution: '&copy; Example',
      },
      layers: [
        {
          id: 'points',
          type: 'circle',
          'source-layer': 'example',
          paint: { 'circle-color': 'red', 'circle-radius': 3 },
        },
      ],
    },
    geojson: {
      label: 'GeoJSON',
      source: { type: 'geojson', data: 'https://example.com/data.geojson' },
      layers: [{ id: 'lines', type: 'line', paint: { 'line-color': 'blue', 'line-width': 2 } }],
    },
  } as const;

  const layers = getAllMapLayers();
  // the list shows the topmost layer first
  const sorted = $derived(layers.current?.toReversed());

  let draft = $state<Draft>();
  let draftError = $state<string>();
  let saving = $state(false);
  let importing = $state(false);
  let fileInput = $state<HTMLInputElement>();

  function json(value: unknown) {
    return JSON.stringify(value, null, 2);
  }

  function startNew(template: keyof typeof templates = 'raster') {
    draftError = undefined;
    draft = {
      name: draft?.id === undefined ? (draft?.name ?? '') : '',
      enabled: true,
      source: json(templates[template].source),
      layers: json(templates[template].layers),
    };
  }

  function startEdit(layer: MapLayer) {
    draftError = undefined;
    draft = {
      id: layer.id,
      name: layer.name,
      enabled: layer.enabled,
      source: json(layer.source),
      layers: json(layer.layers),
    };
  }

  function parseJson(label: string, text: string) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`${label}: ${errorMessage(e)}`, { cause: e });
    }
  }

  async function save() {
    if (!draft) {
      return;
    }
    draftError = undefined;
    saving = true;
    try {
      // check here, the server only answers "Bad Request" on invalid input
      const result = mapLayerInput.safeParse({
        id: draft.id,
        name: draft.name,
        enabled: draft.enabled,
        source: parseJson('Source', draft.source),
        layers: parseJson('Style layers', draft.layers),
      });
      if (!result.success) {
        throw new Error(firstIssue(result.error));
      }
      await saveMapLayer(result.data);
      draft = undefined;
    } catch (e) {
      draftError = errorMessage(e);
    } finally {
      saving = false;
    }
  }

  function exportLayers() {
    if (!layers.current) {
      return;
    }
    const file: MapLayersFile = {
      version: 1,
      layers: layers.current.map((l) => ({
        id: l.id,
        name: l.name,
        enabled: l.enabled,
        source: l.source,
        layers: l.layers,
      })),
    };
    downloadFile(json(file), 'map-layers.json', 'application/json');
  }

  async function importLayers(file: File) {
    importing = true;
    try {
      const result = mapLayersFile.safeParse(parseJson(file.name, await file.text()));
      if (!result.success) {
        throw new Error(firstIssue(result.error));
      }
      const imported = result.data.layers;
      const existing = new Set(layers.current?.map((l) => l.id));
      const overwritten = imported.filter((l) => l.id !== undefined && existing.has(l.id));
      const question =
        overwritten.length > 0
          ? `Import ${imported.length} layers? These existing layers are overwritten: ${overwritten.map((l) => l.name).join(', ')}`
          : `Import ${imported.length} layers? They are added on top.`;
      if (!confirm(question)) {
        return;
      }
      const { added, updated } = await importMapLayers(imported);
      alert(`${added} layers added, ${updated} updated.`);
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      importing = false;
      // allows importing the same file again
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch (e) {
      alert(errorMessage(e));
      await layers.refresh();
    }
  }

  function handleDelete(layer: MapLayer) {
    if (confirm(`Really delete the layer "${layer.name}"?`)) {
      void run(() => deleteMapLayer(layer.id));
    }
  }
</script>

<Card
  title="Map layers"
  description="Base maps and overlays below the drawings and markers. Layers further up are drawn on top."
  flush
>
  {#snippet actions()}
    <div class="header-actions">
      <input
        bind:this={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onchange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) {
            void importLayers(file);
          }
        }}
      />
      <Button size="sm" disabled={importing} onclick={() => fileInput?.click()}>
        <LucideUpload />
        {importing ? 'Importing…' : 'Import'}
      </Button>
      <Button size="sm" disabled={!layers.current?.length} onclick={exportLayers}>
        <LucideDownload /> Export
      </Button>
      <Button variant="primary" size="sm" onclick={() => startNew()}>
        <LucidePlus /> Add layer
      </Button>
    </div>
  {/snippet}

  {#if layers.error}
    <div class="padded"><Callout tone="error">{errorMessage(layers.error)}</Callout></div>
  {:else if sorted?.length === 0}
    <p class="padded muted">No layers yet, the map is empty apart from drawings and markers.</p>
  {:else if sorted}
    <ul class="layers">
      {#each sorted as layer, i (layer.id)}
        <li class:disabled={!layer.enabled}>
          <div class="identity">
            <span class="name">
              {layer.name}
              <Badge>{layer.source.type}</Badge>
            </span>
            <span class="meta">
              {layer.layers.length === 1 ? '1 style layer' : `${layer.layers.length} style layers`}
            </span>
          </div>
          <div class="actions">
            <IconButton
              label={layer.enabled ? 'Hide on the map' : 'Show on the map'}
              aria-pressed={layer.enabled}
              onclick={() =>
                run(() => setMapLayerEnabled({ id: layer.id, enabled: !layer.enabled }))}
            >
              {#if layer.enabled}<LucideEye />{:else}<LucideEyeOff />{/if}
            </IconButton>
            <IconButton
              label="Move up"
              disabled={i === 0}
              onclick={() => run(() => moveMapLayer({ id: layer.id, direction: 'up' }))}
            >
              <LucideArrowUp />
            </IconButton>
            <IconButton
              label="Move down"
              disabled={i === sorted.length - 1}
              onclick={() => run(() => moveMapLayer({ id: layer.id, direction: 'down' }))}
            >
              <LucideArrowDown />
            </IconButton>
            <IconButton label="Edit" onclick={() => startEdit(layer)}>
              <LucidePencil />
            </IconButton>
            <IconButton label="Delete" variant="danger" onclick={() => handleDelete(layer)}>
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

{#if draft}
  <Modal
    title={draft.id ? 'Edit layer' : 'New layer'}
    description="Source and style layers use the MapLibre style specification. The source of each style layer is set automatically."
    size="lg"
    onclose={() => (draft = undefined)}
  >
    <form
      id="layer-form"
      onsubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div class="name-row">
        <div class="name-field">
          <Field label="Name">
            <Input bind:value={draft.name} required trim />
          </Field>
        </div>
        <IconButton
          label={draft.enabled ? 'Hide on the map' : 'Show on the map'}
          aria-pressed={draft.enabled}
          onclick={() => draft && (draft.enabled = !draft.enabled)}
        >
          {#if draft.enabled}<LucideEye />{:else}<LucideEyeOff />{/if}
        </IconButton>
      </div>
      {#if !draft.id}
        <Field label="Template" hint="(replaces source and style layers)">
          <Select onchange={(e) => startNew(e.currentTarget.value as keyof typeof templates)}>
            {#each Object.entries(templates) as [key, template] (key)}
              <option value={key}>{template.label}</option>
            {/each}
          </Select>
        </Field>
      {/if}
      <Field label="Source" hint="(JSON object)">
        <Textarea mono bind:value={draft.source} rows={8} spellcheck="false" />
      </Field>
      <Field label="Style layers" hint="(JSON array)">
        <Textarea mono bind:value={draft.layers} rows={14} spellcheck="false" />
      </Field>
      <p class="muted links">
        Reference:
        <a
          href="https://maplibre.org/maplibre-style-spec/sources/"
          target="_blank"
          rel="noreferrer"
        >
          sources
        </a>,
        <a href="https://maplibre.org/maplibre-style-spec/layers/" target="_blank" rel="noreferrer">
          layers
        </a>
      </p>
      {#if draftError}
        <Callout tone="error">{draftError}</Callout>
      {/if}
    </form>

    {#snippet footer()}
      <Button variant="ghost" onclick={() => (draft = undefined)}>Cancel</Button>
      <Button type="submit" form="layer-form" variant="primary" disabled={saving}>
        <LucideSave />
        {saving ? 'Saving…' : 'Save'}
      </Button>
    {/snippet}
  </Modal>
{/if}

<style>
  .padded {
    margin: 0;
    padding: 0 1.5rem 1.5rem;
  }

  .muted {
    color: var(--c-muted);
  }

  .layers {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--c-border);
  }

  .layers li {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.9rem;
    padding: 0.6rem 1.5rem;
    border-bottom: 1px solid var(--c-border);
  }

  .layers li:last-child {
    border-bottom: none;
  }

  .layers li:hover {
    background-color: var(--c-base-200);
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  .identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .disabled .identity {
    opacity: 0.55;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
  }

  .meta {
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  .actions {
    display: flex;
    gap: 0.15rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .name-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .name-field {
    flex: 1;
  }

  .links {
    margin: -0.4rem 0 0;
    font-size: var(--fs-sm);
  }

  @media (max-width: 720px) {
    .layers li {
      grid-template-columns: 1fr auto;
      row-gap: 0.4rem;
      padding: 0.6rem 1rem;
    }

    .actions {
      grid-column: 1 / -1;
      justify-self: end;
    }
  }
</style>
