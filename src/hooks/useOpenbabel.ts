import { useState, useEffect } from "react";

declare global {
	interface Window {
		OpenBabelModule: any;
	}
}

export function useOpenBabel() {
	const [OB, setOB] = useState<any>(null);

	useEffect(() => {
		async function init() {
			if ((window as any).OpenBabelModule && !OB) {
				const module = (window as any).OpenBabelModule();
				module.onRuntimeInitialized = () => {
					setOB(module);
				};
			} else {
				const script = document.createElement("script");
				script.src = "/openbabel/openbabel.js";
				script.onload = () => {
					const module = (window as any).OpenBabelModule();
					module.onRuntimeInitialized = () => setOB(module);
					console.log("OpenBabel loaded");
				};
				document.body.appendChild(script);
			}
		}
		init();
	}, []);

	return OB;
}
