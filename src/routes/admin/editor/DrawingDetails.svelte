<script lang="ts">
  import type { Drawing, DrawingsService } from '#lib/drawings.svelte.js';
  import type { TagsService } from '#lib/tags.svelte.js';
  import type { DialogsService } from '#lib/dialogs.svelte.js';
  import TagInput from '#lib/components/ui/TagInput.svelte';
  import ColorSwatches from '#lib/components/ui/ColorSwatches.svelte';
  import DrawingIcon from '#lib/components/DrawingIcon.svelte';
  import DrawingSize from '#lib/components/DrawingSize.svelte';
  import deepEqual from 'fast-deep-equal';
  import { getFriendlyTime } from '#lib/utils.js';
  import DetailsPanel from './DetailsPanel.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Textarea from '#lib/components/ui/Textarea.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import StatTile from '#lib/components/ui/StatTile.svelte';
  import LucideArrowLeftRight from '~icons/lucide/arrow-left-right';

  interface Props {
    id: string;
    drawingsService: DrawingsService;
    tagsService: TagsService;
    dialogsService: DialogsService;
    onclose: () => void;
    /** the drawing was deleted, closes without asking about unsaved changes */
    ondelete: () => void;
    onzoom: (drawing: Drawing) => void;
  }

  let { id, drawingsService, tagsService, dialogsService, onclose, ondelete, onzoom }: Props =
    $props();

  // svelte-ignore state_referenced_locally
  let form = $state(editableFields(drawingsService.draft(id)));
  // svelte-ignore state_referenced_locally
  let saved = $state(editableFields(drawingsService.draft(id)));
  let saving = $state(false);

  // the geometry may change on the map at any time, always show the latest one
  const drawing = $derived(drawingsService.all.find((d) => d.id === id));

  const dirty = $derived(!deepEqual($state.snapshot(form), saved));

  /** whether the form has unsaved changes */
  export function isDirty() {
    return dirty;
  }

  function editableFields(d: Drawing) {
    return {
      name: d.name,
      description: d.description,
      tags: [...d.tags],
      color: d.properties.color,
    };
  }

  const typeName = $derived.by(() => {
    switch (drawing?.geom.type) {
      case 'LineString':
        return 'Route';
      case 'Polygon':
        return 'Area';
      case 'Point':
        return 'Point of interest';
      default:
        return 'Shape';
    }
  });

  async function save(geom = drawing?.geom) {
    if (!drawing || !geom) {
      return;
    }
    saving = true;
    const snapshot = $state.snapshot(form);
    const ok = await drawingsService.updateOrCreate([
      {
        ...drawingsService.draft(id),
        name: snapshot.name,
        description: snapshot.description,
        tags: snapshot.tags,
        properties: { ...drawing.properties, color: snapshot.color },
        geom,
      },
    ]);
    saving = false;
    if (ok) {
      saved = snapshot;
    }
  }

  function handleReverse() {
    if (drawing?.geom.type === 'LineString') {
      save({ ...drawing.geom, coordinates: [...drawing.geom.coordinates].reverse() });
    }
  }

  async function handleDelete() {
    const action = await dialogsService.modal({
      title: 'Delete shape',
      msg: `Do you really want to delete “${form.name || 'Untitled'}”?`,
      buttons: {
        cancel: { type: 'none', label: 'Cancel' },
        delete: { type: 'accent', label: 'Delete' },
      },
    });
    if (action === 'delete' && (await drawingsService.remove([id]))) {
      ondelete();
    }
  }

  function tagsProvider(value: string) {
    return tagsService.values.filter((t) => t.includes(value) && !form.tags.includes(t));
  }
</script>

{#if drawing}
  <DetailsPanel
    title={form.name || 'Untitled'}
    subtitle={typeName}
    {dirty}
    {saving}
    {onclose}
    onzoom={() => onzoom(drawing)}
    onsave={() => save()}
    ondelete={handleDelete}
  >
    {#snippet icon()}
      <span style:color={form.color ?? 'var(--c-primary)'}><DrawingIcon {drawing} /></span>
    {/snippet}

    <div class="facts">
      <StatTile label="Size"><DrawingSize {drawing} /></StatTile>
      <StatTile label="Updated">{getFriendlyTime(drawing.updatedAt)}</StatTile>
      <StatTile label="Created">{drawing.createdAt.toLocaleDateString()}</StatTile>
    </div>

    <Field label="Name">
      <Input bind:value={form.name} placeholder="Untitled" />
    </Field>
    <Field label="Note">
      <Textarea bind:value={form.description} />
    </Field>
    <Field label="Tags">
      <TagInput bind:tags={form.tags} options={tagsProvider} />
    </Field>
    <Field label="Color" group>
      <ColorSwatches bind:color={form.color} />
    </Field>
    {#if drawing.geom.type === 'LineString'}
      <div>
        <Button size="sm" onclick={handleReverse} disabled={saving}>
          <LucideArrowLeftRight /> Reverse direction
        </Button>
      </div>
    {/if}
  </DetailsPanel>
{/if}

<style>
  .facts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    font-size: var(--fs-sm);
  }
</style>
