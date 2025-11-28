import * as d3 from "d3";
import React from "react";
import type { DrugData } from "../MoleculeCompare";
import { Card, CardContent } from "../ui/card";

export default function RadialAreaChart({
	data,
	colorFn,
	levels = 3,
	...props
}: React.ComponentProps<"svg"> & {
	data: DrugData[];
	levels?: number;
	colorFn: (index: number) => string;
}) {
	const svgRef = React.useRef<SVGSVGElement>(null);
	const parentRef = React.useRef<HTMLDivElement>(null);
	const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

	const [width, setWidth] = React.useState(0);
	const [height, setHeight] = React.useState(0);

	const chartProps = React.useMemo(() => {
		const margins = { top: 40, right: 40, bottom: 80, left: 40 };
		const usableHeight = height - margins.top - margins.bottom;
		const usableWidth = width - margins.left - margins.right;
		const axisLength = Math.min(usableWidth, usableHeight) / 2;
		const axises = Object.keys(data[0]).filter(
			(k) => k !== "name",
		) as (keyof Omit<DrugData, "name">)[];
		const axisAngleSlice = (Math.PI * 2) / axises.length;

		return {
			margins,
			usableHeight,
			usableWidth,
			axisLength,
			axises,
			axisAngleSlice,
		};
	}, [height, width, data]);

	React.useEffect(() => {
		function handleResize() {
			if (parentRef.current) {
				console.log("resizing", "width:", width, "height:", height);
				const rect = parentRef.current.getBoundingClientRect();
				setWidth(rect.width);
				setHeight(rect.height);
			}
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [height, parentRef, width]);

	React.useEffect(() => {
		if (!svgRef.current) return;

		const {
			margins,
			usableHeight,
			usableWidth,
			axisLength,
			axises,
			axisAngleSlice,
		} = chartProps;

		const svg = d3
			.select(svgRef.current)
			.attr("width", usableWidth + margins.left + margins.right)
			.attr("height", usableHeight + margins.top + margins.bottom);

		// Step 0: Clear previous contents
		svg.selectAll("*").remove();

		// Step 1: Draw the axis lines
		const centerG = svg
			.append("g")
			.attr(
				"transform",
				`translate(${margins.left + usableWidth / 2}, ${
					margins.top + usableHeight / 2
				})`,
			);

		axises.forEach((axis, i) => {
			const angle = i * axisAngleSlice - Math.PI / 2;
			const x = axisLength * Math.cos(angle);
			const y = axisLength * Math.sin(angle);
			centerG
				.append("line")
				.attr("x2", x)
				.attr("y2", y)
				.attr("stroke", "var(--color-muted-foreground)")
				.attr("stroke-opacity", 0.5)
				.attr("stroke-width", 1);

			centerG
				.append("text")
				.attr("x", x * 1.1)
				.attr("y", y * 1.1)
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "middle")
				.attr("fill", "var(--color-muted-foreground)")
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.text(axis[0].toUpperCase() + axis.slice(1));
		});

		// Step 2: Draw the tick lines
		for (let level = 1; level <= levels; level++) {
			const gridLine = d3
				.lineRadial<number>()
				.angle((_, i) => i * axisAngleSlice)
				.radius(axisLength * (level / levels))
				.curve(d3.curveLinearClosed);

			centerG
				.append("path")
				.attr("d", gridLine(d3.range(axises.length)))
				.attr("fill", "none")
				.attr("stroke", "var(--color-muted-foreground)")
				.attr("stroke-opacity", 0.5)
				.attr("stroke-width", 0.75);
		}

		// Step 3: Draw the data areas
		// Rules: if hoverIndex is null, render all with normal opacity
		// if hoverIndex is set, render that one with normal opacity and others with low opacity
		data.forEach((d, dataIndex) => {
			const areaLine = d3
				.lineRadial<number>()
				.angle((_, i) => i * axisAngleSlice)
				.radius((_, i) => {
					const axis = axises[i];
					const value = d[axis] as number;
					return (value / 100) * axisLength;
				})
				.curve(d3.curveLinearClosed);

			centerG
				.append("path")
				.attr("d", areaLine(d3.range(axises.length)))
				.attr("fill", colorFn(dataIndex))
				.attr("fill-opacity", 0.6)
				.attr("stroke", colorFn(dataIndex))
				.attr("stroke-width", 2)
				.attr(
					"opacity",
					hoverIndex === null || hoverIndex === dataIndex ? 0.8 : 0.1,
				)
				.attr("z-index", hoverIndex === dataIndex ? 10 : 1)
				.on("mouseenter", () => setHoverIndex(dataIndex))
				.on("mouseleave", () => setHoverIndex(null))
				.attr("transform", "scale(0.95)")
				.transition()
				.duration(300)
				.ease(d3.easeBack)
				.attr("transform", "scale(1)");

			if (hoverIndex === dataIndex) {
				// render values at each vertex
				axises.forEach((axis, i) => {
					const value = d[axis] as number;
					const angle = i * axisAngleSlice - Math.PI / 2;
					const radius = (value / 100) * axisLength;
					const x = radius * Math.cos(angle);
					const y = radius * Math.sin(angle);

					centerG
						.append("text")
						.attr("x", x * 1.1 + 5)
						.attr("y", y * 1.1 + 5)
						.attr("text-anchor", "middle")
						.attr("font-weight", "bold")
						.attr("dominant-baseline", "middle")
						.attr("fill", "var(--color-muted-foreground)")
						.attr("font-size", 12)
						.text(value.toString())
						.attr("opacity", 0)
						.text(value.toString())
						.transition()
						.duration(300)
						.ease(d3.easeCubicIn)
						.attr("opacity", 1);
				});
			}
		});

		// Step 4: Draw the legend
		// Step 4: Draw the legend container
		const legend = svg
			.append("foreignObject")
			.attr("x", margins.left)
			.attr("y", margins.top + usableHeight + margins.bottom / 2)
			.attr("width", usableWidth)
			.attr("height", margins.bottom / 2)
			.append("xhtml:div")
			.style("display", "flex")
			.style("gap", "10px")
			.style("align-items", "center")
			.style("justify-content", "center")
			.style("flex-wrap", "wrap");

		data.forEach((d, dataIndex) => {
			const item = document.createElement("div");
			item.style.display = "flex";
			item.style.alignItems = "center";
			item.style.background = colorFn(dataIndex);
			item.style.padding = "2px 6px";
			item.style.borderRadius = "4px";
			item.style.width = "max-content";
			item.style.fontSize = "12px";
			item.style.color = "white";
			item.style.cursor = "default";
			item.style.transition = "0.2s ease";
			item.innerText = d.name;
			item.style.transition =
				"transform 0.2s ease, box-shadow 0.2s ease, opacity 0.4s";

			item.onmouseenter = () => setHoverIndex(dataIndex);
			item.onmouseleave = () => setHoverIndex(null);

			if (hoverIndex === dataIndex) {
				item.style.transform = "scale(1.05)";
				item.style.boxShadow = "0 0 8px rgba(0,0,0,0.3)";
			} else {
				item.style.transform = "scale(1)";
				item.style.boxShadow = "none";
			}

			(legend.node() as Element).appendChild(item);
		});
	}, [data, colorFn, hoverIndex, levels, chartProps]);

	return (
		<Card
			ref={parentRef}
			className="col-span-1 aspect-square w-full overflow-hidden p-0"
		>
			<CardContent className="p-0">
				<svg ref={svgRef} {...props} />
			</CardContent>
		</Card>
	);
}
