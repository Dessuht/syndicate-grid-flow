import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: Record<typeof THEMES[keyof typeof THEMES], string> }
    | { theme: Record<typeof THEMES[keyof typeof THEMES], string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const [activeId, setActiveId] = React.useState<string>();
  const value = React.useMemo(
    () => ({
      config,
      setActiveId,
    }),
    [config]
  );

  return (
    <ChartContext.Provider value={value}>
      <div
        data-chart={id}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-tooltip-content]:rounded-lg [&_.recharts-tooltip-content]:bg-background [&_.recharts-tooltip-content]:border [&_.recharts-tooltip-content]:text-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-dot[r]:stroke-border] [&_.recharts-bar_rectangle]:stroke-border",
          "relative",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => ('theme' in config) || ('color' in config)
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      ('theme' in itemConfig && itemConfig.theme?.[theme as keyof typeof itemConfig.theme]) ||
      ('color' in itemConfig && itemConfig.color);
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    label?: any;
    labelKey?: string;
    labelFormatter?: (value: any, name: any) => React.ReactNode;
    formatter?: (value: any, name: any) => React.ReactNode;
    indicator?: "line" | "dot" | "dashed";
    hideLabel?: boolean;
    hideIndicator?: boolean;
  }
>(
  (
    {
      active,
      label,
      labelKey,
      labelFormatter,
      formatter,
      indicator = "line",
      hideLabel = false,
      hideIndicator = false,
      className,
      ...props
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active) {
      return null;
    }

    const tooltipPayload = props as any;
    const payload = tooltipPayload.payload || [];

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && (
          <div className="flex items-center gap-1.5">
            {payload.map((item: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-[2px]",
                  indicator === "dot" && "rounded-full",
                  indicator === "dashed" && "rounded-[2px]"
                )}
                style={{
                  backgroundColor: (config[item.name as keyof typeof config] as any)?.color,
                }}
              />
            ))}
            {label && labelFormatter ? labelFormatter(label, payload[0]?.name) : label}
          </div>
        )}
        {payload.map((item: any, index: number) => {
          const configColor = config[item.name as keyof typeof config] as any;
          return (
            <div key={index} className="flex items-center gap-1.5">
              {!hideIndicator && (
                <div
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-[2px]",
                    indicator === "dot" && "rounded-full",
                    indicator === "dashed" && "rounded-[2px]"
                  )}
                  style={{
                    backgroundColor: configColor?.color,
                  }}
                />
              )}
              {configColor?.label}
              {formatter ? (
                formatter(item.value, item.name)
              ) : (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }
>(
  ({ className, hideIcon = false, nameKey, ...props }, ref) => {
    const { config } = useChart();

    const legendProps = props as any;
    const payload = legendProps.payload || [];

    if (!payload.length || hideIcon) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          className
        )}
        {...props}
      >
        {payload.map((item: any, index: number) => {
          const configColor = config[item.name as keyof typeof config] as any;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>*:first-child]:shrink-0"
              )}
            >
              <div
                className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: configColor?.color,
                }}
              />
              {configColor?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  const configPayloadKey = (
    payloadPayload && "dataKey" in payloadPayload && typeof payloadPayload.dataKey === "string"
      ? payloadPayload.dataKey
      : "value"
  ) as keyof typeof config;

  return configPayloadKey ? config[configPayloadKey] : undefined;
}

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};