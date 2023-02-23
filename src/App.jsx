import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

let socket;
const CONNECTION_PORT = 'https://chatroom-backend-yadav106.onrender.com'

function App() {

	// Before logging in
	const [loggedIn, setLoggedIn] = useState(false);
	const [room, setRoom] = useState("");
	const [userName, setUserName] = useState("");

	// After logging in
	const [message, setMessage] = useState("");
	const [messageList, setMessageList] = useState([]);

	useEffect(() => {
		socket = io(CONNECTION_PORT);
	}, [CONNECTION_PORT])

	useEffect(() => {
		socket.on('receive_message', (data) => {
			setMessageList([...messageList, data]);
		})
	})

	const connectToRoom = () => {
		setLoggedIn(true);
		
		let connectionInfo = {
			room: room,
			userName: userName
		}
		socket.emit('join_room', connectionInfo);
	}

	const sendMessage = async () => {
		
		let messageContent = {
			room: room,
			content: {
				message: message,
				author: userName
			},
		}
		await socket.emit('send_message', messageContent);
		setMessageList([...messageList, messageContent.content]);
		setMessage('');
	}

	const logout = async () => {
		const userData = {
			room: room,
			userName: userName
		}
		await socket.emit('leave_room', userData);
		setLoggedIn(false);
		setMessageList([]);
	}
	
	return (
	<div className='App'>
		{
			!loggedIn 
			? 
			<div className='logIn'>
				<div className='inputs'>
					<input type='text' placeholder='Name...' onChange={(e) => setUserName(e.target.value)}/>
					<input type='text' placeholder='Room...' onChange={(e) => setRoom(e.target.value)}/>
				</div>
				<button onClick={connectToRoom}>Enter Chat</button>
			</div>
			:
			<div className="main">
				<div className="roominfo">
					<h1>Room: {room}</h1>
					<h1>User: {userName}</h1>
				</div>
				<div className="chatContainer">
					<div className='messages'>
						{messageList.map((val, key) => {
							return (
							<div className="messageContainer"  key={key} id={val.author == userName ? "you" : "other"}>
								<div className='messageIndividual'>
									{val.message}
								</div>
								<h1>{val.author}</h1>
							</div>)
						})}
					</div>
					<div className="messageInputs">
						<input type='text' placeholder='Message...' value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => {
							if (e.key === 'Enter') {
								sendMessage();
							}
						}}/>
						<button onClick={sendMessage}>Send</button>
					</div>
				</div>
				<button className='logout' onClick={logout}>LOG OUT</button>
			</div>
		}
	</div>
	)
}

export default App
