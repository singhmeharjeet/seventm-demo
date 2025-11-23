import React from "react";

import type { Molecule } from "@/db";
import type { DebouncedState } from "use-debounce";

export const MoleculeStoreContext = React.createContext<{
	selectedMolecule: Molecule | null;
	setSelectedMolecule: React.Dispatch<React.SetStateAction<Molecule | null>>;
	searchTerm: string;
	setSearchTerm: DebouncedState<(value: string) => void>;
	filteredData: Molecule[];
}>({
	selectedMolecule: null,
	setSelectedMolecule: () => {},
	searchTerm: "",
	// @ts-expect-error -- IGNORE --
	setSearchTerm: () => {},
	filteredData: [],
});

const useMoleculeStore = () => {
	const context = React.useContext(MoleculeStoreContext);
	if (!context) {
		throw new Error(
			"useSelectedMolecule must be used within a SelectedMoleculeProvider",
		);
	}
	return context;
};

export default useMoleculeStore;
