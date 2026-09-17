<script lang="ts">
  import { NOTES } from '../theory/notes';
  import { qualityFamilyOf, qualityColor } from '../theory/chords';

  let { frets, strings = ['E', 'A', 'D', 'G', 'B', 'e'], tones = [], quality = '' }: {
    frets: (number | null)[];
    strings?: string[];
    tones?: string[];
    quality?: string;
  } = $props();

  const toneSet = $derived(new Set(tones.map(t => NOTES[NOTES.indexOf(t as never)] ?? t)));
  const family = $derived(qualityFamilyOf({ quality } as never));
  const dotColor = $derived(qualityColor(family));
</script>

{#if frets.length}
  <div class="diagram">
    {#each strings as str, i (i)}
      <div class="col" class:q-faded={tones[i] ? true : false}>
        <span class="label">{str}</span>
        {#if tones[i] && toneSet.has(tones[i])}
          <b class="tone-name" style="color: {dotColor}">{tones[i]}</b>
        {/if}
        <span class="cell">
          {#if frets[i] === null}
            <span class="ind mute">✕</span>
          {:else if frets[i] === 0}
            <span class="ind open">○</span>
          {:else}
            <span class="dot" style="background: {dotColor}">{frets[i]}</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .diagram { display: inline-flex; gap: 9px; align-items: flex-start; padding: 14px;
    border: 1px solid var(--color-line); border-radius: 2px;
    background: #080909; }
  .col { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 28px; }
  .label { font-family: var(--font-mono); font-size: 11px; color: var(--color-muted); }
  .tone-name { font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
  .cell { width: 28px; height: 28px; border-radius: 2px; border: 1px solid var(--color-line);
    display: grid; place-items: center; background: var(--color-el2); }
  .ind { font-size: 0.78rem; }
  .mute { color: var(--color-muted); }
  .open { color: var(--color-accent); }
  .dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
    font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: #050606; }
</style>