import { useState, useEffect } from "react";
import type { RDKitModule } from "@rdkit/rdkit";

declare global {
	interface Window {
		RDKit: RDKitModule;
	}
}

let rdkitLoadingPromise: Promise<RDKitModule> | null = null;

function loadRDKit(): Promise<RDKitModule> {
	if (!rdkitLoadingPromise) {
		rdkitLoadingPromise = import("@rdkit/rdkit") // or path to your RDKit bundle
			.then(() => {
				try {
					console.log("Initializing RDKit...");
					return window.initRDKitModule();
				} catch (err) {
					console.error("Error initializing RDKit:", err);
					throw err;
				}
			})
			.then((instance) => {
				window.RDKit = instance;
				return instance;
			});
	}
	return rdkitLoadingPromise;
}

export function useRDKit() {
	const [RDKit, setRDKit] = useState<RDKitModule | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;

		loadRDKit()
			.then((instance) => {
				if (mounted) setRDKit(instance);
			})
			.catch((err) => {
				console.error("Failed to load RDKit", err);
				if (mounted) setError(err as Error);
			});

		return () => {
			mounted = false;
		};
	}, []);

	return { RDKit, error, ready: !!RDKit };
}
