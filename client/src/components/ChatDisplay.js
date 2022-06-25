import Chat from "./Chat"
import ChatInput from "./ChatInput"
import axios from "axios"
import {useEffect, useState} from "react"

const ChatDisplay = ({ user, clickedUser}) => {
    const userId = user?.user_id
    const clickedUserId = clickedUser?.user_id
    const [userMessages, setUsersMessages ] = useState(null)

    const getUsersMessages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/messages', {
                params: {userId: userId, correspondingUserId: clickedUserId}
            })
            setUsersMessages(response.data)
        }
        catch (error) {
            console.log(error)
        }

    }

    useEffect(() => {
        getUsersMessages()
    }, [usersMessages])

    return (
        <>
        <Chat/>
        <ChatInput/>
        </>
    )
}

export default ChatDisplay