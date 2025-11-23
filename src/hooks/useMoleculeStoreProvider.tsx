import { getData, getFuse, type Molecule } from "@/db";
import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { MoleculeStoreContext } from "./useMoleculeStore";
import type Fuse from "fuse.js";

export const MoleculeStoreProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	// Global selected molecule (minimal state)
	const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(
		null,
	);

	// Search term (debounced)
	const [searchTerm, setSearchTerm] = useState("");

	const [fuse, setFuse] = useState<Fuse<Molecule> | null>(null);

	// Raw data + Fuse instance stored only once
	const [data, setData] = useState<Molecule[] | null>(null);

	const debounced = useDebouncedCallback(
		// function
		(value: string) => {
			setSearchTerm(value);
		},
		// delay in ms
		1000,
	);

	// Load data once
	useEffect(() => {
		getData().then((rows) => {
			setData(rows);
		});

		getFuse().then((fuse) => {
			setFuse(fuse);
		});
	}, []);

	const filteredData = useMemo(() => {
		if (!data || !fuse) return [];

		const term = searchTerm.trim();
		if (term.length === 0) return data;

		const results = fuse.search(term).map((r) => r.item);

		return results;
	}, [data, fuse, searchTerm]);

	// Context value (memoized to avoid re-renders)
	const value = useMemo(
		() => ({
			selectedMolecule,
			setSelectedMolecule,
			searchTerm,
			setSearchTerm: debounced,
			filteredData,
		}),
		[selectedMolecule, searchTerm, filteredData, debounced],
	);

	return (
		<MoleculeStoreContext.Provider value={value}>
			{children}
		</MoleculeStoreContext.Provider>
	);
};
