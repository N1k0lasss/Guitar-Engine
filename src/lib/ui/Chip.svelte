<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    on = false,
    toggle = false,
    label,
    children,
    ...rest
  }: {
    on?: boolean;
    toggle?: boolean;
    label?: string;
    children: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button
  type="button"
  class="chip"
  class:on={on}
  aria-pressed={toggle ? on : undefined}
  aria-label={label}
  {...rest}
>{@render children()}</button>