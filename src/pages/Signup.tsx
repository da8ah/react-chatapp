import { FormEvent, useRef } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";

export function Signup() {
	const { signup } = useAuth();
	const userNameRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const imageURLRef = useRef<HTMLInputElement>(null);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (signup.isLoading) return;

		const username = userNameRef.current?.value;
		const name = nameRef.current?.value;
		const imageURL = imageURLRef.current?.value;
		if (username == null || username === "" || name == null || name === "")
			return;

		signup.mutate({ id: username, name, image: imageURL });
	}

	return (
		<>
			<h1 className="text-2xl font-bold mb-8 text-center">Create new User</h1>
			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
			>
				<label htmlFor="userName">Username</label>
				<Input ref={userNameRef} id="userName" pattern="\S*" required />
				<label htmlFor="name">Name</label>
				<Input ref={nameRef} id="name" required />
				<label htmlFor="imageURL">Image URL</label>
				<Input ref={imageURLRef} id="imageURL" />
				<Button
					disabled={signup.isLoading}
					type="submit"
					className="col-span-full"
				>
					{signup.isLoading ? "Loading..." : "Sign Up"}
				</Button>
			</form>
		</>
	);
}
