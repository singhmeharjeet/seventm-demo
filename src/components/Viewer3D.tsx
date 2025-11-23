// Nicholas Rego and David Koes
// 3Dmol.js: molecular visualization with WebGL
// Bioinformatics (2015) 31 (8): 1322-1324 doi:10.1093/bioinformatics/btu829

import { useRef, useEffect } from "react";
import * as $3Dmol from "3dmol";

/**
 * Renders a 3D view of the encoded protien structure
 * @param data URI encoded data
 * @returns div containing 3Dmol viewer
 */
export default function Viewer3D({
	molecule_uri: data,
	rotate_by: i,
}: {
	molecule_uri: string;
	rotate_by: number;
}) {
	const viewerRef = useRef<HTMLDivElement | null>(null);
	const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);

	useEffect(() => {
		if (!viewerRef.current) return;
		if (data === "") return;

		$3Dmol.get(data, (retrievedData: string) => {
			viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
				defaultcolors: $3Dmol.elementColors.rasmol,
			});

			const v = viewerInstance.current;

			// v.clear();
			v.addModel(retrievedData, "pdb"); // make sure `data` is a valid PDB string
			v.setStyle({}, { stick: {} });
			v.rotate(90 * i, "y");
			v.zoomTo();
			v.render();
		});
	}, [data, i]);

	return <div ref={viewerRef} className="relative aspect-square w-full" />;
}
