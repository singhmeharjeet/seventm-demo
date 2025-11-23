import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

import useMoleculeStore from "@/hooks/useMoleculeStore";
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
import MolViewer from "./Viewer3D";

export default function ProtienViewer(props: React.ComponentProps<"div">) {
	const { selectedMolecule } = useMoleculeStore();
	const [selectedCluster, setSelectedCluster] = useState<number>(0);

	const [best_pdb, setBestPdb] = useState<string>("");

	useEffect(() => {
		async function generateBestPDB() {
			const list = await fetch(
				`https://www.ebi.ac.uk/pdbe/api/mappings/best_structures/${selectedMolecule?.poi.uniprot_id}`,
			);
			const data: Array<{
				pdb_id: string;
				coverage: number;
				resolution: number;
			}> = (await list.json())[`${selectedMolecule?.poi.uniprot_id}`];

			data.sort((a, b) => {
				if (b.coverage !== a.coverage) {
					return b.coverage - a.coverage; // Higher coverage first
				}
				return (a.resolution || 999) - (b.resolution || 999); // Lower resolution first
			});

			setBestPdb(data[0]?.pdb_id || "");

			console.log("BEST PDB", data[0]?.pdb_id || "");
		}
		generateBestPDB();
	}, [selectedMolecule?.poi.uniprot_id]);

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
									{Array(5).fill(null).map((_, index) => (
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
				{best_pdb && (
					<MolViewer
						molecule_uri={
							"https://files.rcsb.org/download/" +
							best_pdb +
							".pdb"
						}
						rotate_by={selectedCluster}
					/>
				)}

				<div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
					{selectedMolecule && (
						<>
							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{best_pdb}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										Best PDB Structure for the POI
									</ItemDescription>
								</ItemContent>
							</Item>
							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{selectedMolecule.poi.uniprot_id}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										Uniprot ID
									</ItemDescription>
								</ItemContent>
							</Item>
							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{selectedMolecule.poi.gene_symbol}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										Gene Symbol
									</ItemDescription>
								</ItemContent>
							</Item>
							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{selectedMolecule.poi.drug.name}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										Drug Name
									</ItemDescription>
								</ItemContent>
							</Item>

							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{selectedMolecule.dc50}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										DC50
									</ItemDescription>
								</ItemContent>
							</Item>

							<Item
								variant="outline"
								className="flex flex-col space-y-1 overflow-hidden rounded-xl border p-3"
							>
								<ItemContent className="w-full">
									<ItemTitle className="text-base font-medium wrap-break-word">
										{selectedMolecule.dmax}
									</ItemTitle>
									<ItemDescription className="text-sm wrap-break-word text-muted-foreground">
										Dmax
									</ItemDescription>
								</ItemContent>
							</Item>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
