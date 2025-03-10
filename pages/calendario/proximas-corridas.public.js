"use client";

import * as React from "react";
import { CalendarLayout } from "@/components/ui/calendar";
import LayoutMainPainel from "pages/components/main-painel";
import { Card } from "@/components/ui/card";
import { addDays, format } from "date-fns";

export default function ProximasCorridas() {
  const [date, setDate] = React.useState({
    from: new Date(),
    to: addDays(new Date(), 0),
  });
  return (
    <LayoutMainPainel>
      <Card>
        <CalendarLayout
          mode="range"
          selected={date}
          onSelect={setDate}
          className=""
          disabled={(date) => date < addDays(new Date(), -1)}
        />
        <h2>
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </h2>
      </Card>
    </LayoutMainPainel>
  );
}
