import * as React from "react"
import { HexColorPicker } from "react-colorful"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface ColorPickerProps {
    value: string
    onChange: (color: string) => void
    className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[220px] justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex w-full items-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: value || "transparent" }}
                        />
                        <span>{value || "Pick a color"}</span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
                <HexColorPicker color={value} onChange={onChange} />
            </PopoverContent>
        </Popover>
    )
}
