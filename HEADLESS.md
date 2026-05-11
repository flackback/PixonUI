# PixonUI Headless Mode (State Logic Decoupling)

PixonUI components are split into two separate layers: the **Functional State Machine** (headless custom state hook) and the **Visual Component Render Layer**. This decoupling allows developers to import only the logic hooks to power their own custom-styled HTML elements.

> [!TIP]
> Headless mode is ideal for highly constrained design environments or platforms where Tailwind CSS is not available, but full state-machine compliance is desired.

---

## 1. DataTable Headless Logic (`useDataTableState`)

The headless state hook of PixonUI's `DataTable` handles pagination index state, global sorting variables, multiselect indexes, and query filtering.

### Hook Structure
```typescript
import { useDataTableState } from '@pixonui/react';

const {
  data,            // Sorted, filtered, and page-sliced items array
  searchQuery,     // Current search term string
  setSearchQuery,  // Update search query state handler
  sortBy,          // Active sorting column key string
  sortOrder,       // Sorting order 'asc' | 'desc'
  toggleSort,      // Trigger column sorting toggle handler
  selectedIds,     // Array of active multi-selection row ids
  toggleSelectRow, // Toggle single row selection handler
  toggleSelectAll, // Toggle selecting all current rows
  currentPage,     // Number representation of active page index
  goToPage,        // Set current page handler
  totalPages       // Total count of calculated pages
} = useDataTableState({
  items: rawData,
  pageSize: 10,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc'
});
```

### Custom Rendering Example
```tsx
import React from 'react';
import { useDataTableState } from '@pixonui/react';

export function MyHeadlessTable() {
  const { data, searchQuery, setSearchQuery, toggleSort } = useDataTableState({
    items: [
      { id: '1', name: 'Anderson', role: 'Engineer' },
      { id: '2', name: 'Nerdzao', role: 'Architect' }
    ]
  });

  return (
    <div>
      <input 
        type="text" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="Filter list..."
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')}>Name</th>
            <th onClick={() => toggleSort('role')}>Role</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 2. Kanban Headless Logic (`useKanbanState`)

PixonUI's `Kanban` is backed by a state-driven reducer history hook (`useKanbanState`) managing dynamic task columns, dragging tracking, swimlane groupings, undo/redo states, and cards creation.

### Hook Structure
```typescript
import { useKanbanState } from '@pixonui/react';

const {
  columns,          // Active columns array
  tasks,            // Active task cards list
  searchQuery,      // Active filter query
  setSearchQuery,   // Update filter text handler
  moveTask,         // programmatically move task between columns
  moveColumn,       // Programmatically sort column positions
  addTask,          // Create a new task within a targeted column
  removeTask,       // Delete a card
  undo,             // Step back in history changes list
  redo,             // Step forward in history changes list
  canUndo,          // Boolean helper indicating undo status
  canRedo           // Boolean helper indicating redo status
} = useKanbanState({
  initialColumns,
  initialTasks
});
```

### Custom Rendering Example
```tsx
import React from 'react';
import { useKanbanState } from '@pixonui/react';

export function SimpleCustomKanban() {
  const { columns, tasks, moveTask, undo, canUndo } = useKanbanState({
    initialColumns: [{ id: 'todo', title: 'To Do' }, { id: 'done', title: 'Done' }],
    initialTasks: [{ id: 'task-1', columnId: 'todo', title: 'Complete specs' }]
  });

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <div className="flex-columns">
        {columns.map(col => (
          <div key={col.id} className="custom-column">
            <h3>{col.title}</h3>
            {tasks.filter(t => t.columnId === col.id).map(task => (
              <div 
                key={task.id} 
                onClick={() => moveTask(task.id, col.id === 'todo' ? 'done' : 'todo')}
                className="custom-card"
              >
                {task.title} (Click to Move)
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Advantages of Headless Mode

1. **Unstyled Freedom**: 100% control over CSS styles, markup classes, layout tags, animations, or alternative UI kits (like React Native, Avalonia, or native frameworks).
2. **Minimal Footprint**: Eliminates references to Tailwind layouts, Lucide icon components, and internal theme wrappers, cutting bundle footprints to bare logical scripts.
3. **Optimized Testing**: Testing custom interactions involves plain unit testing on standard JavaScript hook functions without browser render engines.
