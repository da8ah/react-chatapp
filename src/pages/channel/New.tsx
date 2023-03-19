import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select, { SelectInstance } from "react-select";
import { Button } from "../../components/Button";
import { FullScreenCard } from "../../components/FullScreenCard";
import { Input } from "../../components/Input";
import { Link } from "../../components/Link";
import { useLoggedInAuth } from "../../context/AuthContext";

export function NewChannel() {
	const [selected, setSelected] = useState(false);

	const navigate = useNavigate();
	const { streamChat, user } = useLoggedInAuth();
	const createChannel = useMutation({
		mutationFn: ({
			name,
			memberIDs,
			imageURL,
		}: { name: string; memberIDs: string[]; imageURL?: string }) => {
			if (streamChat == null) throw Error("Not connected");
			return streamChat
				.channel("messaging", crypto.randomUUID(), {
					name,
					image: imageURL,
					members: [user.id, ...memberIDs],
				})
				.create();
		},
		onSuccess() {
			navigate("/");
		},
	});

	const nameRef = useRef<HTMLInputElement>(null);
	const imageURLRef = useRef<HTMLInputElement>(null);
	const memberIDsRef =
		useRef<SelectInstance<{ value: string; label: string }>>(null);

	const users = useQuery({
		queryKey: ["stream", "users"],
		queryFn: () =>
			streamChat!.queryUsers({ id: { $nin: ["utpl", user.id] } }, { name: 1 }),
		enabled: streamChat != null,
	});

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		const name = nameRef.current?.value;
		const imageURL = imageURLRef.current?.value;
		const selecOptions = memberIDsRef.current?.getValue();
		if (
			name == null ||
			name === "" ||
			selecOptions == null ||
			selecOptions.length === 0
		)
			return;

		createChannel.mutate({
			name,
			imageURL,
			memberIDs: selecOptions.map((option) => option.value),
		});
	}

	return (
		<FullScreenCard>
			<FullScreenCard.Body>
				<h1 className="text-2xl font-bold mb-8 text-center">
					Create new Conversation
				</h1>
				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
				>
					<label htmlFor="name">Name</label>
					<Input
						className="focus:border-green-700"
						ref={nameRef}
						id="name"
						required
					/>
					<label htmlFor="imageURL">Image URL</label>
					<Input
						className="focus:border-green-700"
						ref={imageURLRef}
						id="imageURL"
					/>
					<label htmlFor="members">Members</label>
					<Select
						styles={{
							control: (baseStyles, state) => ({
								...baseStyles,
								boxShadow: "none",
								borderColor: state.isFocused ? "green" : "darkgrey",
								":hover": { borderColor: "green" },
							}),
						}}
						classNames={{
							container: () => "w-full",
						}}
						ref={memberIDsRef}
						id="members"
						required
						isMulti
						isLoading={users.isLoading}
						options={users.data?.users.map((user) => {
							return { value: user.id, label: user.name || user.id };
						})}
						onChange={(selection) => {
							if (selection == null) return;
							(selection as []).length > 0
								? setSelected(true)
								: setSelected(false);
						}}
					/>
					<Button
						disabled={createChannel.isLoading || users.isLoading || !selected}
						type="submit"
						className="bg-teal-600 hover:bg-green-500 focus:bg-green-200 col-span-full"
					>
						{createChannel.isLoading ? "Loading..." : "Create"}
					</Button>
				</form>
			</FullScreenCard.Body>
			<FullScreenCard.BelowCard>
				<Link to={"/"}>Back</Link>
			</FullScreenCard.BelowCard>
		</FullScreenCard>
	);
}
