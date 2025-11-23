import * as React from "react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { SearchIcon } from "lucide-react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import useMoleculeStore from "@/hooks/useMoleculeStore";
import type { ProtacRow } from "@/db";

import { List, type RowComponentProps } from "react-window";
import type { DebouncedState } from "use-debounce";

export function SearchBar(props: React.ComponentProps<"div">) {
	const [open, setOpen] = React.useState(false);

	const { filteredData, searchTerm, setSearchTerm, setSelectedMolecule } =
		useMoleculeStore();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<InputGroup {...props}>
				<InputGroupInput
					placeholder="Search..."
					onFocus={() => setOpen(true)}
					value={searchTerm}
					onChange={(e) => setSearchTerm?.(e.target.value)}
				/>
				<InputGroupAddon>
					<SearchIcon />
				</InputGroupAddon>
				<InputGroupAddon align="inline-end">
					<KbdGroup>
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</InputGroupAddon>
			</InputGroup>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				className="max-w-[clamp(100vw-2rem, 80vw, 100px)] p-2 md:max-w-3xl!"
			>
				<CommandInput placeholder="Type to search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup>
						{!filteredData && (
							<div className="p-4 text-center text-sm text-muted-foreground">
								Loading data...
							</div>
						)}
						<ListTable
							rows={filteredData}
							setOpen={setOpen}
							setSearchTerm={setSearchTerm}
							setSelectedMolecule={setSelectedMolecule}
						/>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}

function ListTable({
	rows,
	setOpen,
	setSearchTerm,
	setSelectedMolecule,
}: {
	rows: ProtacRow[];
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSearchTerm: DebouncedState<(value: string) => void>;
	setSelectedMolecule: React.Dispatch<React.SetStateAction<ProtacRow | null>>;
}) {
	const ref = React.useRef<HTMLDivElement>(null);

	return (
		<div className="block overflow-hidden rounded-xl" ref={ref}>
			{/* HEADER */}
			<CommandItem
				disabled
				style={{
					display: "grid",
					gridTemplateColumns:
						window.innerWidth > 768
							? "50px 1fr 2fr repeat(3, 1fr)"
							: "50px 1fr 1fr repeat(1, 1fr)",
				}}
			>
				<span>Index</span>
				<span>Drug Name</span>
				<span>POI</span>
				<span>Ligase</span>

				<span className="hidden md:block">DrugBank ID</span>
				<span className="hidden md:block">Uniprot ID</span>
			</CommandItem>

			{/* BODY */}

			<List
				rowComponent={ListRow}
				rowCount={rows.length}
				rowHeight={2}
				rowProps={{ rows, setOpen, setSearchTerm, setSelectedMolecule }}
			/>
		</div>
	);
}

function ListRow({
	index,
	rows,
	setOpen,
	setSearchTerm,
	setSelectedMolecule,
}: RowComponentProps<{
	rows: ProtacRow[];
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSearchTerm: DebouncedState<(value: string) => void>;
	setSelectedMolecule: React.Dispatch<React.SetStateAction<ProtacRow | null>>;
}>) {
	const molecule = rows[index];
	return (
		<CommandItem
			key={index}
			asChild
			onSelect={() => {
				setSearchTerm("");
				setSelectedMolecule(molecule);
				setOpen(false);
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns:
						window.innerWidth > 768
							? "50px 1fr 2fr repeat(3, 1fr)"
							: "50px 1fr 1fr repeat(1, 1fr)",
				}}
			>
				<div className="font-medium text-muted-foreground">
					{index + 1}
				</div>
				<div className="truncate font-semibold">{molecule.name}</div>
				<div className="truncate">{molecule.poi}</div>
				<div className="truncate">{molecule.ligase}</div>
				<div className="hidden truncate md:block">{molecule.dbid}</div>
				<div className="hidden truncate md:block">
					{molecule.uniprot}
				</div>
			</div>
		</CommandItem>
	);
}

export default ListTable;
