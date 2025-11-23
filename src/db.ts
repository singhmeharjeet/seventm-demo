import * as d3 from "d3";
import Fuse from "fuse.js";

export type Molecule = {
	// Identifiers
	inchi: string;
	inchi_key: string;

	// Protac components
	ligase: string;
	poi: {
		uniprot_id: string;
		protien_name: string;
		gene_symbol: string;

		drug: {
			drug_bank_id: string;
			name: string;
			type: string;
		};
	};

	// Basic properties
	smiles: string;
	molecular_formula: string;
	molecular_weight: number;
	exact_mass: number;
	heavy_atom_count: number;
	ring_count: number;
	hbond_donor_count: number;
	hbond_acceptor_count: number;

	// Activity data
	dc50: string;
	dmax: string;
};

// ------------------------
//  SINGLETON STORAGE
// ------------------------
let data: Molecule[] = [];
let fuse: Fuse<Molecule> | null = null;

// ------------------------
//  LOAD CSV + BUILD FUSE
// ------------------------
export async function getData() {
	data = await d3.csv("/merged_small.csv", (d) => {
		return {
			inchi: d.inchi!,
			inchi_key: d.inchikey!,

			ligase: d.ligase!,
			poi: {
				uniprot_id: d.uniprot!,
				protien_name: d.uniprot_name!,
				gene_symbol: d.poi!,

				drug: {
					drug_bank_id: d.dbid!,
					name: d.name!,
					type: d.type!,
				},
			},

			smiles: d.smiles!,
			molecular_formula: d.molecular_formula!,
			molecular_weight: +d.molecular_weight!,
			exact_mass: +d.exact_mass!,
			heavy_atom_count: +d.heavy_atom_count!,
			ring_count: +d.ring_count!,
			hbond_donor_count: +d.hbond_donor_count!,
			hbond_acceptor_count: +d.hbond_acceptor_count!,

			dc50: d.dc50!,
			dmax: d.dmax!,
		};
	});

	// Now build Fuse index ONCE
	fuse = new Fuse(data, {
		keys: [
			// Molecule identifiers
			"inchi",
			"inchi_key",
			"molecular_formula",

			// Protac identifiers
			"ligase",
			"poi.uniprot_id",
			"poi.protien_name",
			"poi.gene_symbol",

			// Drug identifiers
			"poi.drug.drug_bank_id",
			"poi.drug.name",
		],
		threshold: 0.1,
	});

	return data;
}

// ------------------------
//  GET FUSE INSTANCE
// ------------------------
export async function getFuse() {
	if (!fuse) await getData(); // ensures fuse is built
	return fuse!;
}
