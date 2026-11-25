"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type ChartSlice = {
  name: string
  value: number
  color: string
}

const card =
  "border border-[#2B1B14]/10 bg-white p-5"

const heading = "text-sm font-extrabold text-[#2B1B14]"
const subheading = "mt-1 text-xs text-[#7A6258]"

/** Vertical bars: good for comparing a handful of counts. */
export function StatusBarChart({
  title,
  description,
  data,
  valueLabel = "Count",
}: {
  title: string
  description: string
  data: ChartSlice[]
  valueLabel?: string
}) {
  const config: ChartConfig = {
    value: { label: valueLabel, color: "#E8452C" },
  }

  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <section className={card}>
      <h2 className={heading}>{title}</h2>
      <p className={subheading}>{description}</p>

      {total === 0 ? (
        <p className="mt-6 flex h-44 items-center justify-center border border-dashed border-[#2B1B14]/15 text-sm text-[#7A6258]">
          Nothing to chart yet.
        </p>
      ) : (
        <ChartContainer config={config} className="mt-4 h-56 w-full">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </section>
  )
}

/** Donut with a small legend: good for showing how a total is split. */
export function BreakdownDonut({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: ChartSlice[]
}) {
  const config = Object.fromEntries(
    data.map((slice) => [slice.name, { label: slice.name, color: slice.color }])
  ) as ChartConfig

  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <section className={card}>
      <h2 className={heading}>{title}</h2>
      <p className={subheading}>{description}</p>

      {total === 0 ? (
        <p className="mt-6 flex h-44 items-center justify-center border border-dashed border-[#2B1B14]/15 text-sm text-[#7A6258]">
          Nothing to chart yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative">
          <ChartContainer
            config={config}
            className="aspect-square h-48 w-48 shrink-0"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-[#2B1B14]">
              {total}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6258]">
              Total
            </span>
          </div>
        </div>

        <ul className="grid w-full flex-1 gap-2">
          {data.map((slice) => (
            <li
              key={slice.name}
              className="flex items-center justify-between gap-3 text-xs text-[#7A6258]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate font-semibold text-[#2B1B14]">
                  {slice.name}
                </span>
              </span>
              <span className="font-bold tabular-nums text-[#2B1B14]">
                {slice.value}
              </span>
            </li>
          ))}
        </ul>
        </div>
      )}
    </section>
  )
}
