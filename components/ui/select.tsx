"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectGroup = SelectPrimitive.Group;

const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger ref={ref} data-ui="select-trigger" className={cn("ux-select-trigger", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild><ChevronDown size={18} aria-hidden="true" className="ux-select-chevron" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  ({ className, children, position = "popper", sideOffset = 6, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content ref={ref} data-ui="select-content" position={position} sideOffset={sideOffset} className={cn("ux-select-content", className)} {...props}>
        <SelectPrimitive.ScrollUpButton className="ux-select-scroll"><ChevronUp size={16} aria-hidden="true" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="ux-select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ux-select-scroll"><ChevronDown size={16} aria-hidden="true" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item ref={ref} data-ui="select-item" className={cn("ux-select-item", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ux-select-check"><Check size={16} aria-hidden="true" /></SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = "SelectItem";

type Option = { value: string; label: string; disabled?: boolean };
function optionText(node: React.ReactNode): string {
  return React.Children.toArray(node).map(child => React.isValidElement<{ children?: React.ReactNode }>(child) ? optionText(child.props.children) : String(child)).join("");
}
function readOptions(children: React.ReactNode): Option[] {
  return React.Children.toArray(children).flatMap(child => {
    if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return [];
    if (child.type === React.Fragment) return readOptions(child.props.children);
    if (child.type !== "option") return [];
    const label = child.props.label ?? optionText(child.props.children).trim();
    return [{ value: String(child.props.value ?? label), label, disabled: child.props.disabled }];
  });
}

type SelectInputProps = React.AriaAttributes & Pick<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "value" | "defaultValue" | "name" | "required" | "disabled" | "id" | "className" | "form" | "autoComplete" | "onChange"> & {
  onValueChange?: (value: string) => void;
};

// The native control retains empty-value validation, FormData, autofill and form reset.
// Radix uses a nonempty key for the selectable “Semua” / placeholder option.
const SelectInput = React.forwardRef<HTMLButtonElement, SelectInputProps>(function SelectInput(
  { children, value, defaultValue, onValueChange, onChange, name, required, disabled, id, className, form, autoComplete, ...props }, forwardedRef
) {
  const options = React.useMemo(() => readOptions(children), [children]);
  const emptyKey = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const nativeRef = React.useRef<HTMLSelectElement>(null);
  const errorId = React.useId();
  const resetValue = String(defaultValue ?? options.find(option => !option.disabled)?.value ?? "");
  const [localValue, setLocalValue] = React.useState(resetValue);
  const [invalid, setInvalid] = React.useState(false);
  const current = value === undefined ? localValue : String(value);
  const selected = options.find(option => option.value === current);
  const setValue = (next: string) => {
    const native = nativeRef.current;
    if (!native) return;
    native.value = next;
    native.dispatchEvent(new Event("change", { bubbles: true }));
  };
  React.useImperativeHandle(forwardedRef, () => triggerRef.current!);
  React.useEffect(() => {
    const ownerForm = nativeRef.current?.form;
    const reset = () => { setInvalid(false); setLocalValue(resetValue); };
    ownerForm?.addEventListener("reset", reset);
    return () => ownerForm?.removeEventListener("reset", reset);
  }, [resetValue]);
  const describedBy = [props["aria-describedby"], invalid ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return <>
    <Select value={current === "" ? emptyKey : current} onValueChange={next => setValue(next === emptyKey ? "" : next)} disabled={disabled}>
      <SelectTrigger {...props} ref={triggerRef} id={id} className={className} disabled={disabled} aria-required={required || undefined} aria-invalid={invalid || props["aria-invalid"]} aria-describedby={describedBy}>
        <SelectValue>{selected?.label ?? "Pilih opsi"}</SelectValue>
      </SelectTrigger>
      <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value === "" ? emptyKey : option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
    <select ref={nativeRef} className="ux-select-native" aria-hidden="true" tabIndex={-1} name={name} form={form} required={required} disabled={disabled} autoComplete={autoComplete} value={current} onChange={event => { const next = event.target.value; setLocalValue(next); setInvalid(false); onValueChange?.(next); onChange?.(event); }} onInvalid={event => { event.preventDefault(); setInvalid(true); if (!event.currentTarget.form || event.currentTarget.form.querySelector(":invalid") === event.currentTarget) triggerRef.current?.focus(); }}>
      {children}
    </select>
    {invalid && <small id={errorId} className="ux-select-error" role="alert">Pilih salah satu opsi.</small>}
  </>;
});
SelectInput.displayName = "SelectInput";

export { Select, SelectValue, SelectGroup, SelectTrigger, SelectContent, SelectItem, SelectInput };
