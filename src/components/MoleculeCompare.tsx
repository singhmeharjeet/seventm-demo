import { cn } from "@/lib/utils";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

import ComparisonRadarChart from "@/components/compare/ComparisonRadarChart";
import ComparisonTable from "@/components/compare/ComparisonTable";
import DrugSelector from "@/components/compare/DrugSelector";
import { DrugCompareProvider } from "@/hooks/useDrugCompare";
import { Atom } from "lucide-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";

export type DrugData = {
	name: string;
	efficacy: number;
	toxicity: number;
	bioavailability: number;
	stability: number;
	selectivity: number;
	solubility: number;
};

const data: DrugData[] = [
	{
		name: "Aspirin",
		efficacy: 70,
		toxicity: 20,
		bioavailability: 80,
		stability: 75,
		selectivity: 65,
		solubility: 60,
	},
	{
		name: "Ibuprofen",
		efficacy: 75,
		toxicity: 25,
		bioavailability: 70,
		stability: 80,
		selectivity: 70,
		solubility: 60,
	},
	{
		name: "Paracetamol",
		efficacy: 65,
		toxicity: 15,
		bioavailability: 85,
		stability: 70,
		selectivity: 60,
		solubility: 60,
	},
];

function color(columnIndex: number) {
	const hue = (columnIndex * 137.5) % 360; // use golden angle for even distribution
	return `hsl(${hue}, 40%, 50%)`;
}

function MoleculeCompare(props: React.ComponentProps<"div">) {
	const [comparisonDrugs, setComparisonDrugs] = React.useState<
		Array<DrugData>
	>([data[0]]);

	return (
		<DrugCompareProvider>
			<Card className={cn("", props.className)} {...props}>
				<CardHeader className="">
					<div className="grid grid-cols-1 gap-2 @sm/card-header:grid-cols-2">
						<div className="col-span-1">
							<CardTitle>
								Molecular Characteristics Comparison
							</CardTitle>
							<CardDescription>
								Comparative analysis of key pharmacological
								properties
							</CardDescription>
						</div>

						<DrugSelector
							colorFn={color}
							className="col-span-1 @sm/card-header:justify-self-end"
							comparisonDrugs={comparisonDrugs}
							setComparisonDrugs={setComparisonDrugs}
							data={data}
						/>
					</div>
				</CardHeader>

				<CardContent className="@container/card-content">
					{comparisonDrugs.length === 0 && (
						<Empty className="h-full min-h-[30vh] bg-linear-to-b from-muted/50 from-30% to-background">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Atom />
								</EmptyMedia>
								<EmptyTitle>No Drug selected</EmptyTitle>
								<EmptyDescription>
									Please select a drug to begin analysis and
									visualization. or press to search
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
					<div className="grid grid-cols-1 gap-2 @3xl/card-content:grid-cols-2">
						{comparisonDrugs.length !== 0 && (
							<>
								<div className="col-span-1 max-h-[500px] min-h-[350px] w-full justify-center">
									<ComparisonRadarChart
										data={comparisonDrugs}
										colorFn={color}
									/>
								</div>

								<ComparisonTable
									className="col-span-1"
									data={comparisonDrugs}
									colorFn={color}
								/>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</DrugCompareProvider>
	);
}

export default MoleculeCompare;
