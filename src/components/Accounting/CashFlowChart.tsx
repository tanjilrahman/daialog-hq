import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as d3 from "d3";

interface CashFlowDatum {
  month: string;
  total_inflow: number;
  total_outflow: number;
}

/**
 * Renders a bar chart of monthly cash inflow and outflow using D3.  Data is
 * fetched from the `monthly_cash_flow` view created in the migration.
 */
export default function CashFlowChart() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<CashFlowDatum[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("monthly_cash_flow")
        .select("*");
      if (!error && data) {
        // Convert month to a readable label (YYYY-MM)
        const parsed = data.map((d: any) => ({
          month: d3.timeFormat("%Y-%m")(new Date(d.month)),
          total_inflow: Number(d.total_inflow),
          total_outflow: Number(d.total_outflow),
        })) as CashFlowDatum[];
        setData(parsed);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.2);
    const yMax =
      d3.max(data, (d) => Math.max(d.total_inflow, d.total_outflow)) ?? 0;
    const y = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#55A7F5")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    // Y axis
    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#55A7F5");

    // Inflow bars
    g.selectAll(".inflow")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "inflow")
      .attr("x", (d) => x(d.month)!)
      .attr("y", (d) => y(d.total_inflow))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => innerHeight - y(d.total_inflow))
      .attr("fill", "#55A7F5");
    // Outflow bars
    g.selectAll(".outflow")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "outflow")
      .attr("x", (d) => x(d.month)! + x.bandwidth() / 2)
      .attr("y", (d) => y(d.total_outflow))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => innerHeight - y(d.total_outflow))
      .attr("fill", "#0A1F3D");
    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#55A7F5")
      .text("Month");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#55A7F5")
      .text("Amount");
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <svg ref={svgRef} width={500} height={300} />
    </div>
  );
}
