import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { CopyButton } from "./ui/copy-button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "./ui/item";
import useMoleculeStore from "@/hooks/useMoleculeStore";
import { useRDKit } from "@/hooks/useRDKit";
import { Skeleton } from "./ui/skeleton";

export default function MoleculeViewer(props: React.ComponentProps<"div">) {
	const { selectedMolecule } = useMoleculeStore();

	// Generate image from RDKIT on a different worker thread

	return (
		<Card className={cn("", props.className)} {...props}>
			<CardHeader>
				<CardTitle>{selectedMolecule?.uniprot}</CardTitle>
				<CardDescription>Uniport ID</CardDescription>
			</CardHeader>
			<CardContent className="flex w-full flex-col gap-2">
				<MoleculeSVG
					smiles={selectedMolecule?.smiles || ""}
					className="aspect-square w-full"
				/>
				<Item variant="outline" className="relative flex items-start">
					<ItemContent className="w-full">
						<ItemActions>
							<CopyButton
								content={selectedMolecule?.smiles || ""}
								size="sm"
								variant={"outline"}
								className="absolute top-2 right-2"
							/>
						</ItemActions>

						<ItemTitle>SMILES</ItemTitle>
						<ItemDescription className="line-clamp-none wrap-break-word">
							{selectedMolecule?.smiles}
						</ItemDescription>
					</ItemContent>
				</Item>
				<Item variant="outline" className="flex max-w-full items-start">
					<ItemContent className="w-full">
						<ItemTitle>{selectedMolecule?.ligase}</ItemTitle>
						<ItemDescription>E3 Ligase</ItemDescription>
					</ItemContent>
				</Item>
				<Item variant="outline" className="flex max-w-full items-start">
					<ItemContent className="w-full">
						<ItemTitle>{selectedMolecule?.poi}</ItemTitle>
						<ItemDescription>
							Protien of Interest (POI)
						</ItemDescription>
					</ItemContent>
				</Item>
			</CardContent>
		</Card>
	);
}

function MoleculeSVG({
	smiles,
	...props
}: React.ComponentProps<"div"> & {
	smiles: string;
}) {
	const [svg, setSvg] = useState<string>();
	const containerRef = useRef<HTMLDivElement>(null);

	const { RDKit, ready } = useRDKit();

	// Get div dimensions

	useEffect(() => {
		async function drawMolecule() {
			const mol = RDKit?.get_mol(smiles || "invalid");
			if (!mol) {
				console.error("Invalid molecule for SMILES:", smiles);
				setSvg(""); // clear SVG
				return;
			}
			const rect = containerRef.current?.getBoundingClientRect();
			const width = rect?.width || 300;
			const height = rect?.height || 300;
			const svgStr = mol.get_svg(width, height);

			mol.delete();

			setSvg(svgStr);
		}

		drawMolecule();

		const resizeObserver = new ResizeObserver(() => {
			drawMolecule();
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [RDKit, smiles]);

	if (!ready) {
		return <Skeleton className="aspect-square w-full" />;
	}

	return (
		<div
			ref={containerRef}
			{...props}
			dangerouslySetInnerHTML={{ __html: svg || "" }}
		/>
	);
}
