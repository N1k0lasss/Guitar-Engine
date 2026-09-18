<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    live = false,
    label,
    children,
  }: { live?: boolean; label: string; children?: Snippet } = $props();
</script>

<span class="signal-badge" class:live={live}>{#if children}{@render children()}{:else}{label}{/if}</span>