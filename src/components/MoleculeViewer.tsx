import React, { useEffect, useRef, useState } from "react";

import useMoleculeStore from "@/hooks/useMoleculeStore";
import { useOpenBabel } from "@/hooks/useOpenbabel";
import { useRDKit } from "@/hooks/useRDKit";
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
import { Skeleton } from "./ui/skeleton";
import Viewer3D from "./Viewer3D";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

export default function MoleculeViewer(props: React.ComponentProps<"div">) {
	const { selectedMolecule } = useMoleculeStore();
	const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

	return (
		<Card {...props}>
			<CardHeader>
				<div className="grid grid-cols-1 gap-2 @sm/card-header:grid-cols-2">
					<div className="col-span-1">
						<CardTitle>
							{selectedMolecule?.molecular_formula}
						</CardTitle>
						<CardDescription>Molecular Formula</CardDescription>
					</div>
					<div className="col-span-1 @sm/card-header:justify-self-end">
						<Select
							onValueChange={(value) => {
								setViewMode(value as "2D" | "3D");
							}}
							value={viewMode}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select view" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>View Mode</SelectLabel>
									<SelectItem key={0} value={`2D`}>
										2D View
									</SelectItem>
									<SelectItem key={1} value={`3D`}>
										3D View
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex w-full flex-col gap-2">
				{viewMode === "2D" ? (
					<Render2DSmiles smiles={selectedMolecule?.smiles || ""} />
				) : (
					<Render3DSmiles smiles={selectedMolecule?.smiles || ""} />
				)}

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
				<div className="flex gap-2">
					<Item
						variant="outline"
						className="flex max-w-full grow items-start ring-2 ring-blue-300"
					>
						<ItemContent className="w-full">
							<ItemTitle>{selectedMolecule?.ligase}</ItemTitle>
							<ItemDescription>E3 Ligase</ItemDescription>
						</ItemContent>
					</Item>
					<Item
						variant="outline"
						className="flex max-w-full grow items-start ring-2 ring-green-300"
					>
						<ItemContent className="w-full">
							<ItemTitle>
								{selectedMolecule?.poi.protien_name}
							</ItemTitle>
							<ItemDescription>
								Protien of Interest (POI)
							</ItemDescription>
						</ItemContent>
					</Item>
				</div>
			</CardContent>
		</Card>
	);
}

function Render2DSmiles({
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
			className="aspect-square"
			dangerouslySetInnerHTML={{ __html: svg || "" }}
		/>
	);
}

function Render3DSmiles({ smiles }: { smiles: string }) {
	const OB = useOpenBabel();

	if (!OB) return <Skeleton className="aspect-square w-full" />;

	console.log(OB);

	const mol = new OB.OBMol(); // similes >> OBMol >> PDB

	console.log(mol);
	const conv = new OB.ObConversionWrapper();

	try {
		// 1. Create OBMol from SMILES
		conv.setInFormat("", "smi"); // input = SMILES
		conv.setOutFormat("", "pdb"); // output = 3D PDB

		conv.readString(mol, smiles);

		const gen3d = OB.OBOp.FindType("Gen3D");
		if (!gen3d.Do(mol, "")) {
			throw new Error("CAN'T GENERATE 3D COORDINATES");
		}

		const outData = conv.writeString(mol, false);
		const outURI =
			"data:text/plain;charset=utf-8," + encodeURIComponent(outData);

		return <Viewer3D molecule_uri={outURI} rotate_by={0} />;
	} catch (err) {
		console.error("Error generating conformers:", err);
		return null;
	} finally {
		conv.delete();
		mol.delete();
	}
}
