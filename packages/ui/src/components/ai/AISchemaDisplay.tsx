import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Info, HelpCircle, ChevronRight, ChevronDown, Brackets, Layers, CheckSquare } from 'lucide-react';

export interface SchemaField {
  /** The key/name of the schema property */
  name: string;
  /** Primitive or structural type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | string;
  /** Explanatory documentation of what this field expects */
  description?: string;
  /** Whether the parameter is mandatory */
  required?: boolean;
  /** Nested properties under an object or array schema */
  children?: SchemaField[];
}

export interface AISchemaDisplayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title of the schema structure (e.g., "retrieve_client_invoice: Parameters") */
  title: string;
  /** High-level description of what this schema validates */
  description?: string;
  /** Structured fields conforming to the hierarchical schema layout */
  fields: SchemaField[];
  /** Controlled expansion state */
  open?: boolean;
  /** Default expansion state if uncontrolled */
  defaultOpen?: boolean;
}

/**
 * Visual nested type/JSON-schema renderer with expandable nodes, badge indicators,
 * and high-fidelity code-like aesthetics. Ideal for tool validators or API parameters representation.
 */
export const AISchemaDisplay = React.forwardRef<HTMLDivElement, AISchemaDisplayProps>(
  ({
    title,
    description,
    fields,
    open: controlledOpen,
    defaultOpen = true,
    className,
    ...props
  }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const handleToggle = () => {
      if (!isControlled) {
        setUncontrolledOpen(!isOpen);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-gray-200 dark:border-white/5 bg-white/30 dark:bg-zinc-950/20 shadow-sm backdrop-blur-md overflow-hidden transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Accordion Trigger Header */}
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-100/30 dark:hover:bg-white/[0.01]"
        >
          <div className="flex items-start gap-3 min-w-0">
            {/* Brackets icon bubble */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shadow-sm shadow-purple-500/5">
              <Brackets className="h-4 w-4" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <h4 className="text-xs font-black text-gray-800 dark:text-zinc-200 tracking-tight font-sans">
                {title}
              </h4>
              {description && (
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium leading-relaxed truncate max-w-[320px] sm:max-w-md">
                  {description}
                </p>
              )}
            </div>
          </div>

          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-250 dark:text-zinc-500",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dynamic transition grid wrapper */}
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}>
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 dark:border-white/5 p-4 bg-gray-50/10 dark:bg-black/5">
              <div className="space-y-1 bg-white/70 dark:bg-zinc-950/80 rounded-xl p-3 border border-gray-200/70 dark:border-zinc-900/50">
                {fields.map((field) => (
                  <SchemaRow key={field.name} field={field} depth={0} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

/* Nested recursive Row component */
function SchemaRow({ field, depth = 0 }: { field: SchemaField; depth: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = field.children && field.children.length > 0;

  // Format type tag styles
  const typeStyles: Record<string, string> = {
    string: 'text-amber-500 dark:text-amber-400 bg-amber-500/5',
    number: 'text-sky-500 dark:text-sky-400 bg-sky-500/5',
    boolean: 'text-rose-500 dark:text-rose-400 bg-rose-500/5',
    array: 'text-purple-500 dark:text-purple-400 bg-purple-500/5',
    object: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/5',
    any: 'text-gray-500 dark:text-gray-400 bg-gray-500/5'
  };

  const currentTypeStyle = typeStyles[field.type.toLowerCase()] || 'text-zinc-400 bg-zinc-500/5';

  return (
    <div className="flex flex-col">
      {/* Field item row */}
      <div 
        className="flex items-start sm:items-center justify-between gap-4 py-2 px-2.5 rounded-lg hover:bg-gray-100/60 dark:hover:bg-white/[0.02] transition-colors group/row"
        style={{ paddingLeft: `${Math.max(10, depth * 18)}px` }}
      >
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          {/* Toggle trigger if nested */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-0.5 rounded hover:bg-gray-100/70 dark:hover:bg-white/5 text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ChevronRight className={cn(
                "h-3 w-3 transition-transform duration-200",
                !collapsed && "rotate-90"
              )} />
            </button>
          ) : (
            <div className="w-4 h-4 shrink-0" />
          )}

          {/* Name & Type */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-200 group-hover/row:text-purple-600 dark:group-hover/row:text-purple-400 transition-colors">
              {field.name}
            </span>
            <span className={cn(
              "font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5",
              currentTypeStyle
            )}>
              {field.type}
            </span>
            {field.required && (
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/80">
                required
              </span>
            )}
          </div>
        </div>

        {/* Right side helper description */}
        {field.description && (
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium text-right max-w-sm truncate group-hover/row:text-zinc-900 dark:group-hover/row:text-zinc-300 transition-colors flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 opacity-40 shrink-0 hidden sm:inline" />
            <span className="hidden sm:inline">{field.description}</span>
          </div>
        )}
      </div>

      {/* Recursive Render children */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col relative before:absolute before:left-3.5 before:top-1 before:bottom-3 before:w-0.5 before:bg-zinc-200/70 dark:before:bg-white/5">
          {field.children!.map((child) => (
            <SchemaRow key={child.name} field={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

AISchemaDisplay.displayName = 'AISchemaDisplay';
