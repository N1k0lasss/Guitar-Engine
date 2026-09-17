<script lang="ts">
  let { checked, label, onchange }: {
    checked: boolean;
    label: string;
    onchange?: (checked: boolean) => void;
  } = $props();
</script>

<label class="check">
  <input
    type="checkbox"
    {checked}
    onchange={(e) => onchange?.((e.currentTarget as HTMLInputElement).checked)}
  />
  <span class="track" aria-hidden="true"><span class="thumb"></span></span>
  <span class="check-label">{label}</span>
</label>

<style>
  .check { display: inline-flex; align-items: center; gap: 0.55rem; cursor: pointer; user-select: none; }
  .check input { position: absolute; opacity: 0; width: 0; height: 0; }
  .track { position: relative; display: inline-block; width: 15px; height: 15px; border-radius: 2px; background: var(--color-el2); border: 1px solid var(--color-line); transition: background 0.15s, border-color 0.15s; flex: 0 0 auto; }
  .thumb { position: absolute; inset: 3px; border-radius: 1px; background: transparent; transition: background 0.15s; }
  input:checked + .track { background: var(--color-accent); border-color: var(--color-accent); }
  input:checked + .track .thumb { background: #050606; }
  .check-label { font-size: 12px; color: var(--color-ink); }
</style>