<script lang="ts">
  import type { Snippet } from 'svelte';

  let { class: klass = '', children }: { class?: string; children: Snippet } = $props();
</script>

<section class="panel {klass}">{@render children()}</section>