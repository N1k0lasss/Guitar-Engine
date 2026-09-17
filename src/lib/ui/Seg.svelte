<script lang="ts">
  let { options, value, onchange, small = false }: {
    options: { value: string; label: string }[];
    value: string;
    onchange?: (value: string) => void;
    small?: boolean;
  } = $props();
</script>

<div class="seg {small ? 'seg-sm' : ''}" role="tablist" aria-label="opciones">
  {#each options as opt (opt.value)}
    <button
      type="button"
      role="tab"
      aria-selected={value === opt.value}
      class:on={value === opt.value}
      onclick={() => { onchange?.(opt.value); }}
    >{opt.label}</button>
  {/each}
</div>

<style>
  .seg { display: inline-flex; flex-wrap: wrap; border: 1px solid var(--color-line); border-radius: 2px; overflow: hidden; }
  .seg button { border: 0; background: var(--color-el2); color: var(--color-muted); font: inherit; font-size: 0.78rem; letter-spacing: 0.02em; padding: 0.42rem 0.8rem; cursor: pointer; transition: color 0.15s, background 0.15s; white-space: nowrap; }
  .seg button + button { border-left: 1px solid var(--color-line); }
  .seg button:hover { color: var(--color-ink); }
  .seg button.on { background: var(--color-accent); color: #050606; font-weight: 700; }
  .seg-sm button { font-size: 0.72rem; padding: 0.3rem 0.6rem; }
</style>