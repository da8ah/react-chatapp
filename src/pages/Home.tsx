import { useNavigate } from "react-router-dom";
import { Channel as ChannelType } from "stream-chat";
import {
	Channel,
	ChannelHeader,
	ChannelList,
	ChannelListMessengerProps,
	Chat,
	LoadingIndicator,
	MessageInput,
	MessageList,
	useChatContext,
	Window,
} from "stream-chat-react";
import { DefaultStreamChatGenerics } from "stream-chat-react/dist/types/types";
import { Button } from "../components/Button";
import { useLoggedInAuth } from "../context/AuthContext";

export function Home() {
	const { user, streamChat } = useLoggedInAuth();
	if (streamChat == null) return <LoadingIndicator />;

	return (
		<Chat client={streamChat}>
			<ChannelList
				List={Channels}
				sendChannelsToList
				filters={{ members: { $in: [user.id] } }}
			/>
			<Channel>
				<Window>
					<ChannelHeader />
					<MessageList />
					<MessageInput />
				</Window>
			</Channel>
		</Chat>
	);
}

function Channels({ loadedChannels }: ChannelListMessengerProps) {
	const navigate = useNavigate();
	const { channel: activeChannel, setActiveChannel } = useChatContext();
	const { logout, streamChat } = useLoggedInAuth();

	async function deleteChannel(
		channel: ChannelType<DefaultStreamChatGenerics>,
	) {
		const res = channel.data?.own_capabilities as string[];
		if (res.indexOf("delete-channel") === -1) {
			console.log("Not allowed!");
			return;
		}

		streamChat!.channel(channel.type, channel.id!).delete();
	}

	return (
		<div className="w-60 flex flex-col gap-4 m-3 h-full">
			<Button
				className="bg-teal-600 hover:bg-green-500 focus:bg-green-200"
				onClick={() => navigate("/channel/new")}
			>
				New Conversation
			</Button>
			<hr className="border-gray-500" />
			{loadedChannels != null && loadedChannels.length > 0
				? loadedChannels.map((channel) => {
						const isActive = channel === activeChannel;
						const extraClasses = isActive
							? "bg-blue-500 text-white"
							: "hover:bg-blue-100 bg-gray-100";
						return (
							<button
								key={channel.id}
								onClick={() => setActiveChannel(channel)}
								onAuxClick={() => deleteChannel(channel)}
								onContextMenu={(e) => e.preventDefault()}
								disabled={isActive}
								className={`p-4 rounded-lg flex gap-3 items-center ${extraClasses}`}
							>
								{channel.data?.image && (
									<img
										src={channel.data.image}
										alt="pfp"
										className="w-10 h-10 rounded-full object-center object-cover "
									/>
								)}
								<div className="text-ellipsis overflow-hidden whitespace-nowrap">
									{channel.data?.name || channel.id}
								</div>
							</button>
						);
				  })
				: "No Conversations"}
			<hr className="border-gray-500 mt-auto" />
			<Button
				className="bg-gray-500 hover:bg-rose-700"
				onClick={() => logout.mutate()}
				disabled={logout.isLoading}
			>
				Logout
			</Button>
		</div>
	);
}
