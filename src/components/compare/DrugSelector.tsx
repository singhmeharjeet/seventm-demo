import {
	MultiSelect,
	type MultiSelectOption,
} from "@/components/ui/multi-select";
import type { DrugData } from "../MoleculeCompare";

export default function DrugSelector(
	props: React.ComponentProps<"div"> & {
		data: DrugData[];
		comparisonDrugs: DrugData[];
		setComparisonDrugs: React.Dispatch<React.SetStateAction<DrugData[]>>;
		colorFn: (index: number) => string;
	},
) {
	const options: MultiSelectOption[] = props.data.map((drug, index) => {
		// Mot many list items so its fine to map over the data again
		const comparisonIndex = props.comparisonDrugs.findIndex(
			(d) => d.name === drug.name,
		);

		return {
			label: drug.name,
			value: drug.name,
			style: {
				badgeColor: props.colorFn(
					comparisonIndex !== -1 ? comparisonIndex : index,
				),
			},
		};
	});
	return (
		<div {...props}>
			<MultiSelect
				options={options}
				onValueChange={(selectedDrugs) => {
					const selectedData = props.data.filter((drug) =>
						selectedDrugs.includes(drug.name),
					);
					props.setComparisonDrugs(selectedData);
				}}
				defaultValue={[props.data[0].name]}
				placeholder="Select drugs to compare"
			/>
		</div>
	);
}
