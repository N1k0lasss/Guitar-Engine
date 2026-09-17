<script lang="ts">
  let { label = '', options, value, onchange, wide = false }: {
    label?: string;
    options: { value: string; label: string }[];
    value: string;
    onchange?: (value: string) => void;
    wide?: boolean;
  } = $props();
</script>

<label class="field {wide ? 'field-wide' : ''}">
  {#if label}<span class="field-label">{label}</span>{/if}
  <select class="sel" {value} onchange={(e) => onchange?.((e.currentTarget as HTMLSelectElement).value)}>
    {#each options as opt (opt.value)}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</label>

<style>
  .field { display: inline-flex; flex-direction: column; gap: 0.35rem; }
  .field-wide { width: 100%; }
  .field-label { font: 10px var(--font-mono); letter-spacing: 1.4px; text-transform: uppercase; color: var(--color-muted); }
  .sel { appearance: none; font: inherit; font-size: 0.78rem; color: var(--color-ink); background:
    linear-gradient(45deg, transparent 50%, var(--color-muted) 50%) calc(100% - 14px) 50% / 6px 6px no-repeat,
    linear-gradient(135deg, var(--color-muted) 50%, transparent 50%) calc(100% - 8px) 50% / 6px 6px no-repeat,
    var(--color-el2);
    border: 1px solid var(--color-line); border-radius: 2px; padding: 0.5rem 2rem 0.5rem 0.7rem; cursor: pointer; }
  .sel:focus { outline: none; border-color: var(--color-accent); }
  .sel:hover { border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-line)); }
</style>