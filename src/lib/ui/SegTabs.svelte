<script lang="ts">
  let {
    items,
    value,
    onchange,
    label,
    controls,
  }: {
    items: { id: string; label: string }[];
    value: string;
    onchange: (id: string) => void;
    label?: string;
    controls?: string;
  } = $props();

  function onKeydown(e: KeyboardEvent) {
    const idx = items.findIndex(i => i.id === value);
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % items.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    const target = items[next]?.id;
    if (!target) return;
    onchange(target);
  }
</script>

<div class="seg" role="tablist" aria-label={label} tabindex="-1" onkeydown={onKeydown}>
  {#each items as item (item.id)}
    <button
      type="button"
      role="tab"
      id="{item.id}-tab"
      class:on={item.id === value}
      aria-selected={item.id === value}
      aria-controls={controls}
      tabindex={item.id === value ? 0 : -1}
      onclick={() => onchange(item.id)}
    >{item.label}</button>
  {/each}
</div>