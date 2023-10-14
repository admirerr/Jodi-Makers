import ChatHeader from './ChatHeader'
import MatchesDisplay from './MatchesDisplay'
import ChatDisplay from './ChatDisplay'
import {useState} from "react"

const ChatContainer = ({ user }) => {

    const [ clickedUser, setClickedUser] = useState(0)
    console.log(clickedUser);
   
const obj1={
    color : clickedUser ? "gray" : "rgb(243,33,33)",
    borderBottom: clickedUser?"solid 4px rgb(187,187,187)":"solid 4px rgb(243,33,33)"
}
const obj={
    color : clickedUser ? "rgb(243,33,33)" : "gray",
    borderBottom: clickedUser? "solid 4px rgb(243,33,33)":"solid 4px rgb(187,187,187)"
}
    return(
    <div className="chat-container">
        <ChatHeader user={user}/>
        <div>
            <button style={obj1} className="option"  onClick={() => setClickedUser(old=>{return !old})} disabled={!clickedUser}>Matches</button>
            <button style={obj}  className="option" disabled={clickedUser} onClick={() => setClickedUser(old=>{return !old})} >Chat</button>
        </div>
        {!clickedUser && <MatchesDisplay matches={user.matches} setClickedUser = {setClickedUser}/>}

        {clickedUser && <ChatDisplay user={user} clickedUser={clickedUser}/>}
    </div>
    )
}

export default ChatContainer