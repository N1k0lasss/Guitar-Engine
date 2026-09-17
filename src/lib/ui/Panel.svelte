<script lang="ts">
  let { title = '', eyebrow = '', class: className = '', children }: {
    title?: string; eyebrow?: string; class?: string; children?: import('svelte').Snippet;
  } = $props();
</script>

<section class="panel {className}">
  {#if eyebrow || title}
    <div class="panel-head">
      {#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
      {#if title}<h3 class="panel-title">{title}</h3>{/if}
    </div>
  {/if}
  {#if children}{@render children()}{/if}
</section>

<style>
  .panel-head { margin-bottom: var(--sp-3); }
  .panel-title { font-family: var(--font-display); font-size: 12px; font-weight: 600; letter-spacing: 0.2px; }
</style>