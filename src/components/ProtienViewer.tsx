import React, { useEffect, useRef, useState } from "react";

import * as $3Dmol from "3dmol";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import useMoleculeStore from "@/hooks/useMoleculeStore";
import { useOpenBabel } from "@/hooks/useOpenbabel";
import { useRDKit } from "@/hooks/useRDKit";
import { Skeleton } from "./ui/skeleton";

export default function ProtienViewer(props: React.ComponentProps<"div">) {
	const { selectedMolecule } = useMoleculeStore();
	const [selectedCluster, setSelectedCluster] = useState<number>(0);
	const [clusterPDB, setClusterPDB] = useState<string[]>([]);
	return (
		<Card className={cn("", props.className)} {...props}>
			<CardHeader>
				<div className="grid grid-cols-1 gap-2 @sm/card-header:grid-cols-2">
					<div className="col-span-1">
						<CardTitle>Conformational Analysis</CardTitle>
						<CardDescription>GPCR Target Structure</CardDescription>
					</div>
					<div className="col-span-1 @sm/card-header:justify-self-end">
						<Select
							onValueChange={(value) => {
								const clusterIndex =
									parseInt(value.replace("cluster", "")) - 1;
								setSelectedCluster(clusterIndex);
							}}
							value={`cluster${selectedCluster + 1}`}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select a cluster" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Conformers</SelectLabel>
									{clusterPDB.map((_, index) => (
										<SelectItem
											key={index}
											value={`cluster${index + 1}`}
										>
											Conformer {index + 1}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex w-full flex-col gap-2">
				<ConformerViewer
					smiles={selectedMolecule?.smiles ?? ""}
					selectedCluster={selectedCluster}
					setSelectedCluster={setSelectedCluster}
					clusterPDB={clusterPDB}
					setClusterPDB={setClusterPDB}
				/>

				<div className="grid grid-cols-3 gap-2">
					{/* Render any remaining simple scalar fields from selectedMolecule */}
					{selectedMolecule &&
						Object.entries(selectedMolecule)
							.filter(([key, value]) => {
								const excluded = new Set([
									"smiles",
									"ligase",
									"uniprot_name",
									"poi",
									"inchi",
								]);
								if (excluded.has(key)) return false;
								if (value == null || value === "") return false;
								const t = typeof value;
								return (
									t === "string" ||
									t === "number" ||
									t === "boolean"
								);
							})
							.map(([key, value]) => {
								const label = key
									.replace(/[_-]/g, " ")
									.replace(/\b\w/g, (c) => c.toUpperCase());
								return (
									<Item
										key={key}
										variant="outline"
										className="flex max-w-full items-start"
									>
										<ItemContent className="w-full overflow-hidden">
											<ItemTitle className="line-clamp-1">
												{String(value)}
											</ItemTitle>
											<ItemDescription className="line-clamp-1">
												{label}
											</ItemDescription>
										</ItemContent>
									</Item>
								);
							})}
				</div>
			</CardContent>
		</Card>
	);
}

interface ConformerViewerProps {
	smiles: string;
	numConformers?: number;

	selectedCluster: number;
	setSelectedCluster: (index: number) => void;

	clusterPDB: string[];
	setClusterPDB: (pdbs: string[]) => void;
}

export function ConformerViewer({
	smiles,
	numConformers = 5,
	selectedCluster,
	setSelectedCluster = () => {},
	clusterPDB = [],
	setClusterPDB = () => {},
}: ConformerViewerProps) {
	const OB = useOpenBabel();
	const { RDKit, ready } = useRDKit();

	useEffect(() => {
		async function generateConformers() {
			if (!OB || !RDKit) return;

			console.log(OB);

			const mol = new OB.OBMol(); // similes >> OBMol >> mol
			const conv = new OB.ObConversionWrapper();

			try {
				// 1. Create OBMol from SMILES
				conv.setInFormat("", "smi"); // input = SMILES
				conv.setOutFormat("", "pdb"); // output = 3D MOL

				conv.readString(mol, smiles);

				const gen3d = OB.OBOp.FindType("Gen3D");
				if (!gen3d.Do(mol, "")) {
					throw new Error("CAN'T GENERATE 3D COORDINATES");
				}

				const outData = conv.writeString(mol, false);
				const outURI =
					"data:text/plain;charset=utf-8," +
					encodeURIComponent(outData);

				setClusterPDB(
					Array.from({ length: numConformers }, () => outURI),
				);
				setSelectedCluster(0);
			} catch (err) {
				console.error("Error generating conformers:", err);
			} finally {
				conv.delete();
				mol.delete();
			}
		}

		generateConformers();
	}, [smiles, OB, RDKit, setClusterPDB, setSelectedCluster, numConformers]);

	if (!OB || !ready) return <Skeleton className="aspect-square w-full" />;

	return (
		<MolViewer
			data={clusterPDB[selectedCluster] || ""}
			i={selectedCluster}
		/>
	);
}

// Nicholas Rego and David Koes
// 3Dmol.js: molecular visualization with WebGL
// Bioinformatics (2015) 31 (8): 1322-1324 doi:10.1093/bioinformatics/btu829

function MolViewer({
	data,
	i,
	config = { backgroundColor: "white" },
}: {
	data: string;
	i: number;
	config?: { backgroundColor: string };
	style?: React.CSSProperties;
}) {
	const viewerRef = useRef<HTMLDivElement | null>(null);
	const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);

	useEffect(() => {
		if (!viewerRef.current || !data) return;

		$3Dmol.get(data, function (retrievedData: string) {
			viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
				defaultcolors: $3Dmol.elementColors.rasmol,
			});

			const v = viewerInstance.current;

			// v.clear();
			v.addModel(retrievedData, "pdb"); // make sure `data` is a valid PDB string
			v.setStyle({}, { stick: {} });
			v.rotate(90 * i, "y");

			v.zoomTo();
			v.render();
		});
	}, [data, config, i]);

	return <div ref={viewerRef} className="relative aspect-square w-full" />;
}
