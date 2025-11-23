import React from "react";

import type { ProtacRow } from "@/db";
import type { DebouncedState } from "use-debounce";

export const MoleculeStoreContext = React.createContext<{
	selectedMolecule: ProtacRow | null;
	setSelectedMolecule: React.Dispatch<React.SetStateAction<ProtacRow | null>>;
	searchTerm: string;
	setSearchTerm: DebouncedState<(value: string) => void>;
	filteredData: ProtacRow[];
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
