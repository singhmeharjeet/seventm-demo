import * as d3 from "d3";
import Fuse from "fuse.js";

export type ProtacRow = {
	cid: number;
	dbid: string;
	name: string;
	uniprot_name: string;
	uniprot: string;
	poi: string;
	ligase: string;
	smiles: string;
	dc50: string;
	dmax: string;
	molecular_weight: number;
	exact_mass: number;
	heavy_atom_count: number;
	ring_count: number;
	hbond_donor_count: number;
	hbond_acceptor_count: number;
	molecular_formula: string;
	inchi: string;
	inchikey: string;
};

// ------------------------
//  SINGLETON STORAGE
// ------------------------
let data: ProtacRow[] = [];
let fuse: Fuse<ProtacRow> | null = null;

// ------------------------
//  LOAD CSV + BUILD FUSE
// ------------------------
export async function getData() {
	data = (await d3.csv("/merged_small.csv", d3.autoType)) as ProtacRow[];

	// Now build Fuse index ONCE
	fuse = new Fuse(data, {
		keys: [
			"name",
			"uniprot_name",
			"dbid",
			"uniprot",
			"poi",
			"ligase",
			"smiles",
			"molecular_formula",
			"inchikey",
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
