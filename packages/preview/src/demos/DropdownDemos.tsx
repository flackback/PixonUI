import React from 'react';
import { 
  Combobox, 
  ComboboxTrigger, 
  ComboboxContent, 
  ComboboxInput, 
  ComboboxList, 
  ComboboxEmpty, 
  ComboboxItem 
} from '@pixonui/react';
import { Search, ChevronDown } from 'lucide-react';

export function DropdownSearchDemo() {
  const [value, setValue] = React.useState("");
  
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
    { value: "wordpress", label: "WordPress" },
    { value: "express.js", label: "Express.js" },
    { value: "nest.js", label: "Nest.js" }
  ];

  return (
    <div className="w-full max-w-sm">
      <Combobox value={value} onValueChange={(newValue) => {
        setValue(newValue);
        console.log("Selected:", newValue);
      }}>
        <ComboboxTrigger className="w-full justify-between">
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            {frameworks.map((framework) => (
              <ComboboxItem
                key={framework.value}
                value={framework.value}
              >
                {framework.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function DropdownSimpleDemo() {
  const [value, setValue] = React.useState("");
  
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ];

  return (
    <div className="w-full max-w-sm">
      <Combobox value={value} onValueChange={(newValue) => {
        setValue(newValue);
        console.log("Selected:", newValue);
      }}>
        <ComboboxTrigger className="w-full justify-between">
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            {frameworks.map((framework) => (
              <ComboboxItem
                key={framework.value}
                value={framework.value}
              >
                {framework.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
