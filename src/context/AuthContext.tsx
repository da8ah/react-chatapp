import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { StreamChat } from "stream-chat";
import wretch, { WretchResponse } from "wretch";
import config from "../config/config";
import { useLocalStorage } from "../hooks/useLocalStorage";

type AuthContext = {
	signup: UseMutationResult<WretchResponse, unknown, User, unknown>;
	login: UseMutationResult<
		{ token: string; user: User },
		unknown,
		string,
		unknown
	>;
	user?: User;
	streamChat?: StreamChat;
	logout: UseMutationResult<WretchResponse, unknown, void, unknown>;
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
export function useLoggedInAuth() {
	return useContext(Context) as AuthContext &
		Required<Pick<AuthContext, "user">>;
}

type AuthProviderProps = {
	children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const navigate = useNavigate();
	const [token, setToken] = useLocalStorage<string>("token");
	const [user, setUser] = useLocalStorage<User>("user");
	const [streamChat, setStreamChat] = useState<StreamChat>();

	const serverURL = new URL(config.SERVER_URL!);
	const signup = useMutation({
		mutationFn: (user: User) => {
			return wretch(`${serverURL}signup`, { mode: "cors" })
				.json(user)
				.post()
				.error(409, (err) => console.log(err))
				.res();
		},
		onSuccess() {
			navigate("/login");
		},
	});

	const login = useMutation({
		mutationFn: async (id: string) => {
			const response = await wretch(`${serverURL}login`, { mode: "cors" })
				.json({ id })
				.post()
				.error(401, (err) => console.log(err))
				.json();
			return response as { token: string; user: User };
		},
		onSuccess(data) {
			setToken(data.token);
			setUser(data.user);
		},
	});
	const logout = useMutation({
		mutationFn: () => {
			return wretch(`${serverURL}logout`, { mode: "cors" })
				.json({ token })
				.post()
				.error(400, (err) => console.log(err))
				.res();
		},
		onSuccess() {
			setToken(undefined);
			setUser(undefined);
			setStreamChat(undefined);
		},
	});

	useEffect(() => {
		if (token == null || user == null) return;
		const chat = new StreamChat(config.streamChatAPIKey!);

		if (chat.tokenManager.token === token && chat.userID === user.id) return;

		let isInterrupted = false;
		const promise = chat.connectUser(user, token).then(() => {
			if (isInterrupted) return;
			setStreamChat(chat);
		});

		return () => {
			isInterrupted = true;
			setStreamChat(undefined);
			promise.then(() => {
				chat.disconnectUser();
			});
		};
	}, [token, user]);

	return (
		<Context.Provider value={{ signup, login, user, streamChat, logout }}>
			{children}
		</Context.Provider>
	);
}
