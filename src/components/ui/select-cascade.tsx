import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CascadeOption {
  value: string;
  label: string;
  children?: CascadeOption[];
}

interface SelectCascadeProps {
  label?: string;
  options: CascadeOption[];
  value: string;
  onChange: (value: string, parentValue?: string) => void;
  childValue?: string;
  onChildChange?: (value: string) => void;
  placeholder?: string;
  childPlaceholder?: string;
  childLabel?: string;
  error?: string;
  childError?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectCascade({
  label,
  options,
  value,
  onChange,
  childValue,
  onChildChange,
  placeholder = "Selecione...",
  childPlaceholder = "Selecione...",
  childLabel,
  error,
  childError,
  required,
  disabled,
}: SelectCascadeProps) {
  const selectedOption = options.find((o) => o.value === value);
  const childOptions = selectedOption?.children || [];

  const handleParentChange = (newValue: string) => {
    onChange(newValue);
    if (onChildChange) {
      onChildChange("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Select value={value} onValueChange={handleParentChange} disabled={disabled}>
          <SelectTrigger className={cn(error && "border-destructive")}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {childOptions.length > 0 && onChildChange && (
        <div className="space-y-2">
          {childLabel && (
            <Label className="text-sm font-medium">
              {childLabel}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          <Select
            value={childValue}
            onValueChange={onChildChange}
            disabled={disabled || !value}
          >
            <SelectTrigger className={cn(childError && "border-destructive")}>
              <SelectValue placeholder={childPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {childOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {childError && <p className="text-xs text-destructive">{childError}</p>}
        </div>
      )}
    </div>
  );
}
