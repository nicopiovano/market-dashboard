<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: Function, required: true },
})

function alignClass(align) {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th
            v-for="col in props.columns"
            :key="col.key"
            class="sticky top-0 bg-panel2/90 backdrop-blur border-b border-border px-3 py-2 text-xs font-semibold text-muted"
            :class="alignClass(col.align)"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in props.rows" :key="props.rowKey(row)" class="hover:bg-white/5">
          <td
            v-for="col in props.columns"
            :key="col.key"
            class="border-b border-border px-3 py-2 text-sm"
            :class="alignClass(col.align)"
          >
            <slot :name="`cell-${col.key}`" :row="row">
              <span class="text-text">{{ String(row[col.key] ?? '—') }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

