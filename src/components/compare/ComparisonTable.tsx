import { cn } from "@/lib/utils";
import type { DrugData } from "../MoleculeCompare";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";

export default function ComparisonTable(
	props: React.ComponentProps<"div"> & {
		data: DrugData[];
		colorFn: (index: number) => string;
	},
) {
	return (
		<div
			{...props}
			className={cn(
				"overflow-hidden rounded-xl border-2",
				props.className,
			)}
		>
			<Table>
				<TableHeader className="font-bold">
					<TableRow className="bg-secondary/70">
						<TableHead className="w-[100px] py-4">
							Charcterstic
						</TableHead>
						{props.data.map((drug) => (
							<TableHead key={drug.name} className="text-center">
								{drug.name}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.keys(props.data[0])
						.filter((key) => key !== "name")
						.map((property, i) => (
							<TableRow
								key={property}
								className="text-center text-white"
								style={{
									background:
										i % 2 === 0
											? "var(--color-background)	"
											: "var(--color-accent",
								}}
							>
								<TableCell className="py-4 text-start font-medium text-foreground capitalize">
									{property}
								</TableCell>

								{props.data.map((drug, index) => {
									const columnColor = props.colorFn(index); // compute once per column
									return (
										<TableCell key={index}>
											<span
												className="rounded-md p-1.5"
												style={{
													background: columnColor,
												}}
											>
												{
													drug[
														property as keyof DrugData
													]
												}
											</span>
										</TableCell>
									);
								})}
							</TableRow>
						))}
				</TableBody>
			</Table>
		</div>
	);
}
