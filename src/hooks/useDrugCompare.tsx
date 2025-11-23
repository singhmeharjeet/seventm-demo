import React from "react";
import useMoleculeStore from "./useMoleculeStore";

const DrugCompareContext = React.createContext<any>(null);

export function DrugCompareProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { selectedMolecule } = useMoleculeStore();
	const [selectedDrugs, setSelectedDrugs] = React.useState<string[]>([]);

	const value = {
		primary: selectedMolecule,
		selectedDrugs,
		setSelectedDrugs,
	};

	return (
		<DrugCompareContext.Provider value={value}>
			{children}
		</DrugCompareContext.Provider>
	);
}

export function useDrugCompare() {
	const context = React.useContext(DrugCompareContext);
	if (!context) {
		throw new Error(
			"useDrugCompare must be used within a DrugCompareProvider",
		);
	}
	return context;
}
