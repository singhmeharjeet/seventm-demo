import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { DrugData } from "../MoleculeCompare";

const RadialAreaChart = ({
	data,
	colorFn,
}: React.ComponentProps<"div"> & {
	data: DrugData[];
	colorFn: (index: number) => string;
}) => {
	const levels = 4;
	const maxValueOverride = 100;

	const svgRef = useRef<SVGSVGElement>(null);

	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const [width, setWidth] = React.useState(400);

	useEffect(() => {
		function handleResize() {
			if (svgRef.current) {
				const rect = svgRef.current.getBoundingClientRect();
				const size = Math.min(rect.width, rect.height);

				// clamp between 330 and 500
				setWidth(Math.max(300, Math.min(size, 500)));
			}
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (!data || data.length === 0) return;

		// clear
		d3.select(svgRef.current).selectAll("*").remove();

		// base svg and group centered
		const svg = d3
			.select(svgRef.current)
			.attr("width", "auto")
			.attr("height", "100%");

		const centerX = width / 2;
		const centerY = (width - 40) / 2; // leave room at bottom for legend
		const g = svg
			.append("g")
			.attr("transform", `translate(${centerX}, ${centerY})`);

		// dynamic metric keys (skip 'name')
		const keys = Object.keys(data[0]).filter(
			(k) => k !== "name",
		) as (keyof Omit<DrugData, "name">)[];

		const numAxes = keys.length;
		const outerRadius = Math.min(width, width - 80) / 2 - 20; // padding for labels
		const angleSlice = (2 * Math.PI) / numAxes;

		// compute per-axis maxes (or use override)
		const axisMaxes: number[] = keys.map((k) =>
			maxValueOverride != null
				? maxValueOverride
				: Math.max(
						1,
						...data.map((d) => {
							const val = d[k];
							return typeof val === "number" ? val : 0;
						}),
					),
		);

		// per-axis scales (0..axisMax -> 0..outerRadius)
		const rScales = axisMaxes.map((m) =>
			d3.scaleLinear().domain([0, m]).range([0, outerRadius]),
		);

		// helper: get point (x,y) for axis index and a value in that axis' units
		const pointFor = (axisIndex: number, value: number) => {
			const angle = axisIndex * angleSlice - Math.PI / 2;
			const r = rScales[axisIndex](value);
			return [r * Math.cos(angle), r * Math.sin(angle)] as [
				number,
				number,
			];
		};

		// ===== draw polygonal levels (web) instead of circles =====
		const levelGroup = g.append("g").attr("class", "levels");
		for (let level = 1; level <= levels; level++) {
			const ratio = level / levels;
			// compute points for each axis at this ratio of each axis' max
			const points = keys.map((_, i) => {
				// use axisMaxes[i] * ratio as the value on that axis
				const valueAtLevel = axisMaxes[i] * ratio;
				const [x, y] = pointFor(i, valueAtLevel);
				return `${x},${y}`;
			});
			levelGroup
				.append("polygon")
				.attr("points", points.join(" "))
				.attr("fill", "none")
				.attr("stroke", "#ccc")
				.attr("stroke-dasharray", "2,2");
		}

		// ===== axis lines and labels =====
		const axes = g.append("g").attr("class", "axes");
		keys.forEach((key, i) => {
			const angle = i * angleSlice - Math.PI / 2;
			const x = outerRadius * Math.cos(angle);
			const y = outerRadius * Math.sin(angle);

			// axis line
			axes.append("line")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", x)
				.attr("y2", y)
				.attr("stroke", "#999")
				.attr("stroke-width", 1);

			// label position a bit further than axis end
			const labelOffset = 14;
			const lx = (outerRadius + labelOffset) * Math.cos(angle);
			const ly = (outerRadius + labelOffset) * Math.sin(angle);
			axes.append("text")
				.attr("x", lx)
				.attr("y", ly)
				.attr(
					"text-anchor",
					lx > 0 ? "start" : lx < 0 ? "end" : "middle",
				)
				.attr(
					"dominant-baseline",
					ly > 0 ? "hanging" : ly < 0 ? "baseline" : "middle",
				)
				.text(key)
				.style("text-transform", "capitalize")
				.style("font-size", "11px");
		});

		// ===== radar area path generator using per-axis radii =====
		const radialPathForDatum = (d: DrugData) => {
			// build points in order
			const pts = keys.map((k, i) => {
				const v = (d[k] as number) ?? 0;
				const [x, y] = pointFor(i, v);
				return `${x},${y}`;
			});
			return pts.join(" ");
		};

		// ===== draw areas with hover/fade behavior =====
		const areaGroup = g.append("g").attr("class", "areas");
		areaGroup
			.selectAll<SVGPolygonElement, DrugData>("polygon")
			.data(data)
			.enter()
			.append("polygon")
			.attr("points", (d) => radialPathForDatum(d))
			.attr("fill", (_, i) => colorFn(i))
			.attr("fill-opacity", (_, i) =>
				hoverIndex === null || hoverIndex === i ? 0.6 : 0.08,
			)
			.attr("stroke", (_, i) => colorFn(i))
			.attr("stroke-width", 2)
			.attr("cursor", "pointer")
			.on("mouseenter", function (_ev, d) {
				const idx = data.indexOf(d);
				setHoverIndex(idx);
			})
			.on("mouseleave", () => {
				setHoverIndex(null);
			});

		// ===== optional: draw small vertex circles for hover / clarity =====
		const vertexGroup = g.append("g").attr("class", "vertices");
		data.forEach((d, di) => {
			const group = vertexGroup.append("g").attr("data-index", di);
			keys.forEach((k, ki) => {
				const v = (d[k] as number) ?? 0;
				const [x, y] = pointFor(ki, v);
				group
					.append("circle")
					.attr("cx", x)
					.attr("cy", y)
					.attr("r", 2)
					.attr("fill", colorFn(di))
					.attr(
						"opacity",
						hoverIndex === null || hoverIndex === di ? 1 : 0.05,
					);
			});
		});

		// ===== legend at bottom, horizontal, with hover interactivity =====
		const legendGroup = svg
			.append("g")
			.attr("transform", `translate(${width / 2}, ${centerY * 2 + 10})`); // position relative to svg bottom area
		// we'll create legend items from right-to-left to make positioning easy

		const paddingBetween = 16;

		// compute widths for each label so spacing is stable
		const temp = svg.append("g").attr("visibility", "hidden");
		const labelWidths = data.map((d) => {
			const t = temp
				.append("text")
				.text(d.name)
				.style("font-size", "12px");
			const bbox = (t.node() as SVGTextElement).getBBox();
			t.remove();
			return bbox.width;
		});

		// compute total width and set start to center the legend
		const entriesWidths = labelWidths.map(
			(w) => 12 + 6 + w + paddingBetween,
		);
		const totalLegendWidth = entriesWidths.reduce((a, b) => a + b, 0);
		let startX = -totalLegendWidth / 2;

		data.forEach((d, i) => {
			const gItem = legendGroup
				.append("g")
				.attr("transform", `translate(${startX}, 0)`)
				.style("cursor", "pointer")
				.on("mouseenter", () => setHoverIndex(i))
				.on("mouseleave", () => setHoverIndex(null));

			gItem
				.append("rect")
				.attr("width", 12)
				.attr("height", 12)
				.attr("y", -12)
				.attr("fill", colorFn(i));

			gItem
				.append("text")
				.attr("x", 12 + 6)
				.attr("y", -2)
				.text(d.name)
				.style("font-size", "12px")
				.attr("alignment-baseline", "middle");

			startX += entriesWidths[i];
		});

		// cleanup temporary node if any (should be gone already)
		temp.remove();
	}, [data, colorFn, width, hoverIndex]);

	return <svg ref={svgRef} style={{ display: "block" }} />;
};

export default RadialAreaChart;
