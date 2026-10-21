<script lang="ts">
  import { exportMarkersCsv } from '#lib/remote/markers.remote.js';
  import { downloadFile, errorMessage } from '#lib/utils.js';
  import Card from '#lib/components/ui/Card.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import LucideDownload from '~icons/lucide/download';

  let loading = $state(false);

  async function downloadMarkersCsv() {
    loading = true;
    try {
      downloadFile(await exportMarkersCsv(), 'markers.csv', 'text/csv');
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      loading = false;
    }
  }
</script>

<Card
  title="Export"
  description="All markers as a CSV file with name, description, state, position and timestamps."
>
  <div>
    <Button variant="primary" onclick={downloadMarkersCsv} disabled={loading}>
      <LucideDownload />
      {loading ? 'Exporting…' : 'Download markers as CSV'}
    </Button>
  </div>
</Card>
