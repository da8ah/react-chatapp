import { createContext, ReactNode, useContext } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import wretch, { WretchResponse } from "wretch";
import config from "../config/config";
import { useNavigate } from "react-router-dom";

type AuthContext = {
	signup: UseMutationResult<WretchResponse, unknown, User, unknown>
};
type User = {
	id: string;
	name: string;
	image?: string;
};

const Context = createContext<AuthContext | null>(null);

export function useAuth() {
	return useContext(Context) as AuthContext;
}

type AuthProviderProps = {
	children: ReactNode;
};


export function AuthProvider({ children }: AuthProviderProps) {

	const navigate = useNavigate();

	const serverURL = new URL(`${config.SERVER_URL!}/signup`);
	const signup = useMutation({
		mutationFn: (user: User) => {
			return wretch(serverURL.toString(), { mode: "cors" }).json(user).post().res();
		},
		onError: (error: any) => {
			console.log(error);
		},
		onSuccess() {
			navigate("/login");
		}
	});

	return (
		<Context.Provider value={{ signup }}>
			{children}
		</Context.Provider>
	);
}
