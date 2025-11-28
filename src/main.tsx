import { Atom } from "lucide-react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MoleculeCompare from "./components/MoleculeCompare";
import MoleculeViewer from "./components/MoleculeViewer";
import ProtienViewer from "./components/ProtienViewer";
import { MoleculeStoreProvider } from "./hooks/useMoleculeStoreProvider";
import "./index.css";

import { SearchBar } from "@/components/SearchBar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import useMoleculeStore from "@/hooks/useMoleculeStore";
import { ModeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "./hooks/useTheme";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<MoleculeStoreProvider>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<App />
			</ThemeProvider>
		</MoleculeStoreProvider>
	</StrictMode>,
);

export function App() {
	const { selectedMolecule } = useMoleculeStore();

	return (
		<div className="@container/main mx-auto flex max-w-6xl flex-col gap-4 p-4">
			<header className="mt-8 flex flex-wrap items-start justify-between gap-2">
				<div className="">
					<h2 className="">Drug Discovery Platform</h2>
					<p>
						Molecular analysis and protein structure visualization
					</p>
				</div>

				<SearchBar className="w-full sm:max-w-xs" />
			</header>

			{!selectedMolecule ? (
				<EmptyMuted />
			) : (
				<main className="grid grid-cols-1 gap-2 @3xl/main:grid-cols-2">
					<MoleculeViewer className="col-span-1" />
					<ProtienViewer className="col-span-1" />
					<MoleculeCompare className="col-span-1 @3xl/main:col-span-2" />
				</main>
			)}

			<footer className="mt-8 w-full p-4">
				<div className="py-4 text-center text-sm text-muted-foreground flex gap-4 justify-center items-center">
					<span>
						&copy; 2025 Drug Discovery Platform. All rights
						reserved.
					</span>
					<ModeToggle />
				</div>
			</footer>
		</div>
	);
}

function EmptyMuted() {
	return (
		<Empty className="h-full min-h-[50vh] bg-linear-to-b from-muted/50 from-30% to-background">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Atom />
				</EmptyMedia>
				<EmptyTitle>No Molecule selected</EmptyTitle>
				<EmptyDescription>
					Please select a molecule to begin analysis and
					visualization. or press to search
					<KbdGroup>
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
